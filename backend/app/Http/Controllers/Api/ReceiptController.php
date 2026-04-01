<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Receipt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReceiptController extends Controller
{
    public function show(Request $request, Receipt $receipt): JsonResponse
    {
        $receipt->load(['payment.bill.customer', 'payment.staff']);

        if ($request->user()?->isRole('customer') && $receipt->payment?->bill?->customer?->user_id !== $request->user()->id) {
            abort(403, 'You are not allowed to view this receipt.');
        }

        return response()->json($receipt);
    }
}
