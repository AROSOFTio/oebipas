<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GenerateBillsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'billing_cycle' => ['required', 'regex:/^\d{4}-\d{2}$/'],
            'tariff_id' => ['required', 'integer', 'exists:tariffs,id'],
            'due_date' => ['required', 'date'],
            'customer_id' => ['nullable', 'integer', 'exists:customers,id'],
            'meter_id' => ['nullable', 'integer', 'exists:meters,id'],
            'status' => ['nullable', Rule::in(['unpaid', 'paid', 'overdue', 'partially_paid'])],
        ];
    }
}
