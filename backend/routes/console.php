<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('uedcl:about', function () {
    $this->comment('Online Electricity Billing and Payment System for UEDCL');
    $this->line('Laravel API backend for billing, payments, complaints, and reporting.');
})->purpose('Display project information for the UEDCL billing system backend.');
