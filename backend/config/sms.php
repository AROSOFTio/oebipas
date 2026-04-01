<?php

return [
    'enabled' => env('SMS_ENABLED', true),
    'mode' => env('SMS_MODE', 'mock'),
    'provider' => env('SMS_PROVIDER', 'mock'),
    'api_key' => env('SMS_API_KEY'),
    'sender_id' => env('SMS_SENDER_ID', 'UEDCL'),
];
