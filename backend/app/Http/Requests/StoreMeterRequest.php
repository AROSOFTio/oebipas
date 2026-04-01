<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMeterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $meter = $this->route('meter');

        return [
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
            'meter_number' => ['required', 'string', 'max:100', Rule::unique('meters', 'meter_number')->ignore($meter)],
            'meter_type' => ['required', 'string', 'max:100'],
            'installation_date' => ['required', 'date'],
            'status' => ['required', Rule::in(['active', 'inactive', 'faulty'])],
            'location' => ['required', 'string', 'max:255'],
        ];
    }
}
