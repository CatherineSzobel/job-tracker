<?php

namespace Tests\Feature;

use App\Models\JobApplication;
use App\Models\Todo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class TodosTest extends TestCase
{
    use RefreshDatabase;

    private function jobFor(User $user, string $company = 'Acme'): JobApplication
    {
        return $user->jobApplications()->create(['company_name' => $company, 'position' => 'Developer']);
    }

    public function test_creates_a_dated_todo_linked_to_an_application_and_returns_201(): void
    {
        $user = User::factory()->create();
        $job = $this->jobFor($user);

        $this->actingAs($user)->postJson('/api/todos', [
            'text' => 'Email recruiter',
            'due_date' => '2026-10-02',
            'job_application_id' => $job->id,
        ])
            ->assertCreated()
            ->assertJsonPath('data.due_date', '2026-10-02')
            ->assertJsonPath('data.job_application', ['id' => $job->id, 'company_name' => 'Acme', 'position' => 'Developer']);

        $todo = $user->todos()->sole();
        $this->assertSame('2026-10-02', $todo->due_date->toDateString());
        $this->assertSame($job->id, $todo->job_application_id);
    }

    public function test_creates_a_general_todo_with_no_date_or_application(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/api/todos', ['text' => 'Update CV'])
            ->assertCreated()
            ->assertJsonPath('data.due_date', null)
            ->assertJsonPath('data.job_application', null);
    }

    public function test_creating_a_todo_for_another_users_application_returns_422(): void
    {
        $user = User::factory()->create();
        $othersJob = $this->jobFor(User::factory()->create());

        $this->actingAs($user)->postJson('/api/todos', ['text' => 'Sneaky', 'job_application_id' => $othersJob->id])
            ->assertJsonValidationErrors('job_application_id');

        $this->assertSame(0, $user->todos()->count());
    }

    /**
     * @return array<string, array{string}>
     */
    public static function notPlainDates(): array
    {
        return [
            'with a time' => ['2026-10-02 10:00'],
            'day first' => ['02/10/2026'],
            'words' => ['next week'],
        ];
    }

    #[DataProvider('notPlainDates')]
    public function test_a_due_date_that_is_not_a_plain_date_returns_422(string $dueDate): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/api/todos', ['text' => 'Call', 'due_date' => $dueDate])
            ->assertJsonValidationErrors('due_date');

        $this->assertSame(0, $user->todos()->count());
    }

    public function test_update_changes_text_due_date_and_link(): void
    {
        $user = User::factory()->create();
        $job = $this->jobFor($user);
        $todo = Todo::factory()->for($user)->create(['text' => 'Old']);

        $this->actingAs($user)->patchJson("/api/todos/{$todo->id}", [
            'text' => 'New',
            'due_date' => '2026-09-01',
            'job_application_id' => $job->id,
        ])
            ->assertOk()
            ->assertJsonPath('data.text', 'New')
            ->assertJsonPath('data.due_date', '2026-09-01')
            ->assertJsonPath('data.job_application.id', $job->id);

        $todo->refresh();
        $this->assertSame('New', $todo->text);
        $this->assertSame($job->id, $todo->job_application_id);
    }

    public function test_update_clears_the_due_date_and_link_with_null(): void
    {
        $user = User::factory()->create();
        $todo = Todo::factory()->for($user)->create(['due_date' => '2026-10-02', 'job_application_id' => $this->jobFor($user)->id]);

        $this->actingAs($user)->patchJson("/api/todos/{$todo->id}", ['due_date' => null, 'job_application_id' => null])
            ->assertOk()
            ->assertJsonPath('data.due_date', null)
            ->assertJsonPath('data.job_application', null);

        $todo->refresh();
        $this->assertNull($todo->due_date);
        $this->assertNull($todo->job_application_id);
    }

    public function test_linking_a_todo_to_another_users_application_through_update_returns_422(): void
    {
        $user = User::factory()->create();
        $todo = Todo::factory()->for($user)->create();
        $othersJob = $this->jobFor(User::factory()->create());

        $this->actingAs($user)->patchJson("/api/todos/{$todo->id}", ['job_application_id' => $othersJob->id])
            ->assertJsonValidationErrors('job_application_id');

        $this->assertNull($todo->fresh()->job_application_id);
    }

    public function test_list_puts_open_before_done_then_due_date_with_undated_last(): void
    {
        $user = User::factory()->create();
        $done = Todo::factory()->for($user)->done()->create(['due_date' => '2026-09-01']);
        $undated = Todo::factory()->for($user)->create();
        $later = Todo::factory()->for($user)->create(['due_date' => '2026-10-05']);
        $sooner = Todo::factory()->for($user)->create(['due_date' => '2026-10-01']);

        $response = $this->actingAs($user)->getJson('/api/todos');

        $response->assertOk();
        $this->assertSame([$sooner->id, $later->id, $undated->id, $done->id], array_column($response->json('data'), 'id'));
    }

    public function test_list_filters_by_application(): void
    {
        $user = User::factory()->create();
        $job = $this->jobFor($user);
        $linked = Todo::factory()->for($user)->create(['job_application_id' => $job->id]);
        Todo::factory()->for($user)->create();

        $this->actingAs($user)->getJson("/api/todos?job_application_id={$job->id}")
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $linked->id);
    }

    public function test_list_filter_for_another_users_or_a_non_numeric_application_is_empty(): void
    {
        $user = User::factory()->create();
        Todo::factory()->for($user)->create();
        $othersJob = $this->jobFor(User::factory()->create());

        $this->actingAs($user)->getJson("/api/todos?job_application_id={$othersJob->id}")->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/todos?job_application_id=abc')->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_deleting_an_application_deletes_its_todos(): void
    {
        $user = User::factory()->create();
        $job = $this->jobFor($user);
        $linked = Todo::factory()->for($user)->create(['job_application_id' => $job->id]);
        $general = Todo::factory()->for($user)->create();

        $this->actingAs($user)->deleteJson("/api/job-applications/{$job->id}")->assertNoContent();

        $this->assertModelMissing($linked);
        $this->assertModelExists($general);
    }
}
