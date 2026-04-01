<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['name' => 'Customer', 'slug' => 'customer', 'description' => 'Customer self-service account'],
            ['name' => 'Billing Officer', 'slug' => 'billing_officer', 'description' => 'Billing and meter operations'],
            ['name' => 'Helpdesk Officer', 'slug' => 'helpdesk_officer', 'description' => 'Complaints and customer support'],
            ['name' => 'Administrator', 'slug' => 'administrator', 'description' => 'System administration and reporting'],
        ];

        foreach ($roles as $role) {
            Role::query()->updateOrCreate(['slug' => $role['slug']], $role);
        }
    }
}
