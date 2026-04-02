<?php

namespace App\Services\Payments;

use App\Models\Bill;
use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PesapalService
{
    private string $env;
    private string $consumerKey;
    private string $consumerSecret;
    private string $baseUrl;

    public function __construct()
    {
        $this->env = Setting::getValue('pesapal.env', 'sandbox');
        $this->consumerKey = Setting::getValue('pesapal.consumer_key', '');
        $this->consumerSecret = Setting::getValue('pesapal.consumer_secret', '');
        
        $this->baseUrl = $this->env === 'live' 
            ? 'https://pay.pesapal.com/v3' 
            : 'https://cybqa.pesapal.com/pesapalv3';
    }

    private function isConfigured(): bool
    {
        return !empty($this->consumerKey) && !empty($this->consumerSecret);
    }

    private function getAuthToken(): ?string
    {
        if (!$this->isConfigured()) {
            throw new \Exception("Pesapal API keys are not configured securely.");
        }

        $response = Http::post("{$this->baseUrl}/api/Auth/RequestToken", [
            'consumer_key' => $this->consumerKey,
            'consumer_secret' => $this->consumerSecret,
        ]);

        if ($response->successful()) {
            return $response->json('token');
        }

        Log::error('Pesapal Auth Failed', ['response' => $response->body()]);
        throw new \Exception("Failed to authenticate with Pesapal API.");
    }

    private function registerIPN(string $token): string
    {
        // Pesapal requires IPN registration per transaction or globally. We register one dynamically to get the ipn_id.
        $ipnUrl = config('app.url') . '/api/pesapal/ipn';
        
        $response = Http::withToken($token)->post("{$this->baseUrl}/api/URLSetup/RegisterIPN", [
            'url' => $ipnUrl,
            'ipn_notification_type' => 'POST'
        ]);

        if ($response->successful()) {
            return $response->json('ipn_id');
        }
        
        Log::error('Pesapal IPN Reg Failed', ['response' => $response->body()]);
        throw new \Exception("Failed to register IPN with Pesapal.");
    }

    public function submitOrder(Bill $bill): array
    {
        $token = $this->getAuthToken();
        $ipnId = $this->registerIPN($token);

        $customer = $bill->customer;
        
        // Generate a unique reference. Appending time to handle retries.
        $referenceId = "BILL-" . $bill->id . "-" . time();

        $payload = [
            'id' => $referenceId,
            'currency' => 'UGX',
            'amount' => $bill->total_amount,
            'description' => "Payment for UEDCL Bill #{$bill->bill_number}",
            'callback_url' => config('app.url') . "/customer/bills/{$bill->id}?payment=success",
            'notification_id' => $ipnId,
            'billing_address' => [
                'email_address' => $customer->email,
                'phone_number' => $customer->phone ?? '0000000000',
                'country_code' => 'UG',
                'first_name' => explode(' ', $customer->name)[0] ?? 'Customer',
                'middle_name' => '',
                'last_name' => explode(' ', $customer->name)[1] ?? '',
                'line_1' => $customer->address ?? 'UG',
                'line_2' => '',
                'city' => '',
                'state' => '',
                'postal_code' => '',
                'zip_code' => ''
            ]
        ];

        $response = Http::withToken($token)->post("{$this->baseUrl}/api/Transactions/SubmitOrderRequest", $payload);

        if ($response->successful()) {
            // Returns: order_tracking_id, merchant_reference, redirect_url, error, status
            return $response->json();
        }

        Log::error('Pesapal Submit Order Failed', ['response' => $response->body()]);
        throw new \Exception("Failed to submit order to Pesapal.");
    }

    public function getTransactionStatus(string $trackingId): ?array
    {
        $token = $this->getAuthToken();

        $response = Http::withToken($token)->get("{$this->baseUrl}/api/Transactions/GetTransactionStatus", [
            'orderTrackingId' => $trackingId
        ]);

        if ($response->successful()) {
            return $response->json();
        }

        Log::error('Pesapal Get Status Failed', ['response' => $response->body()]);
        return null;
    }
}
