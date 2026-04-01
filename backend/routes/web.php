<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'project' => 'Online Electricity Billing and Payment System for UEDCL',
        'message' => 'Laravel web routes will be added in later phases.',
    ]);
});
