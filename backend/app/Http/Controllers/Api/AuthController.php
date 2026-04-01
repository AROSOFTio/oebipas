<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\Customer;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::query()
            ->with(['role', 'customer'])
            ->where('email', $request->validated('email'))
            ->first();

        if (! $user || ! Hash::check($request->validated('password'), $user->password)) {
            throw ValidationException::withMessages([
                'email' => 'The provided credentials are incorrect.',
            ]);
        }

        if ($user->status !== 'active') {
            throw ValidationException::withMessages([
                'email' => 'This user account is currently inactive.',
            ]);
        }

        $token = $user->createToken($request->validated('device_name') ?: 'api-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'token' => $token,
            'token_type' => 'Bearer',
            'data' => $user,
        ]);
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $customerRole = Role::query()->where('slug', 'customer')->firstOrFail();

        $user = DB::transaction(function () use ($request, $customerRole): User {
            $user = User::query()->create([
                'role_id' => $customerRole->id,
                'name' => $request->validated('name'),
                'email' => $request->validated('email'),
                'phone' => $request->validated('phone'),
                'password' => $request->validated('password'),
                'status' => 'active',
            ]);

            Customer::query()->create([
                'user_id' => $user->id,
                'account_number' => $this->makeAccountNumber(),
                'name' => $request->validated('name'),
                'phone' => $request->validated('phone'),
                'email' => $request->validated('email'),
                'national_id' => $request->validated('national_id'),
                'address' => $request->validated('address'),
                'status' => 'active',
            ]);

            return $user->load(['role', 'customer']);
        });

        $token = $user->createToken('customer-registration')->plainTextToken;

        return response()->json([
            'message' => 'Customer account created successfully.',
            'token' => $token,
            'token_type' => 'Bearer',
            'data' => $user,
        ], 201);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logout successful.',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $request->user()?->load(['role', 'customer']),
        ]);
    }

    private function makeAccountNumber(): string
    {
        $sequence = Customer::query()->count() + 1;

        return sprintf('UEDCL-%06d', $sequence);
    }
}
