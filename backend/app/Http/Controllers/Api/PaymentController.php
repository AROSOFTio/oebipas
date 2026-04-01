<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePaymentRequest;
use App\Models\Bill;
use App\Models\Payment;
use App\Services\Payments\PaymentService;
use App\Services\Sms\SmsManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(
        private readonly PaymentService $paymentService,
        private readonly SmsManager $smsManager,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $query = Payment::query()->with(['bill.customer', 'receipt', 'staff'])->latest();

        $query->when($request->user()?->isRole('customer'), function ($builder) use ($request) {
            $builder->whereHas('bill.customer', function ($customerQuery) use ($request) {
                $customerQuery->where('user_id', $request->user()->id);
            });
        });

        $query->when($request->filled('bill_id'), function ($builder) use ($request) {
            $builder->where('bill_id', $request->integer('bill_id'));
        });

        $query->when($request->filled('payment_method'), function ($builder) use ($request) {
            $builder->where('payment_method', $request->string('payment_method'));
        });

        return response()->json($query->get());
    }

    public function store(StorePaymentRequest $request): JsonResponse
    {
        $bill = Bill::query()->with(['customer', 'payments'])->findOrFail($request->integer('bill_id'));
        $payment = $this->paymentService->recordPayment($bill, $request->validated(), $request->user()?->id);
        $bill = $bill->fresh(['customer', 'payments']);

        if ($bill->customer?->phone) {
            $this->smsManager->paymentReceived(
                $bill->customer->phone,
                $bill->customer->name,
                number_format((float) $payment->amount, 0, '.', ','),
                $bill->customer->id,
            );
        }

        return response()->json([
            'message' => 'Payment recorded successfully.',
            'data' => $payment,
            'bill' => $bill,
            'outstanding_amount' => $this->paymentService->outstandingAmount($bill),
        ], 201);
    }
}
