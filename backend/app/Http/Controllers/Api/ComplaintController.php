<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReplyComplaintRequest;
use App\Http\Requests\StoreComplaintRequest;
use App\Http\Requests\UpdateComplaintStatusRequest;
use App\Models\Complaint;
use App\Models\ComplaintReply;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ComplaintController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Complaint::query()->with(['customer', 'replies.user'])->latest();

        $query->when($request->user()?->isRole('customer'), function ($builder) use ($request) {
            $builder->whereHas('customer', function ($customerQuery) use ($request) {
                $customerQuery->where('user_id', $request->user()->id);
            });
        });

        $query->when($request->filled('status'), function ($builder) use ($request) {
            $builder->where('status', $request->string('status'));
        });

        return response()->json($query->get());
    }

    public function store(StoreComplaintRequest $request): JsonResponse
    {
        $customerId = $request->user()?->customer?->id ?: $request->validated('customer_id');

        if (! $customerId) {
            throw ValidationException::withMessages([
                'customer_id' => 'A customer record is required to create a complaint.',
            ]);
        }

        $complaint = Complaint::query()->create([
            'customer_id' => $customerId,
            'complaint_number' => $this->makeComplaintNumber(),
            'subject' => $request->validated('subject'),
            'message' => $request->validated('message'),
            'category' => $request->validated('category'),
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Complaint submitted successfully.',
            'data' => $complaint->load('customer'),
        ], 201);
    }

    public function show(Request $request, Complaint $complaint): JsonResponse
    {
        $complaint->load(['customer', 'replies.user']);

        if ($request->user()?->isRole('customer') && $complaint->customer?->user_id !== $request->user()->id) {
            abort(403, 'You are not allowed to view this complaint.');
        }

        return response()->json($complaint);
    }

    public function reply(ReplyComplaintRequest $request, Complaint $complaint): JsonResponse
    {
        $reply = ComplaintReply::query()->create([
            'complaint_id' => $complaint->id,
            'user_id' => $request->user()?->id,
            'reply' => $request->validated('reply'),
        ]);

        if ($complaint->status === 'pending') {
            $complaint->update(['status' => 'in_progress']);
        }

        return response()->json([
            'message' => 'Complaint reply recorded successfully.',
            'data' => $reply->load('user'),
            'complaint' => $complaint->fresh(['customer', 'replies.user']),
        ], 201);
    }

    public function updateStatus(UpdateComplaintStatusRequest $request, Complaint $complaint): JsonResponse
    {
        $complaint->update(['status' => $request->validated('status')]);

        return response()->json([
            'message' => 'Complaint status updated successfully.',
            'data' => $complaint->load(['customer', 'replies.user']),
        ]);
    }

    private function makeComplaintNumber(): string
    {
        $year = now()->format('Y');
        $sequence = Complaint::query()
            ->where('complaint_number', 'like', "CMP-{$year}-%")
            ->count() + 1;

        return sprintf('CMP-%s-%04d', $year, $sequence);
    }
}
