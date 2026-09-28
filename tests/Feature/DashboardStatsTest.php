<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardStatsTest extends TestCase
{
    use RefreshDatabase;

    public function test_stats_count_only_the_users_own_jobs_and_interviews(): void
    {
        // Wednesday, so "this week" (from Monday) and "today" differ.
        $this->travelTo('2026-09-30 15:00:00');

        $user = User::factory()->create();
        $today = $user->jobApplications()->create(['company_name' => 'A', 'position' => 'Dev', 'status' => 'applied', 'applied_date' => '2026-09-30']);
        $user->jobApplications()->create(['company_name' => 'B', 'position' => 'Dev', 'status' => 'applied', 'applied_date' => '2026-09-28']);
        $user->jobApplications()->create(['company_name' => 'C', 'position' => 'Dev', 'status' => 'offer', 'applied_date' => '2026-09-27']);
        $user->jobApplications()->create(['company_name' => 'D', 'position' => 'Dev', 'status' => 'rejected', 'applied_date' => null, 'is_archived' => true]);
        $today->interviews()->create(['user_id' => $user->id, 'interview_date' => '2026-09-30 09:00:00']);
        $today->interviews()->create(['user_id' => $user->id, 'interview_date' => '2026-09-29 09:00:00']);

        $other = User::factory()->create();
        $theirs = $other->jobApplications()->create(['company_name' => 'E', 'position' => 'Dev', 'status' => 'interview', 'applied_date' => '2026-09-30', 'is_archived' => true]);
        $theirs->interviews()->create(['user_id' => $other->id, 'interview_date' => '2026-10-01 09:00:00']);

        $this->actingAs($user)
            ->getJson('/api/job-applications/stats')
            ->assertOk()
            ->assertExactJson(['data' => [
                'total' => 4,
                'archived' => 1,
                'applied' => 2,
                'interview' => 0,
                'offer' => 1,
                'rejected' => 1,
                'todayApplications' => 1,
                'weekApplications' => 2,
                'upcomingInterviews' => 1,
            ]]);
    }

    public function test_stats_are_all_zero_without_jobs(): void
    {
        $this->actingAs(User::factory()->create())
            ->getJson('/api/job-applications/stats')
            ->assertOk()
            ->assertExactJson(['data' => [
                'total' => 0,
                'archived' => 0,
                'applied' => 0,
                'interview' => 0,
                'offer' => 0,
                'rejected' => 0,
                'todayApplications' => 0,
                'weekApplications' => 0,
                'upcomingInterviews' => 0,
            ]]);
    }
}
