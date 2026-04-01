<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::query()->with(['role', 'customer'])->latest();

        $query->when($request->filled('role_id'), function ($builder) use ($request) {
            $builder->where('role_id', $request->integer('role_id'));
        });

        $query->when($request->filled('status'), function ($builder) use ($request) {
            $builder->where('status', $request->string('status'));
        });

        return response()->json($query->get());
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = User::query()->create($request->validated());

        return response()->json([
            'message' => 'User created successfully.',
            'data' => $user->load('role'),
        ], 201);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json($user->load(['role', 'customer']));
    }
}
