<?php

namespace App\Services\Sms;

class SmsManager
{
    public function __construct(private readonly SmsServiceInterface $smsService)
    {
    }

    public function billGenerated(string $recipient, string $name, string $amount, string $dueDate, ?int $customerId = null): array
    {
        $message = "Dear {$name}, your electricity bill of UGX {$amount} has been generated. Due date: {$dueDate}.";

        return $this->smsService->send($recipient, $message, [
            'customer_id' => $customerId,
            'type' => 'bill_generated',
        ]);
    }

    public function paymentReceived(string $recipient, string $name, string $amount, ?int $customerId = null): array
    {
        $message = "Dear {$name}, payment of UGX {$amount} has been received successfully.";

        return $this->smsService->send($recipient, $message, [
            'customer_id' => $customerId,
            'type' => 'payment_received',
        ]);
    }

    public function overdueReminder(string $recipient, string $amount, ?int $customerId = null): array
    {
        $message = "Reminder: your bill of UGX {$amount} is overdue. Please pay.";

        return $this->smsService->send($recipient, $message, [
            'customer_id' => $customerId,
            'type' => 'overdue_reminder',
        ]);
    }
}
