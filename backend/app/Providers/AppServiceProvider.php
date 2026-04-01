<?php

namespace App\Providers;

use App\Services\Sms\MockSmsService;
use App\Services\Sms\SmsServiceInterface;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(SmsServiceInterface::class, MockSmsService::class);
    }

    public function boot(): void
    {
        //
    }
}
