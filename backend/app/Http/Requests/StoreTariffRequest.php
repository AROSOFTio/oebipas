<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTariffRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $tariff = $this->route('tariff');

        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('tariffs', 'name')->ignore($tariff)],
            'unit_price' => ['required', 'numeric', 'min:0'],
            'fixed_charge' => ['required', 'numeric', 'min:0'],
            'effective_from' => ['required', 'date'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ];
    }
}
