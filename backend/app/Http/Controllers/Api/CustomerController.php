<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCustomerRequest;
use App\Models\Customer;
use App\Services\Customers\CustomerProvisioningService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function __construct(private readonly CustomerProvisioningService $customerProvisioningService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $query = Customer::query()->with('user')->latest();

        $query->when($request->filled('status'), function ($builder) use ($request) {
            $builder->where('status', $request->string('status'));
        });

        $query->when($request->filled('search'), function ($builder) use ($request) {
            $search = $request->string('search');

            $builder->where(function ($inner) use ($search) {
                $inner->where('name', 'like', "%{$search}%")
                    ->orWhere('account_number', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        });

        return response()->json($query->get());
    }

    public function store(StoreCustomerRequest $request): JsonResponse
    {
        $result = $this->customerProvisioningService->create($request->validated());

        return response()->json([
            'message' => 'Customer created successfully.',
            'data' => $result['customer'],
            'credentials' => $result['credentials'],
        ], 201);
    }

    public function show(Customer $customer): JsonResponse
    {
        return response()->json($customer->load(['user', 'meters', 'bills.payments', 'complaints.replies']));
    }

    public function update(StoreCustomerRequest $request, Customer $customer): JsonResponse
    {
        $customer = $this->customerProvisioningService->update($customer, $request->validated());

        return response()->json([
            'message' => 'Customer updated successfully.',
            'data' => $customer,
        ]);
    }

    public function destroy(Customer $customer): JsonResponse
    {
        $customer->delete();

        return response()->json([
            'message' => 'Customer deleted successfully.',
        ]);
    }
}
