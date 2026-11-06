<?php

namespace Tests\Feature;

use App\Enums\JobStatus;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Saved applications aren't applied for yet: no applied date until the status first moves on from Saved.
 */
class SavedStatusTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_saved_application_starts_without_an_applied_date_and_others_are_applied_today(): void
    {
        $user = User::factory()->create();
        $this->travelTo('2026-10-02 09:30:00');

        $this->actingAs($user)->postJson('/api/job-applications', ['company_name' => 'Acme', 'position' => 'Developer', 'status' => 'saved'])
            ->assertCreated()
            ->assertJsonPath('data.status', 'saved')
            ->assertJsonPath('data.applied_date', null);

        $this->postJson('/api/job-applications', ['company_name' => 'Globex', 'position' => 'Designer'])
            ->assertCreated()
            ->assertJsonPath('data.applied_date', '2026-10-02');
    }

    public function test_the_applied_date_is_set_the_first_time_the_status_leaves_saved(): void
    {
        $user = User::factory()->create();
        $job = $user->jobApplications()->create(['company_name' => 'Acme', 'position' => 'Developer', 'status' => JobStatus::Saved]);
        $this->actingAs($user);
        $this->travelTo('2026-10-02 09:30:00');

        $this->putJson("/api/job-applications/{$job->id}", ['notes' => 'Deadline Friday'])->assertJsonPath('data.applied_date', null);
        $this->putJson("/api/job-applications/{$job->id}", ['status' => 'applied'])->assertJsonPath('data.applied_date', '2026-10-02');

        $this->travel(5)->days();
        $this->putJson("/api/job-applications/{$job->id}", ['status' => 'saved'])->assertJsonPath('data.applied_date', '2026-10-02');
        $this->putJson("/api/job-applications/{$job->id}", ['status' => 'interview'])->assertJsonPath('data.applied_date', '2026-10-02');
    }

    public function test_withdrawing_a_saved_application_gives_it_no_applied_date_until_it_is_applied_for(): void
    {
        $user = User::factory()->create();
        $job = $user->jobApplications()->create(['company_name' => 'Acme', 'position' => 'Developer', 'status' => JobStatus::Saved]);
        $this->actingAs($user);
        $this->travelTo('2026-10-02 09:30:00');

        $this->putJson("/api/job-applications/{$job->id}", ['status' => 'withdrawn'])->assertJsonPath('data.applied_date', null);
        $this->putJson("/api/job-applications/{$job->id}", ['status' => 'no_response'])->assertJsonPath('data.applied_date', null);
        $this->putJson("/api/job-applications/{$job->id}", ['status' => 'applied'])->assertJsonPath('data.applied_date', '2026-10-02');
    }

    public function test_batch_status_changes_date_only_the_applications_leaving_saved(): void
    {
        $user = User::factory()->create();
        $leaving = $user->jobApplications()->create(['company_name' => 'Acme', 'position' => 'Developer', 'status' => JobStatus::Saved]);
        $staying = $user->jobApplications()->create(['company_name' => 'Globex', 'position' => 'Designer', 'status' => JobStatus::Saved]);
        $applied = $user->jobApplications()->create(['company_name' => 'Initech', 'position' => 'Tester', 'applied_date' => '2026-09-01']);
        $this->travelTo('2026-10-02 09:30:00');

        $this->actingAs($user)->patchJson('/api/job-applications/batch-changes', ['changes' => [
            ['id' => $leaving->id, 'status' => 'interview'],
            ['id' => $staying->id, 'status' => 'saved'],
            ['id' => $applied->id, 'status' => 'withdrawn'],
        ]])->assertOk();

        $this->assertSame('2026-10-02', $leaving->fresh()->applied_date->toDateString());
        $this->assertNull($staying->fresh()->applied_date);
        $this->assertSame('2026-09-01', $applied->fresh()->applied_date->toDateString());
        $this->assertSame(JobStatus::Withdrawn, $applied->fresh()->status);
    }
}
