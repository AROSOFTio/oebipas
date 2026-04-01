<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MeterReading extends Model
{
    use HasFactory;

    protected $fillable = [
        'meter_id',
        'captured_by',
        'previous_reading',
        'current_reading',
        'units_consumed',
        'reading_date',
        'notes',
    ];

    protected $casts = [
        'previous_reading' => 'decimal:2',
        'current_reading' => 'decimal:2',
        'units_consumed' => 'decimal:2',
        'reading_date' => 'date',
    ];

    public function meter(): BelongsTo
    {
        return $this->belongsTo(Meter::class);
    }

    public function staff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'captured_by');
    }
}
