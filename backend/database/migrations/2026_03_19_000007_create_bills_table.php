<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('bills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->foreignId('meter_id')->constrained('meters')->cascadeOnDelete();
            $table->foreignId('tariff_id')->nullable()->constrained('tariffs')->nullOnDelete();
            $table->string('bill_number')->unique();
            $table->string('billing_cycle');
            $table->decimal('previous_reading', 12, 2);
            $table->decimal('current_reading', 12, 2);
            $table->decimal('units_consumed', 12, 2);
            $table->decimal('tariff_rate', 12, 2);
            $table->decimal('fixed_charge', 12, 2);
            $table->decimal('energy_charge', 12, 2);
            $table->decimal('total_amount', 12, 2);
            $table->date('due_date');
            $table->string('status')->default('unpaid');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bills');
    }
};
