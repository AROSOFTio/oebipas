<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTariffRequest;
use App\Models\Tariff;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TariffController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Tariff::query()->latest();

        $query->when($request->filled('status'), function ($builder) use ($request) {
            $builder->where('status', $request->string('status'));
        });

        return response()->json($query->get());
    }

    public function store(StoreTariffRequest $request): JsonResponse
    {
        $tariff = Tariff::query()->create($request->validated());

        return response()->json([
            'message' => 'Tariff created successfully.',
            'data' => $tariff,
        ], 201);
    }

    public function update(StoreTariffRequest $request, Tariff $tariff): JsonResponse
    {
        $tariff->update($request->validated());

        return response()->json([
            'message' => 'Tariff updated successfully.',
            'data' => $tariff,
        ]);
    }
}
