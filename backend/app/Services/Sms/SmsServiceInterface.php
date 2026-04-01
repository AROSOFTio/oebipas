<?php

namespace App\Services\Sms;

interface SmsServiceInterface
{
    public function send(string $recipient, string $message, array $metadata = []): array;
}
