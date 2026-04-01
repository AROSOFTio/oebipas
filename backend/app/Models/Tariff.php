<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tariff extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'unit_price',
        'fixed_charge',
        'effective_from',
        'status',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'fixed_charge' => 'decimal:2',
        'effective_from' => 'date',
    ];

    public function bills(): HasMany
    {
        return $this->hasMany(Bill::class);
    }
}
