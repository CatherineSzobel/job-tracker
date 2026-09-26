<?php

namespace Database\Seeders;

use App\Enums\InterviewType;
use App\Enums\JobStatus;
use App\Enums\Priority;
use App\Models\Interview;
use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Database\Seeder;

class JobApplicationSeeder extends Seeder
{
    public function run()
    {
        $faker = \Faker\Factory::create();

        // The demo user and profile are created in DatabaseSeeder
        $user = User::where('email', config('app.demo_email'))->firstOrFail();

        // Each user has 20–30 job applications
        $jobCount = rand(20, 30);
        for ($i = 0; $i < $jobCount; $i++) {
            $job = JobApplication::create([
                'user_id' => $user->id,
                'company_name' => $faker->company,
                'position' => $faker->jobTitle,
                'location' => $faker->city,
                'status' => $faker->randomElement(JobStatus::values()),
                'priority' => $faker->randomElement(Priority::values()),
                'applied_date' => $faker->dateTimeBetween('-3 months', 'now'),
                'job_link' => $faker->url,
                'notes' => $faker->sentence,
                'is_archived' => false
            ]);

            // Add 0–2 interviews per job
            $interviewCount = rand(0, 2);
            for ($k = 0; $k < $interviewCount; $k++) {
                Interview::create([
                    'user_id' => $user->id,
                    'job_application_id' => $job->id,
                    'interview_date' => $faker->dateTimeBetween('now', '+2 months'),
                    'type' => $faker->randomElement(InterviewType::values()),
                    'location' => $faker->city,
                    'notes' => $faker->sentence,
                ]);
            }
        }
    }
}
