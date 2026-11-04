<?php

namespace Database\Factories;

use App\Enums\JobStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\JobApplication>
 */
class JobApplicationFactory extends Factory
{
    /**
     * An active application, applied for today (the model sets the date).
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'company_name' => fake()->company(),
            'position' => fake()->jobTitle(),
        ];
    }

    /**
     * Not applied for yet, so no applied date
     */
    public function saved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => JobStatus::Saved,
        ]);
    }

    public function archived(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_archived' => true,
        ]);
    }
}
