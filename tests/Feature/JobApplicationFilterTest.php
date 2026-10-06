<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JobApplicationFilterTest extends TestCase
{
    use RefreshDatabase;

    public function test_filters_by_status_and_priority(): void
    {
        $user = User::factory()->create();
        $user->jobApplications()->create(['company_name' => 'Rejected high', 'position' => 'Dev', 'status' => 'rejected', 'priority' => 'high']);
        $user->jobApplications()->create(['company_name' => 'Rejected low', 'position' => 'Dev', 'status' => 'rejected', 'priority' => 'low']);
        $user->jobApplications()->create(['company_name' => 'Applied high', 'position' => 'Dev', 'status' => 'applied', 'priority' => 'high']);

        $this->actingAs($user)->getJson('/api/job-applications?status=rejected&priority=high')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.company_name', 'Rejected high');
    }

    public function test_an_unknown_status_or_priority_is_ignored(): void
    {
        $user = User::factory()->create();
        $user->jobApplications()->create(['company_name' => 'Acme', 'position' => 'Dev']);

        $this->actingAs($user)->getJson('/api/job-applications?status=hired&priority=urgent')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }
}
