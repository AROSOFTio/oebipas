<?php

namespace App\Services\Billing;

use App\Models\Bill;
use App\Models\Meter;
use App\Models\Tariff;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BillGenerationService
{
    public function calculate(float $previousReading, float $currentReading, float $tariffRate, float $fixedCharge): array
    {
        if ($currentReading < $previousReading) {
            throw ValidationException::withMessages([
                'current_reading' => 'Current reading cannot be lower than the previous reading.',
            ]);
        }

        $unitsConsumed = round($currentReading - $previousReading, 2);
        $energyCharge = round($unitsConsumed * $tariffRate, 2);
        $totalBill = round($energyCharge + $fixedCharge, 2);

        return [
            'previous_reading' => $previousReading,
            'current_reading' => $currentReading,
            'units_consumed' => $unitsConsumed,
            'tariff_rate' => $tariffRate,
            'fixed_charge' => $fixedCharge,
            'energy_charge' => $energyCharge,
            'total_amount' => $totalBill,
        ];
    }

    public function generateForMeters(Collection $meters, Tariff $tariff, string $billingCycle, string $dueDate, string $status = 'unpaid'): array
    {
        $generated = collect();
        $skipped = [];

        foreach ($meters as $meter) {
            try {
                $generated->push($this->generateForMeter($meter, $tariff, $billingCycle, $dueDate, $status));
            } catch (ValidationException $exception) {
                $skipped[] = [
                    'meter_id' => $meter->id,
                    'meter_number' => $meter->meter_number,
                    'reason' => collect($exception->errors())->flatten()->first() ?? $exception->getMessage(),
                ];
            }
        }

        return [
            'generated' => $generated,
            'skipped' => $skipped,
        ];
    }

    public function generateForMeter(Meter $meter, Tariff $tariff, string $billingCycle, string $dueDate, string $status = 'unpaid'): Bill
    {
        $meter->loadMissing(['customer', 'latestReading']);

        if (! $meter->customer) {
            throw ValidationException::withMessages([
                'meter_id' => 'Meter must be assigned to a customer before bill generation.',
            ]);
        }

        if (! $meter->latestReading) {
            throw ValidationException::withMessages([
                'meter_id' => 'Meter must have at least one reading before bill generation.',
            ]);
        }

        $existingBill = Bill::query()
            ->where('meter_id', $meter->id)
            ->where('billing_cycle', $billingCycle)
            ->first();

        if ($existingBill) {
            throw ValidationException::withMessages([
                'meter_id' => 'A bill has already been generated for this meter and billing cycle.',
            ]);
        }

        $amounts = $this->calculate(
            (float) $meter->latestReading->previous_reading,
            (float) $meter->latestReading->current_reading,
            (float) $tariff->unit_price,
            (float) $tariff->fixed_charge,
        );

        return DB::transaction(function () use ($meter, $tariff, $billingCycle, $dueDate, $status, $amounts): Bill {
            return Bill::query()->create([
                'customer_id' => $meter->customer_id,
                'meter_id' => $meter->id,
                'tariff_id' => $tariff->id,
                'bill_number' => $this->makeBillNumber(),
                'billing_cycle' => $billingCycle,
                'due_date' => $dueDate,
                'status' => $status,
                ...$amounts,
            ]);
        });
    }

    private function makeBillNumber(): string
    {
        $year = now()->format('Y');
        $sequence = Bill::query()
            ->where('bill_number', 'like', "BILL-{$year}-%")
            ->count() + 1;

        return sprintf('BILL-%s-%04d', $year, $sequence);
    }
}
