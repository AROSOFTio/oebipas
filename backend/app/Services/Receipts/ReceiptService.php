<?php

namespace App\Services\Receipts;

use App\Models\Payment;
use App\Models\Receipt;

class ReceiptService
{
    public function createForPayment(Payment $payment): Receipt
    {
        $payment->loadMissing(['bill.customer', 'staff', 'receipt']);

        if ($payment->receipt) {
            return $payment->receipt;
        }

        return Receipt::query()->create([
            'payment_id' => $payment->id,
            'receipt_number' => $this->makeReceiptNumber(),
            'issued_at' => now(),
            'receipt_data' => [
                'bill_number' => $payment->bill?->bill_number,
                'account_number' => $payment->bill?->customer?->account_number,
                'customer_name' => $payment->bill?->customer?->name,
                'payment_method' => $payment->payment_method,
                'amount' => (float) $payment->amount,
                'reference_number' => $payment->reference_number,
                'recorded_by' => $payment->staff?->name,
            ],
        ]);
    }

    public function makeReceiptNumber(): string
    {
        $year = now()->format('Y');
        $sequence = Receipt::query()
            ->where('receipt_number', 'like', "RCT-{$year}-%")
            ->count() + 1;

        return sprintf('RCT-%s-%04d', $year, $sequence);
    }
}
