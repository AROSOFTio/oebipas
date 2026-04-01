<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMeterReadingRequest;
use App\Models\Meter;
use App\Models\MeterReading;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MeterReadingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = MeterReading::query()->with(['meter.customer', 'staff'])->latest('reading_date');

        $query->when($request->filled('meter_id'), function ($builder) use ($request) {
            $builder->where('meter_id', $request->integer('meter_id'));
        });

        $query->when($request->user()?->isRole('customer'), function ($builder) use ($request) {
            $builder->whereHas('meter.customer', function ($customerQuery) use ($request) {
                $customerQuery->where('user_id', $request->user()->id);
            });
        });

        return response()->json($query->get());
    }

    public function store(StoreMeterReadingRequest $request): JsonResponse
    {
        $meter = Meter::query()->with('latestReading')->findOrFail($request->integer('meter_id'));
        $previousReading = (float) ($meter->latestReading?->current_reading ?? 0);
        $currentReading = (float) $request->validated('current_reading');

        $reading = MeterReading::query()->create([
            'meter_id' => $meter->id,
            'captured_by' => $request->user()?->id,
            'previous_reading' => $previousReading,
            'current_reading' => $currentReading,
            'units_consumed' => round($currentReading - $previousReading, 2),
            'reading_date' => $request->validated('reading_date'),
            'notes' => $request->validated('notes'),
        ]);

        return response()->json([
            'message' => 'Meter reading recorded successfully.',
            'data' => $reading->load(['meter.customer', 'staff']),
        ], 201);
    }

    public function show(MeterReading $meterReading): JsonResponse
    {
        return response()->json($meterReading->load(['meter.customer', 'staff']));
    }
}
