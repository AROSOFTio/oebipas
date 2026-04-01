<?php

namespace App\Services\Reports;

use App\Models\Bill;
use App\Models\Complaint;
use App\Models\Customer;
use App\Models\Meter;
use App\Models\Payment;
use App\Models\Tariff;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ReportService
{
    public function summary(): array
    {
        return [
            'total_customers' => Customer::query()->count(),
            'active_customers' => Customer::query()->where('status', 'active')->count(),
            'total_meters' => Meter::query()->count(),
            'active_meters' => Meter::query()->where('status', 'active')->count(),
            'total_bills_generated' => Bill::query()->count(),
            'paid_bills' => Bill::query()->where('status', 'paid')->count(),
            'total_unpaid_bills' => Bill::query()->whereIn('status', ['unpaid', 'partially_paid', 'overdue'])->count(),
            'total_payments' => Payment::query()->count(),
            'unresolved_complaints' => Complaint::query()->whereIn('status', ['pending', 'in_progress'])->count(),
            'resolved_complaints' => Complaint::query()->where('status', 'resolved')->count(),
        ];
    }

    public function overview(): array
    {
        $summary = $this->summary();
        $openBills = Bill::query()
            ->whereIn('status', ['unpaid', 'partially_paid', 'overdue'])
            ->withSum('payments as paid_amount', 'amount')
            ->get(['id', 'status', 'total_amount']);

        $totalBilledAmount = (float) Bill::query()->sum('total_amount');
        $totalCollectedAmount = (float) Payment::query()->where('status', 'success')->sum('amount');
        $outstandingBalance = $this->sumOutstanding($openBills);
        $overdueExposure = $this->sumOutstanding($openBills->where('status', 'overdue'));
        $collectionRate = $totalBilledAmount > 0
            ? round(($totalCollectedAmount / $totalBilledAmount) * 100, 1)
            : 0.0;

        $activeTariff = Tariff::query()
            ->where('status', 'active')
            ->orderByDesc('effective_from')
            ->first();

        return [
            'summary' => $summary,
            'revenue_overview' => [
                'total_billed_amount' => round($totalBilledAmount, 2),
                'total_collected_amount' => round($totalCollectedAmount, 2),
                'outstanding_balance' => round($outstandingBalance, 2),
                'overdue_exposure' => round($overdueExposure, 2),
                'collection_rate' => $collectionRate,
                'average_bill_value' => round((float) Bill::query()->avg('total_amount'), 2),
                'average_units_consumed' => round((float) Bill::query()->avg('units_consumed'), 2),
            ],
            'operational_overview' => [
                'active_tariff' => $activeTariff ? [
                    'name' => $activeTariff->name,
                    'unit_price' => round((float) $activeTariff->unit_price, 2),
                    'fixed_charge' => round((float) $activeTariff->fixed_charge, 2),
                    'effective_from' => optional($activeTariff->effective_from)->toDateString(),
                ] : null,
                'open_bills' => $summary['total_unpaid_bills'],
                'paid_bills' => $summary['paid_bills'],
                'resolved_complaints' => $summary['resolved_complaints'],
                'unresolved_complaints' => $summary['unresolved_complaints'],
                'recent_payments_30_days' => round(
                    (float) Payment::query()
                        ->where('status', 'success')
                        ->where('paid_at', '>=', now()->subDays(30))
                        ->sum('amount'),
                    2
                ),
            ],
            'billing_status_breakdown' => $this->billingStatusBreakdown(),
            'payment_method_breakdown' => $this->paymentMethodBreakdown(),
            'complaint_status_breakdown' => $this->complaintStatusBreakdown(),
            'monthly_performance' => $this->monthlyPerformance(),
        ];
    }

    private function sumOutstanding(Collection $bills): float
    {
        return round(
            $bills->sum(function (Bill $bill) {
                $paidAmount = (float) ($bill->paid_amount ?? 0);

                return max((float) $bill->total_amount - $paidAmount, 0);
            }),
            2
        );
    }

    private function billingStatusBreakdown(): array
    {
        $statusRows = Bill::query()
            ->select(
                'status',
                DB::raw('COUNT(*) as bill_count'),
                DB::raw('COALESCE(SUM(total_amount), 0) as billed_amount')
            )
            ->groupBy('status')
            ->orderBy('status')
            ->get();

        $statusOutstanding = Bill::query()
            ->whereIn('status', ['unpaid', 'partially_paid', 'overdue'])
            ->withSum('payments as paid_amount', 'amount')
            ->get(['status', 'total_amount'])
            ->groupBy('status')
            ->map(fn (Collection $group) => $this->sumOutstanding($group));

        return $statusRows->map(function ($row) use ($statusOutstanding) {
            return [
                'status' => $row->status,
                'bill_count' => (int) $row->bill_count,
                'billed_amount' => round((float) $row->billed_amount, 2),
                'outstanding_amount' => round((float) ($statusOutstanding[$row->status] ?? 0), 2),
            ];
        })->values()->all();
    }

    private function paymentMethodBreakdown(): array
    {
        return Payment::query()
            ->where('status', 'success')
            ->select(
                'payment_method',
                DB::raw('COUNT(*) as payment_count'),
                DB::raw('COALESCE(SUM(amount), 0) as collected_amount')
            )
            ->groupBy('payment_method')
            ->orderBy('payment_method')
            ->get()
            ->map(fn ($row) => [
                'payment_method' => $row->payment_method,
                'payment_count' => (int) $row->payment_count,
                'collected_amount' => round((float) $row->collected_amount, 2),
            ])
            ->values()
            ->all();
    }

    private function complaintStatusBreakdown(): array
    {
        return Complaint::query()
            ->select('status', DB::raw('COUNT(*) as complaint_count'))
            ->groupBy('status')
            ->orderBy('status')
            ->get()
            ->map(fn ($row) => [
                'status' => $row->status,
                'complaint_count' => (int) $row->complaint_count,
            ])
            ->values()
            ->all();
    }

    private function monthlyPerformance(): array
    {
        $months = collect(range(5, 0, -1))
            ->map(fn (int $monthsBack) => now()->startOfMonth()->subMonths($monthsBack));
        $startMonth = $months->first()->copy()->startOfMonth();

        $billsByMonth = Bill::query()
            ->select(
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as period_key"),
                DB::raw('COUNT(*) as bills_generated'),
                DB::raw('COALESCE(SUM(total_amount), 0) as billed_amount')
            )
            ->where('created_at', '>=', $startMonth)
            ->groupBy('period_key')
            ->get()
            ->keyBy('period_key');

        $paymentsByMonth = Payment::query()
            ->select(
                DB::raw("DATE_FORMAT(COALESCE(paid_at, created_at), '%Y-%m') as period_key"),
                DB::raw('COUNT(*) as payments_recorded'),
                DB::raw('COALESCE(SUM(amount), 0) as collected_amount')
            )
            ->whereRaw('COALESCE(paid_at, created_at) >= ?', [$startMonth])
            ->where('status', 'success')
            ->groupBy('period_key')
            ->get()
            ->keyBy('period_key');

        $complaintsByMonth = Complaint::query()
            ->select(
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as period_key"),
                DB::raw('COUNT(*) as complaints_logged')
            )
            ->where('created_at', '>=', $startMonth)
            ->groupBy('period_key')
            ->get()
            ->keyBy('period_key');

        return $months->map(function (Carbon $month) use ($billsByMonth, $paymentsByMonth, $complaintsByMonth) {
            $periodKey = $month->format('Y-m');
            $billRow = $billsByMonth->get($periodKey);
            $paymentRow = $paymentsByMonth->get($periodKey);
            $complaintRow = $complaintsByMonth->get($periodKey);

            return [
                'period' => $month->format('M Y'),
                'bills_generated' => (int) ($billRow->bills_generated ?? 0),
                'billed_amount' => round((float) ($billRow->billed_amount ?? 0), 2),
                'payments_recorded' => (int) ($paymentRow->payments_recorded ?? 0),
                'collected_amount' => round((float) ($paymentRow->collected_amount ?? 0), 2),
                'complaints_logged' => (int) ($complaintRow->complaints_logged ?? 0),
            ];
        })->values()->all();
    }
}
