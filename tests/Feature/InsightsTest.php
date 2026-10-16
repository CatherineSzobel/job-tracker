<?php

namespace Tests\Feature;

use App\Enums\JobStatus;
use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InsightsTest extends TestCase
{
    use RefreshDatabase;

    private function jobFor(User $user, array $attributes = []): JobApplication
    {
        return $user->jobApplications()->create(['company_name' => 'Acme', 'position' => 'Developer', 'applied_date' => '2026-10-01', ...$attributes]);
    }

    public function test_without_applications_the_counts_are_zero_and_the_rates_empty(): void
    {
        $this->actingAs(User::factory()->create())->getJson('/api/job-applications/insights')
            ->assertOk()
            ->assertExactJson(['data' => [
                'applied' => 0, 'responded' => 0, 'response_rate' => null,
                'interviewed' => 0, 'offers' => 0, 'offer_rate' => null,
                'average_days_to_reply' => null, 'timed_replies' => 0,
                'by_source' => [],
            ]]);
    }

    public function test_response_and_offer_rates_count_replies_now_and_in_the_status_history(): void
    {
        $user = User::factory()->create();
        $this->jobFor($user, ['status' => JobStatus::Applied]);
        $this->jobFor($user, ['status' => JobStatus::Rejected]);
        $this->jobFor($user, ['status' => JobStatus::Interview]);
        $this->jobFor($user, ['status' => JobStatus::Offer, 'is_archived' => true]);
        $this->jobFor($user, ['status' => JobStatus::NoResponse]);
        // Interviewed, then withdrew: only the history shows the reply
        $this->jobFor($user, ['status' => JobStatus::Withdrawn])->statusChanges()->create(['from_status' => 'applied', 'to_status' => 'interview', 'changed_at' => '2026-10-05']);
        // An interview booked while the status was never changed
        $withInterview = $this->jobFor($user, ['status' => JobStatus::Applied]);
        $withInterview->interviews()->create(['user_id' => $user->id, 'interview_date' => '2026-10-20 10:00:00']);
        // Not applied for yet, and someone else's: neither counts
        $this->jobFor($user, ['status' => JobStatus::Saved, 'applied_date' => null]);
        $this->jobFor(User::factory()->create(), ['status' => JobStatus::Offer]);

        $this->actingAs($user)->getJson('/api/job-applications/insights')
            ->assertOk()
            ->assertJsonPath('data.applied', 7)
            ->assertJsonPath('data.responded', 5)
            ->assertJsonPath('data.response_rate', 71)
            ->assertJsonPath('data.interviewed', 4)
            ->assertJsonPath('data.offers', 1)
            ->assertJsonPath('data.offer_rate', 25);
    }

    public function test_days_to_reply_average_the_first_recorded_reply_of_each_application(): void
    {
        $user = User::factory()->create();
        $quick = $this->jobFor($user, ['status' => JobStatus::Offer]);
        $quick->statusChanges()->create(['from_status' => 'applied', 'to_status' => 'interview', 'changed_at' => '2026-10-05 09:00:00']);
        $quick->statusChanges()->create(['from_status' => 'interview', 'to_status' => 'offer', 'changed_at' => '2026-10-09 09:00:00']);
        $this->jobFor($user, ['status' => JobStatus::Rejected])
            ->statusChanges()->create(['from_status' => 'applied', 'to_status' => 'rejected', 'changed_at' => '2026-10-11 16:00:00']);
        // A reply without a recorded change (from before the history existed) can't be timed
        $this->jobFor($user, ['status' => JobStatus::Rejected]);

        $this->actingAs($user)->getJson('/api/job-applications/insights')
            ->assertOk()
            ->assertJsonPath('data.average_days_to_reply', 7)
            ->assertJsonPath('data.timed_replies', 2);
    }

    public function test_applications_by_source_list_each_used_source_then_those_without_one(): void
    {
        $user = User::factory()->create();
        $this->jobFor($user, ['source' => 'referral']);
        $this->jobFor($user, ['source' => 'linkedin']);
        $this->jobFor($user, ['source' => 'linkedin', 'status' => JobStatus::Saved, 'applied_date' => null]);
        $this->jobFor($user);

        $this->actingAs($user)->getJson('/api/job-applications/insights')
            ->assertOk()
            ->assertJsonPath('data.by_source', [
                ['source' => 'linkedin', 'count' => 2],
                ['source' => 'referral', 'count' => 1],
                ['source' => null, 'count' => 1],
            ]);
    }
}
