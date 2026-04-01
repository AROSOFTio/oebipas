<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Reports\ReportService;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    public function __construct(private readonly ReportService $reportService)
    {
    }

    public function summary(): JsonResponse
    {
        return response()->json([
            'message' => 'Report summary generated successfully.',
            'data' => $this->reportService->summary(),
        ]);
    }

    public function overview(): JsonResponse
    {
        return response()->json([
            'message' => 'Executive report overview generated successfully.',
            'data' => $this->reportService->overview(),
        ]);
    }
}
