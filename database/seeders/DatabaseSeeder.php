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

        // Demo account offered on the login page (see config/app.php demo_email). In-app reminders are on and the
        // goals are small, so the dashboard has something to show.
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => config('app.demo_email'),
            'password' => 'secret123',
            'reminders_in_app' => true,
            'daily_goal' => 3,
            'weekly_goal' => 10,
        ]);

        $user->profile()->create([
            'name' => $user->name,
            'title' => 'Full-stack Developer',
            'bio' => 'Full-stack developer working with Laravel and React, looking for a product team in Belgium or remote.',
            'location' => 'Ghent, Belgium',
        ]);

        $this->call([
            JobApplicationSeeder::class,
            TodoSeeder::class,
            NoteSeeder::class,
            BankQuestionSeeder::class,
            DocumentSeeder::class,
        ]);
    }
}
