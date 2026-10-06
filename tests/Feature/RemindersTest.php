<?php

namespace Tests\Feature;

use App\Enums\ReminderDismissMode;
use App\Models\JobApplication;
use App\Models\Todo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class RemindersTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function userWithReminders(array $attributes = []): User
    {
        return User::factory()->create(['reminders_in_app' => true, ...$attributes]);
    }

    /**
     * An application last updated $daysAgo days ago.
     *
     * @param  array<string, mixed>  $attributes
     */
    private function jobUpdatedDaysAgo(User $user, int $daysAgo, array $attributes = []): JobApplication
    {
        $this->travelTo(now()->subDays($daysAgo));
        $job = $user->jobApplications()->create(['company_name' => 'Acme', 'position' => 'Developer', ...$attributes]);
        $this->travelBack();

        return $job;
    }

    /**
     * @return list<int>
     */
    private function remindedApplicationIds(): array
    {
        return array_column($this->getJson('/api/reminders')->assertOk()->json('data.applications'), 'id');
    }

    public function test_lists_applied_applications_with_no_update_for_the_chosen_days_oldest_first(): void
    {
        $user = $this->userWithReminders();
        $older = $this->jobUpdatedDaysAgo($user, 20);
        $stale = $this->jobUpdatedDaysAgo($user, 7);

        $this->actingAs($user)->getJson('/api/reminders')
            ->assertOk()
            ->assertJsonPath('data.applications.0.id', $older->id)
            ->assertJsonPath('data.applications.0.days_since_update', 20)
            ->assertJsonPath('data.applications.1.id', $stale->id);
    }

    public function test_an_application_updated_one_day_too_recently_is_not_due(): void
    {
        $user = $this->userWithReminders();
        $this->jobUpdatedDaysAgo($user, 6);

        $this->actingAs($user);
        $this->assertSame([], $this->remindedApplicationIds());
    }

    public function test_respects_the_users_number_of_days(): void
    {
        $user = $this->userWithReminders(['reminder_days' => 14]);
        $this->jobUpdatedDaysAgo($user, 10);
        $due = $this->jobUpdatedDaysAgo($user, 14);

        $this->actingAs($user);
        $this->assertSame([$due->id], $this->remindedApplicationIds());
    }

    /**
     * @return array<string, array{array<string, mixed>}>
     */
    public static function notDueApplications(): array
    {
        return [
            'archived' => [['is_archived' => true]],
            'interviewing' => [['status' => 'interview']],
            'offer' => [['status' => 'offer']],
            'rejected' => [['status' => 'rejected']],
        ];
    }

    #[DataProvider('notDueApplications')]
    public function test_only_active_applied_applications_are_due(array $attributes): void
    {
        $user = $this->userWithReminders();
        $this->jobUpdatedDaysAgo($user, 30, $attributes);

        $this->actingAs($user);
        $this->assertSame([], $this->remindedApplicationIds());
    }

    public function test_nothing_is_listed_when_in_app_reminders_are_off(): void
    {
        $user = User::factory()->create();
        $this->jobUpdatedDaysAgo($user, 30);
        Todo::factory()->for($user)->create(['due_date' => today()->toDateString()]);

        $this->actingAs($user)->getJson('/api/reminders')
            ->assertOk()
            ->assertExactJson(['data' => ['applications' => [], 'todos' => []]]);
    }

    public function test_hide_for_today_hides_it_until_tomorrow(): void
    {
        $user = $this->userWithReminders();
        $job = $this->jobUpdatedDaysAgo($user, 10);

        $this->actingAs($user)->postJson("/api/job-applications/{$job->id}/dismiss-reminder")->assertNoContent();
        $this->assertSame([], $this->remindedApplicationIds());

        $this->travel(1)->days();
        $this->assertSame([$job->id], $this->remindedApplicationIds());
    }

    public function test_dismiss_completely_lasts_until_the_application_is_updated_and_goes_stale_again(): void
    {
        $user = $this->userWithReminders(['reminder_dismiss_mode' => ReminderDismissMode::Permanent]);
        $job = $this->jobUpdatedDaysAgo($user, 10);

        $this->actingAs($user)->postJson("/api/job-applications/{$job->id}/dismiss-reminder")->assertNoContent();
        $this->travel(30)->days();
        $this->assertSame([], $this->remindedApplicationIds(), 'time alone does not bring it back');

        $this->putJson("/api/job-applications/{$job->id}", ['notes' => 'Emailed them'])->assertOk();
        $this->travel(7)->days();
        $this->assertSame([$job->id], $this->remindedApplicationIds());
    }

    public function test_dismissing_does_not_change_when_the_application_was_last_updated(): void
    {
        $user = $this->userWithReminders(['reminder_dismiss_mode' => ReminderDismissMode::Permanent]);
        $job = $this->jobUpdatedDaysAgo($user, 10);
        $updatedAt = $job->updated_at->toDateTimeString();

        $this->actingAs($user)->postJson("/api/job-applications/{$job->id}/dismiss-reminder")->assertNoContent();

        $this->assertSame($updatedAt, $job->fresh()->updated_at->toDateTimeString());
        $this->assertNotNull($job->fresh()->reminder_dismissed_at);
    }

    public function test_lists_open_todos_due_today_or_earlier_oldest_first(): void
    {
        $user = $this->userWithReminders();
        $job = $user->jobApplications()->create(['company_name' => 'Acme', 'position' => 'Developer']);
        $overdue = Todo::factory()->for($user)->create(['due_date' => today()->subDays(2)->toDateString(), 'job_application_id' => $job->id]);
        $today = Todo::factory()->for($user)->create(['due_date' => today()->toDateString()]);
        Todo::factory()->for($user)->create(['due_date' => today()->addDay()->toDateString()]);
        Todo::factory()->for($user)->create();
        Todo::factory()->for($user)->done()->create(['due_date' => today()->subDay()->toDateString()]);

        $this->actingAs($user)->getJson('/api/reminders')
            ->assertOk()
            ->assertJsonCount(2, 'data.todos')
            ->assertJsonPath('data.todos.0.id', $overdue->id)
            ->assertJsonPath('data.todos.0.job_application.company_name', 'Acme')
            ->assertJsonPath('data.todos.1.id', $today->id);
    }

    public function test_todos_of_archived_applications_are_not_reminders(): void
    {
        $user = $this->userWithReminders();
        $archived = $user->jobApplications()->create(['company_name' => 'Acme', 'position' => 'Developer', 'is_archived' => true]);
        Todo::factory()->for($user)->create(['due_date' => today()->toDateString(), 'job_application_id' => $archived->id]);

        $this->actingAs($user)->getJson('/api/reminders')->assertOk()->assertJsonCount(0, 'data.todos');
    }

    public function test_dismissing_another_users_application_is_not_found(): void
    {
        $job = $this->jobUpdatedDaysAgo(User::factory()->create(), 10);

        $this->actingAs($this->userWithReminders())
            ->postJson("/api/job-applications/{$job->id}/dismiss-reminder")
            ->assertNotFound();

        $this->assertNull($job->fresh()->reminder_hidden_until);
    }
}
