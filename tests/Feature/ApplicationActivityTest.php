<?php

namespace Tests\Feature;

use App\Enums\JobStatus;
use App\Models\Document;
use App\Models\JobApplication;
use App\Models\Todo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * The status history and the activity timeline built from it.
 */
class ApplicationActivityTest extends TestCase
{
    use RefreshDatabase;

    private function jobFor(User $user, array $attributes = []): JobApplication
    {
        return $user->jobApplications()->create(['company_name' => 'Acme', 'position' => 'Developer', ...$attributes]);
    }

    /**
     * @return list<array{0: string, 1: string}>
     */
    private function statusHistory(JobApplication $job): array
    {
        return $job->statusChanges()->orderBy('id')->get()
            ->map(fn ($change) => [$change->from_status->value, $change->to_status->value])
            ->all();
    }

    public function test_a_status_change_is_recorded_once_and_saving_the_same_status_records_nothing(): void
    {
        $user = User::factory()->create();
        $job = $this->jobFor($user, ['status' => JobStatus::Applied]);

        $this->actingAs($user)->putJson("/api/job-applications/{$job->id}", ['status' => 'interview'])->assertOk();
        $this->putJson("/api/job-applications/{$job->id}", ['status' => 'interview', 'notes' => 'Second round next week'])->assertOk();

        $this->assertSame([['applied', 'interview']], $this->statusHistory($job));
    }

    public function test_batch_status_changes_are_recorded_only_where_the_status_changed(): void
    {
        $user = User::factory()->create();
        $moved = $this->jobFor($user, ['status' => JobStatus::Interview]);
        $unchanged = $this->jobFor($user, ['status' => JobStatus::Offer]);

        $this->actingAs($user)->patchJson('/api/job-applications/batch-changes', ['changes' => [
            ['id' => $moved->id, 'status' => 'offer'],
            ['id' => $unchanged->id, 'status' => 'offer'],
        ]])->assertOk();

        $this->assertSame([['interview', 'offer']], $this->statusHistory($moved));
        $this->assertSame([], $this->statusHistory($unchanged));
    }

    public function test_the_timeline_lists_what_happened_newest_first(): void
    {
        $user = User::factory()->create();
        $this->travelTo('2026-10-01 09:00:00');
        $job = $this->jobFor($user, ['status' => JobStatus::Saved]);
        $this->actingAs($user);

        $this->travelTo('2026-10-02 10:00:00');
        $this->putJson("/api/job-applications/{$job->id}", ['status' => 'applied'])->assertOk();

        $interview = $job->interviews()->create(['user_id' => $user->id, 'interview_date' => '2026-10-05 14:00:00', 'type' => 'phone']);
        $job->interviews()->create(['user_id' => $user->id, 'interview_date' => '2026-10-30 14:00:00', 'type' => 'onsite']);

        $this->travelTo('2026-10-06 11:00:00');
        $todo = Todo::factory()->for($user)->create(['job_application_id' => $job->id, 'text' => 'Send thank-you note']);
        $this->putJson("/api/todos/{$todo->id}", ['done' => true])->assertOk();
        Todo::factory()->for($user)->create(['job_application_id' => $job->id, 'text' => 'Still open']);

        $this->travelTo('2026-10-07 12:00:00');
        $job->documents()->attach(Document::factory()->for($user)->create(['name' => 'CV 2026']), ['attached_at' => now()]);

        $this->travelTo('2026-10-08 13:00:00');
        $this->putJson("/api/job-applications/{$job->id}", ['is_archived' => true])->assertOk();

        $this->travelTo('2026-10-09 08:00:00');
        $this->getJson("/api/job-applications/{$job->id}/activity")
            ->assertOk()
            ->assertExactJson(['data' => [
                ['type' => 'archived', 'at' => '2026-10-08T13:00:00.000000Z'],
                ['type' => 'document_sent', 'at' => '2026-10-07T12:00:00.000000Z', 'document_name' => 'CV 2026'],
                ['type' => 'todo_done', 'at' => '2026-10-06T11:00:00.000000Z', 'text' => 'Send thank-you note'],
                ['type' => 'interview', 'at' => '2026-10-05T14:00:00.000000Z', 'interview_id' => $interview->id, 'interview_type' => 'phone'],
                ['type' => 'status', 'at' => '2026-10-02T10:00:00.000000Z', 'from' => 'saved', 'to' => 'applied'],
                ['type' => 'saved', 'at' => '2026-10-01T09:00:00.000000Z'],
            ]]);
    }

    public function test_an_application_added_as_applied_starts_with_its_applied_date(): void
    {
        $user = User::factory()->create();
        $job = $this->jobFor($user, ['applied_date' => '2026-09-15']);

        $this->actingAs($user)->getJson("/api/job-applications/{$job->id}/activity")
            ->assertOk()
            ->assertExactJson(['data' => [['type' => 'applied', 'at' => '2026-09-15']]]);
    }

    public function test_an_application_added_as_applied_and_moved_back_to_saved_was_never_saved_at_the_start(): void
    {
        $user = User::factory()->create();
        $this->travelTo('2026-10-01 09:00:00');
        $job = $this->jobFor($user, ['status' => 'applied', 'applied_date' => '2026-10-01']);
        $this->travelTo('2026-10-05 10:00:00');

        $this->actingAs($user)->putJson("/api/job-applications/{$job->id}", ['status' => 'saved'])->assertOk();

        $this->getJson("/api/job-applications/{$job->id}/activity")
            ->assertOk()
            ->assertExactJson(['data' => [
                ['type' => 'status', 'at' => '2026-10-05T10:00:00.000000Z', 'from' => 'applied', 'to' => 'saved'],
                ['type' => 'applied', 'at' => '2026-10-01'],
            ]]);
    }

    public function test_another_users_activity_is_not_found(): void
    {
        $job = $this->jobFor(User::factory()->create());

        $this->actingAs(User::factory()->create())->getJson("/api/job-applications/{$job->id}/activity")->assertNotFound();
    }
}
