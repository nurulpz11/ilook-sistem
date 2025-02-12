<?php

namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use App\Models\User;

class RoleSeeder extends Seeder
{
    public function run()
    {
        // Buat role
        Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'api']);
        Role::firstOrCreate(['name' => 'owner', 'guard_name' => 'api']);
        Role::firstOrCreate(['name' => 'supervisor', 'guard_name' => 'api']);
        Role::firstOrCreate(['name' => 'staff', 'guard_name' => 'api']);
        Role::firstOrCreate(['name' => 'penjahit', 'guard_name' => 'api']);
        
        // Assign role ke user tertentu (misalnya user ID 1 adalah super admin)
        $user = User::find(1);
        if ($user) {
            $user->assignRole('super-admin');
        }
    }
}
