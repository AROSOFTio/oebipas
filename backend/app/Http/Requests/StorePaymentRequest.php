<?php

namespace App\Http\Requests;

use App\Models\Bill;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'bill_id' => ['required', 'integer', 'exists:bills,id'],
            'payment_method' => ['required', Rule::in(['cash', 'mobile_money', 'bank'])],
            'amount' => ['required', 'numeric', 'min:1'],
            'reference_number' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $bill = Bill::query()->with('payments')->find($this->integer('bill_id'));

            if (! $bill) {
                return;
            }

            $paidAmount = (float) $bill->payments->where('status', 'success')->sum('amount');
            $outstandingAmount = (float) $bill->total_amount - $paidAmount;
            $paymentAmount = (float) $this->input('amount', 0);

            if ($outstandingAmount <= 0) {
                $validator->errors()->add('bill_id', 'This bill has already been fully paid.');
            }

            if ($paymentAmount > $outstandingAmount) {
                $validator->errors()->add('amount', 'Payment amount cannot be greater than the outstanding bill balance.');
            }
        });
    }
}
