<?php

namespace App\Services\Payments;

use App\Models\Bill;
use App\Models\Payment;
use App\Services\Receipts\ReceiptService;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    public function __construct(private readonly ReceiptService $receiptService)
    {
    }

    public function makePaymentNumber(): string
    {
        $year = now()->format('Y');
        $sequence = Payment::query()
            ->where('payment_number', 'like', "PAY-{$year}-%")
            ->count() + 1;

        return sprintf('PAY-%s-%04d', $year, $sequence);
    }

    public function outstandingAmount(Bill $bill): float
    {
        $bill->loadMissing('payments');

        $paidAmount = (float) $bill->payments->where('status', 'success')->sum('amount');

        return max(0, round((float) $bill->total_amount - $paidAmount, 2));
    }

    public function recordPayment(Bill $bill, array $attributes, ?int $recordedBy = null): Payment
    {
        return DB::transaction(function () use ($bill, $attributes, $recordedBy): Payment {
            $payment = Payment::query()->create([
                'bill_id' => $bill->id,
                'payment_number' => $this->makePaymentNumber(),
                'payment_method' => $attributes['payment_method'],
                'amount' => $attributes['amount'],
                'reference_number' => $attributes['reference_number'] ?? null,
                'recorded_by' => $recordedBy,
                'status' => 'success',
                'paid_at' => now(),
            ]);

            $this->receiptService->createForPayment($payment);
            $this->syncBillStatus($bill->fresh());

            return $payment->fresh(['bill.customer', 'receipt', 'staff']);
        });
    }

    public function syncBillStatus(Bill $bill): Bill
    {
        $bill->loadMissing('payments');

        $paidAmount = (float) $bill->payments->where('status', 'success')->sum('amount');
        $totalAmount = (float) $bill->total_amount;

        if ($paidAmount <= 0) {
            $status = $bill->due_date && $bill->due_date->isPast() ? 'overdue' : 'unpaid';
        } elseif ($paidAmount < $totalAmount) {
            $status = 'partially_paid';
        } else {
            $status = 'paid';
        }

        $bill->update(['status' => $status]);

        return $bill->fresh();
    }
}
