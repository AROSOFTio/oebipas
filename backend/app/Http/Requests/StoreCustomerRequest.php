<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $customer = $this->route('customer');
        $linkedUserId = $customer?->user_id;

        return [
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'account_number' => ['required', 'string', 'max:50', Rule::unique('customers', 'account_number')->ignore($customer)],
            'name' => ['required', 'string', 'max:255'],
            'phone' => [
                'required',
                'string',
                'max:30',
                Rule::unique('customers', 'phone')->ignore($customer),
                Rule::unique('users', 'phone')->ignore($linkedUserId),
            ],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('customers', 'email')->ignore($customer),
                Rule::unique('users', 'email')->ignore($linkedUserId),
            ],
            'national_id' => ['nullable', 'string', 'max:100', Rule::unique('customers', 'national_id')->ignore($customer)],
            'address' => ['required', 'string', 'max:1000'],
            'status' => ['required', Rule::in(['active', 'inactive', 'pending'])],
        ];
    }
}
