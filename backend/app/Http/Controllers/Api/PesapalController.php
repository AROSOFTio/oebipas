<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\Payment;
use App\Services\Payments\PaymentService;
use App\Services\Payments\PesapalService;
use App\Services\Sms\SmsManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PesapalController extends Controller
{
    public function __construct(
        private readonly PesapalService $pesapalService,
        private readonly PaymentService $paymentService,
        private readonly SmsManager $smsManager
    ) {
    }

    public function initiate(string $billId, Request $request): JsonResponse
    {
        $bill = Bill::with('customer')->findOrFail($billId);

        // Security check: ensure the bill belongs to the logged in customer if customer role
        if ($request->user()->isRole('customer') && $bill->customer->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized actions.'], 403);
        }

        if ($bill->status === 'paid') {
            return response()->json(['message' => 'This bill is already fully paid.'], 400);
        }

        try {
            $orderData = $this->pesapalService->submitOrder($bill);

            // Returns order_tracking_id and redirect_url natively from Pesapal
            return response()->json([
                'message' => 'Payment session created.',
                'tracking_id' => $orderData['order_tracking_id'] ?? null,
                'redirect_url' => $orderData['redirect_url'] ?? null,
            ]);
        } catch (\Exception $e) {
            Log::error('Pesapal Initiation Error', ['error' => $e->getMessage()]);
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function ipnCallback(Request $request): JsonResponse
    {
        Log::info('Pesapal IPN Hit', $request->all());

        $trackingId = $request->input('OrderTrackingId');
        if (!$trackingId) {
            return response()->json(['message' => 'Missing OrderTrackingId'], 400);
        }

        try {
            $statusData = $this->pesapalService->getTransactionStatus($trackingId);
            
            if (!$statusData) {
                return response()->json(['message' => 'Failed to check status'], 500);
            }

            // Extract payment status
            $paymentStatus = $statusData['payment_status_description'] ?? 'PENDING';
            $merchantReference = $statusData['merchant_reference'] ?? ''; // Format: BILL-{id}-{time}
            $amount = $statusData['amount'] ?? 0;
            
            // Expected status from Pesapal mapping: COMPLETED, FAILED, INVALID, REVERSED
            if (strtoupper($paymentStatus) === 'COMPLETED') {
                $parts = explode('-', $merchantReference);
                $billId = $parts[1] ?? null;
                
                if ($billId) {
                    $bill = Bill::with('customer')->find($billId);
                    
                    if ($bill && $bill->status !== 'paid') {
                        // Prevent double processing
                        $existing = Payment::where('payment_number', $trackingId)->first();
                        
                        if (!$existing) {
                            // Record successful payment via system PaymentService
                            $payment = $this->paymentService->recordPayment($bill, [
                                'amount' => $amount,
                                'payment_method' => 'pesapal',
                                'payment_number' => $trackingId,
                                'notes' => 'Pesapal IPN Auto-Posting',
                            ]);
                            
                            $bill = $bill->fresh('customer');

                            if ($bill->customer?->phone) {
                                $this->smsManager->paymentReceived(
                                    $bill->customer->phone,
                                    $bill->customer->name,
                                    number_format((float) $payment->amount, 0, '.', ','),
                                    $bill->customer->id
                                );
                            }
                            
                            Log::info("Pesapal bill $billId marked as COMPLETED.");
                        }
                    }
                }
            }

            // Acknowledge receipt to Pesapal
            return response()->json([
                'orderNotificationType' => 'IPNCHANGE',
                'orderTrackingId' => $trackingId,
                'orderMerchantReference' => $merchantReference,
                'status' => 200
            ]);

        } catch (\Exception $e) {
            Log::error('Pesapal IPN Processing Error', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Internal server error'], 500);
        }
    }
}
