<?php

namespace Tests\Feature;

use App\Enums\ArchiveTodosAction;
use App\Models\JobApplication;
use App\Models\Todo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class ArchiveTodosTest extends TestCase
{
    use RefreshDatabase;

    /**
     * An application with 2 open to-dos and 1 done one.
     */
    private function jobWithTodos(User $user, bool $archived = false): JobApplication
    {
        $job = $user->jobApplications()->create(['company_name' => 'Acme', 'position' => 'Developer', 'is_archived' => $archived]);
        Todo::factory()->for($user)->count(2)->create(['job_application_id' => $job->id]);
        Todo::factory()->for($user)->done()->create(['job_application_id' => $job->id]);

        return $job;
    }

    public function test_archiving_with_delete_open_todos_deletes_open_todos_and_keeps_done_ones(): void
    {
        $user = User::factory()->create();
        $job = $this->jobWithTodos($user);

        $this->actingAs($user)->putJson("/api/job-applications/{$job->id}", ['is_archived' => true, 'delete_open_todos' => true])->assertOk();

        $this->assertTrue($job->fresh()->is_archived);
        $this->assertSame(0, $job->todos()->where('done', false)->count());
        $this->assertSame(1, $job->todos()->where('done', true)->count());

        $this->putJson("/api/job-applications/{$job->id}", ['is_archived' => false])->assertOk();
        $this->assertSame(1, $job->todos()->count(), 'restoring does not bring deleted to-dos back');
    }

    public function test_archiving_with_delete_open_todos_false_keeps_all_todos(): void
    {
        $user = User::factory()->create(['archive_todos' => ArchiveTodosAction::Delete]);
        $job = $this->jobWithTodos($user);

        $this->actingAs($user)->putJson("/api/job-applications/{$job->id}", ['is_archived' => true, 'delete_open_todos' => false])->assertOk();

        $this->assertSame(3, $job->todos()->count());
    }

    /**
     * @return array<string, array{ArchiveTodosAction, int}>
     */
    public static function settingsAndRemainingTodos(): array
    {
        return [
            'delete removes the 2 open ones' => [ArchiveTodosAction::Delete, 1],
            'ask keeps them' => [ArchiveTodosAction::Ask, 3],
            'keep keeps them' => [ArchiveTodosAction::Keep, 3],
        ];
    }

    #[DataProvider('settingsAndRemainingTodos')]
    public function test_archiving_without_the_flag_follows_the_users_setting(ArchiveTodosAction $setting, int $remaining): void
    {
        $user = User::factory()->create(['archive_todos' => $setting]);
        $job = $this->jobWithTodos($user);

        $this->actingAs($user)->putJson("/api/job-applications/{$job->id}", ['is_archived' => true])->assertOk();

        $this->assertSame($remaining, $job->todos()->count());
    }

    public function test_the_flag_is_ignored_when_the_request_does_not_archive(): void
    {
        $user = User::factory()->create();
        $job = $this->jobWithTodos($user);

        $this->actingAs($user)->putJson("/api/job-applications/{$job->id}", ['status' => 'interview', 'delete_open_todos' => true])->assertOk();

        $this->assertSame(3, $job->todos()->count());
    }

    public function test_editing_an_already_archived_application_does_not_delete_its_todos(): void
    {
        $user = User::factory()->create(['archive_todos' => ArchiveTodosAction::Delete]);
        $job = $this->jobWithTodos($user, archived: true);

        // The job page saves the whole job, including is_archived: true
        $this->actingAs($user)->putJson("/api/job-applications/{$job->id}", ['is_archived' => true, 'notes' => 'Edited'])->assertOk();

        $this->assertSame(3, $job->todos()->count());
    }

    public function test_archiving_only_deletes_that_applications_open_todos(): void
    {
        $user = User::factory()->create();
        $job = $this->jobWithTodos($user);
        $otherJob = $this->jobWithTodos($user);
        $general = Todo::factory()->for($user)->create();

        $this->actingAs($user)->putJson("/api/job-applications/{$job->id}", ['is_archived' => true, 'delete_open_todos' => true])->assertOk();

        $this->assertSame(3, $otherJob->todos()->count());
        $this->assertModelExists($general);
    }

    public function test_open_todos_count_is_on_the_index_show_and_update(): void
    {
        $user = User::factory()->create();
        $job = $this->jobWithTodos($user);

        $this->actingAs($user)->getJson('/api/job-applications')->assertOk()->assertJsonPath('data.0.open_todos_count', 2);
        $this->getJson("/api/job-applications/{$job->id}")->assertOk()->assertJsonPath('data.open_todos_count', 2);
        $this->putJson("/api/job-applications/{$job->id}", ['notes' => 'Edited'])->assertOk()->assertJsonPath('data.open_todos_count', 2);
    }
}
