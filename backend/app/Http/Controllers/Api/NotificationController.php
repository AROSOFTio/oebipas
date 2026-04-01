<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Notification::query()->with('customer')->latest();

        $query->when($request->user()?->isRole('customer'), function ($builder) use ($request) {
            $builder->whereHas('customer', function ($customerQuery) use ($request) {
                $customerQuery->where('user_id', $request->user()->id);
            });
        });

        $query->when($request->filled('type'), function ($builder) use ($request) {
            $builder->where('type', $request->string('type'));
        });

        return response()->json($query->get());
    }
}
