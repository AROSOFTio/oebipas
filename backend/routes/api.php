<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BillController;
use App\Http\Controllers\Api\ComplaintController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\MeterController;
use App\Http\Controllers\Api\MeterReadingController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ReceiptController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\TariffController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\PesapalController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::match(['get', 'post'], 'pesapal/ipn', [PesapalController::class, 'ipnCallback'])->name('pesapal.ipn');

Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
    });

    Route::get('bills', [BillController::class, 'index']);
    Route::get('bills/{bill}', [BillController::class, 'show']);
    Route::post('bills/{bill}/pay/pesapal', [PesapalController::class, 'initiate']);
    Route::get('meters', [MeterController::class, 'index']);
    Route::get('meters/{meter}', [MeterController::class, 'show']);
    Route::get('payments', [PaymentController::class, 'index']);
    Route::get('receipts/{receipt}', [ReceiptController::class, 'show']);
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::get('complaints', [ComplaintController::class, 'index']);
    Route::post('complaints', [ComplaintController::class, 'store']);
    Route::get('complaints/{complaint}', [ComplaintController::class, 'show']);

    Route::middleware('role:administrator,billing_officer')->group(function () {
        Route::get('customers', [CustomerController::class, 'index']);
        Route::post('customers', [CustomerController::class, 'store']);
        Route::get('customers/{customer}', [CustomerController::class, 'show']);
        Route::match(['put', 'patch'], 'customers/{customer}', [CustomerController::class, 'update']);

        Route::post('meters', [MeterController::class, 'store']);
        Route::match(['put', 'patch'], 'meters/{meter}', [MeterController::class, 'update']);

        Route::get('meter-readings', [MeterReadingController::class, 'index']);
        Route::post('meter-readings', [MeterReadingController::class, 'store']);
        Route::get('meter-readings/{meterReading}', [MeterReadingController::class, 'show']);

        Route::get('tariffs', [TariffController::class, 'index']);
        Route::post('bills/generate', [BillController::class, 'generate']);
        Route::post('payments', [PaymentController::class, 'store']);
    });

    Route::middleware('role:administrator,helpdesk_officer')->group(function () {
        Route::post('complaints/{complaint}/reply', [ComplaintController::class, 'reply']);
        Route::patch('complaints/{complaint}/status', [ComplaintController::class, 'updateStatus']);
    });

    Route::middleware('role:administrator')->group(function () {
        Route::delete('customers/{customer}', [CustomerController::class, 'destroy']);
        Route::delete('meters/{meter}', [MeterController::class, 'destroy']);
        Route::post('tariffs', [TariffController::class, 'store']);
        Route::match(['put', 'patch'], 'tariffs/{tariff}', [TariffController::class, 'update']);
        Route::get('roles', [RoleController::class, 'index']);
        Route::get('users', [UserController::class, 'index']);
        Route::post('users', [UserController::class, 'store']);
        Route::get('users/{user}', [UserController::class, 'show']);
        Route::get('reports/summary', [ReportController::class, 'summary']);
        Route::get('reports/overview', [ReportController::class, 'overview']);
        
        Route::get('settings', [\App\Http\Controllers\Api\SettingController::class, 'index']);
        Route::post('settings', [\App\Http\Controllers\Api\SettingController::class, 'store']);
    });

    Route::post('reports/custom', [\App\Http\Controllers\Api\CustomReportController::class, 'generate']);
});
