<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\JobApplication;
use App\Models\Interview;

class JobApplicationSeeder extends Seeder
{
    public function run()
    {
        $faker = \Faker\Factory::create();
        $user = User::updateOrCreate(
            ['email' => 'test@example.com'], // find by email
            [
                'name' => 'Test User',
                'password' => bcrypt('secret123')
            ]
        );

        // Each user has 20–30 job applications
        for ($i = 0; $i < rand(20, 30); $i++) {
            $job = JobApplication::create([
                'user_id' => $user->id,
                'company_name' => $faker->company,
                'position' => $faker->jobTitle,
                'location' => $faker->city,
                'status' => $faker->randomElement(['applied', 'interview', 'offer', 'rejected']),
                'priority' => $faker->randomElement(['low', 'medium', 'high']),
                'applied_date' => $faker->dateTimeBetween('-3 months', 'now'),
                'job_link' => $faker->url,
                'notes' => $faker->sentence,
                'is_archived' => false
            ]);

            // Add 0–2 interviews per job
            for ($k = 0; $k < rand(0, 2); $k++) {
                Interview::create([
                    'user_id' => $user->id,
                    'job_application_id' => $job->id,
                    'interview_date' => $faker->dateTimeBetween('now', '+2 months'),
                    'type' => $faker->randomElement(['phone', 'online', 'onsite']),
                    'location' => $faker->city,
                    'notes' => $faker->sentence,
                ]);
            }
        }
    }
}
