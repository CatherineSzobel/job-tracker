<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // Demo account offered on the login page (see config/app.php demo_email)
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => config('app.demo_email'),
            'password' => 'secret123',
        ]);

        $user->profile()->create([
            'name' => $user->name,
            'title' => 'Software Engineer',
            'bio' => 'This is a test user for seeding job applications.',
            'location' => 'San Francisco, CA',
        ]);

        $this->call([
            JobApplicationSeeder::class,
            BankQuestionSeeder::class,
        ]);
    }
}
