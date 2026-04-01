<?php

namespace App\Http\Requests;

use App\Models\Meter;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreMeterReadingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'meter_id' => ['required', 'integer', 'exists:meters,id'],
            'current_reading' => ['required', 'numeric', 'min:0'],
            'reading_date' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $meter = Meter::query()->with('latestReading')->find($this->integer('meter_id'));

            if (! $meter) {
                return;
            }

            $previousReading = (float) ($meter->latestReading?->current_reading ?? 0);
            $currentReading = (float) $this->input('current_reading', 0);

            if ($currentReading < $previousReading) {
                $validator->errors()->add('current_reading', 'Current reading cannot be lower than the previous reading.');
            }
        });
    }
}
