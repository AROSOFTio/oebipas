<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\GenerateBillsRequest;
use App\Models\Bill;
use App\Models\Meter;
use App\Models\Tariff;
use App\Services\Billing\BillGenerationService;
use App\Services\Sms\SmsManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class BillController extends Controller
{
    public function __construct(
        private readonly BillGenerationService $billGenerationService,
        private readonly SmsManager $smsManager,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $query = Bill::query()->with(['customer', 'meter', 'tariff', 'payments.receipt'])->latest();

        $query->when($request->user()?->isRole('customer'), function ($builder) use ($request) {
            $builder->whereHas('customer', function ($customerQuery) use ($request) {
                $customerQuery->where('user_id', $request->user()->id);
            });
        });

        $query->when($request->filled('customer_id'), function ($builder) use ($request) {
            $builder->where('customer_id', $request->integer('customer_id'));
        });

        $query->when($request->filled('meter_id'), function ($builder) use ($request) {
            $builder->where('meter_id', $request->integer('meter_id'));
        });

        $query->when($request->filled('status'), function ($builder) use ($request) {
            $builder->where('status', $request->string('status'));
        });

        $query->when($request->filled('billing_cycle'), function ($builder) use ($request) {
            $builder->where('billing_cycle', $request->string('billing_cycle'));
        });

        return response()->json($query->get());
    }

    public function generate(GenerateBillsRequest $request): JsonResponse
    {
        $tariff = Tariff::query()->findOrFail($request->integer('tariff_id'));
        $status = $request->validated('status') ?: 'unpaid';

        $meters = Meter::query()
            ->with(['customer', 'latestReading'])
            ->where('status', 'active')
            ->when($request->filled('customer_id'), function ($builder) use ($request) {
                $builder->where('customer_id', $request->integer('customer_id'));
            })
            ->when($request->filled('meter_id'), function ($builder) use ($request) {
                $builder->where('id', $request->integer('meter_id'));
            })
            ->get();

        if ($meters->isEmpty()) {
            throw ValidationException::withMessages([
                'meter_id' => 'No active meters matched the selected bill generation criteria.',
            ]);
        }

        $result = $this->billGenerationService->generateForMeters(
            $meters,
            $tariff,
            $request->validated('billing_cycle'),
            $request->validated('due_date'),
            $status,
        );

        $generatedBills = $result['generated']
            ->map(fn (Bill $bill) => $bill->load(['customer', 'meter', 'tariff']))
            ->values();

        foreach ($generatedBills as $bill) {
            if ($bill->customer?->phone) {
                $this->smsManager->billGenerated(
                    $bill->customer->phone,
                    $bill->customer->name,
                    number_format((float) $bill->total_amount, 0, '.', ','),
                    $bill->due_date->toDateString(),
                    $bill->customer->id,
                );
            }
        }

        return response()->json([
            'message' => 'Bill generation completed.',
            'generated_count' => $generatedBills->count(),
            'skipped_count' => count($result['skipped']),
            'data' => $generatedBills,
            'skipped' => $result['skipped'],
        ], 201);
    }

    public function show(Request $request, Bill $bill): JsonResponse
    {
        $bill->load(['customer', 'meter', 'tariff', 'payments.receipt']);

        if ($request->user()?->isRole('customer') && $bill->customer?->user_id !== $request->user()->id) {
            abort(403, 'You are not allowed to view this bill.');
        }

        return response()->json($bill);
    }
}
