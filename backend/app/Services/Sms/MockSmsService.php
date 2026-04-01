<?php

namespace App\Services\Sms;

use App\Models\Notification;

class MockSmsService implements SmsServiceInterface
{
    public function send(string $recipient, string $message, array $metadata = []): array
    {
        $enabled = (bool) config('sms.enabled', true);
        $status = $enabled ? 'success' : 'disabled';

        $record = Notification::query()->create([
            'customer_id' => $metadata['customer_id'] ?? null,
            'type' => $metadata['type'] ?? 'sms',
            'channel' => 'sms',
            'recipient' => $recipient,
            'message' => $message,
            'status' => $status,
            'metadata' => [
                ...$metadata,
                'mode' => config('sms.mode', 'mock'),
                'provider' => config('sms.provider', 'mock'),
            ],
            'sent_at' => $enabled ? now() : null,
        ]);

        return [
            'mode' => config('sms.mode', 'mock'),
            'status' => $status,
            'notification_id' => $record->id,
            'recipient' => $recipient,
            'message' => $message,
        ];
    }
}
