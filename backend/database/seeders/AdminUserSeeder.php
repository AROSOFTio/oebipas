<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $role = Role::query()->where('slug', 'administrator')->first();

        User::query()->updateOrCreate(
            ['email' => 'admin@uedcl.local'],
            [
                'role_id' => $role?->id,
                'name' => 'Admin User',
                'phone' => '+256700000001',
                'password' => Hash::make('password123'),
                'status' => 'active',
            ]
        );
    }
}
