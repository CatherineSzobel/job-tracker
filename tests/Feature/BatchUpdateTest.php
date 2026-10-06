<?php

namespace Tests\Feature;

use App\Enums\ArchiveTodosAction;
use App\Enums\JobStatus;
use App\Models\JobApplication;
use App\Models\Tag;
use App\Models\Todo;
use App\Models\User;
use Closure;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Collection;
use Illuminate\Testing\TestResponse;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class BatchUpdateTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @param  array<string, mixed>  $attributes
     * @return Collection<int, JobApplication>
     */
    private function jobsFor(User $user, int $count = 2, array $attributes = []): Collection
    {
        return collect(range(1, $count))->map(fn (int $number) => $user->jobApplications()->create([
            'company_name' => "Company {$number}",
            'position' => 'Developer',
            ...$attributes,
        ]));
    }

    /**
     * @param  array<string, mixed>  $body
     */
    private function batch(array $body): TestResponse
    {
        return $this->patchJson('/api/job-applications/batch', $body);
    }

    /**
     * @param  array<int, array<string, mixed>>  $changes
     */
    private function saveChanges(array $changes): TestResponse
    {
        return $this->patchJson('/api/job-applications/batch-changes', ['changes' => $changes]);
    }

    public function test_archives_and_restores_the_selected_applications(): void
    {
        $user = User::factory()->create();
        $jobs = $this->jobsFor($user);
        $ids = $jobs->pluck('id')->all();

        $this->actingAs($user)->batch(['ids' => $ids, 'is_archived' => true])
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.is_archived', true);
        $this->assertTrue($jobs->every(fn (JobApplication $job) => $job->fresh()->is_archived));

        $this->batch(['ids' => $ids, 'is_archived' => false])->assertOk();
        $this->assertTrue($jobs->every(fn (JobApplication $job) => ! $job->fresh()->is_archived));
    }

    public function test_the_archive_batch_only_archives(): void
    {
        $user = User::factory()->create();
        $job = $this->jobsFor($user, 1)->first();
        $tag = Tag::factory()->for($user)->create();

        $this->actingAs($user)->batch(['ids' => [$job->id], 'is_archived' => true, 'status' => 'offer', 'add_tag_ids' => [$tag->id]])
            ->assertOk();

        $this->assertTrue($job->fresh()->is_archived);
        $this->assertSame(JobStatus::Applied, $job->fresh()->status);
        $this->assertFalse($job->tags()->exists());
    }

    public function test_any_id_that_is_not_the_users_is_not_found_and_nothing_changes(): void
    {
        $user = User::factory()->create();
        $mine = $this->jobsFor($user, 1)->first();
        $theirs = $this->jobsFor(User::factory()->create(), 1)->first();

        $this->actingAs($user)->batch(['ids' => [$mine->id, $theirs->id], 'is_archived' => true])->assertNotFound();
        $this->batch(['ids' => [$mine->id, 999999], 'is_archived' => true])->assertNotFound();

        $this->assertFalse($mine->fresh()->is_archived);
        $this->assertFalse($theirs->fresh()->is_archived);
    }

    /**
     * @return array<string, array{Closure(int): array<string, mixed>, string}>
     */
    public static function invalidBatches(): array
    {
        return [
            'no ids' => [static fn (int $jobId): array => ['ids' => [], 'is_archived' => true], 'ids'],
            'more than 200 ids' => [static fn (int $jobId): array => ['ids' => range(1, 201), 'is_archived' => true], 'ids'],
            'the same id twice' => [static fn (int $jobId): array => ['ids' => [$jobId, $jobId], 'is_archived' => true], 'ids.0'],
            'no is_archived' => [static fn (int $jobId): array => ['ids' => [$jobId], 'status' => 'offer'], 'is_archived'],
            'is_archived that is not a boolean' => [static fn (int $jobId): array => ['ids' => [$jobId], 'is_archived' => 'soon'], 'is_archived'],
        ];
    }

    #[DataProvider('invalidBatches')]
    public function test_invalid_batches_return_422_and_change_nothing(Closure $body, string $errorKey): void
    {
        $user = User::factory()->create();
        $job = $this->jobsFor($user, 1)->first();

        $this->actingAs($user)->batch($body($job->id))->assertJsonValidationErrors($errorKey);

        $this->assertFalse($job->fresh()->is_archived);
        $this->assertSame(JobStatus::Applied, $job->fresh()->status);
    }

    public function test_a_batch_archive_counts_as_an_update(): void
    {
        $user = User::factory()->create();
        $this->travelTo(now()->subDays(3));
        $job = $this->jobsFor($user, 1)->first();
        $this->travelBack();

        $this->actingAs($user)->batch(['ids' => [$job->id], 'is_archived' => true])->assertOk();

        $this->assertTrue($job->fresh()->updated_at->isToday());
    }

    public function test_batch_archive_deletes_open_todos_only_on_newly_archived_applications(): void
    {
        $user = User::factory()->create();
        $active = $this->jobsFor($user, 1)->first();
        $alreadyArchived = $this->jobsFor($user, 1, ['is_archived' => true])->first();
        foreach ([$active, $alreadyArchived] as $job) {
            Todo::factory()->for($user)->create(['job_application_id' => $job->id]);
            Todo::factory()->for($user)->done()->create(['job_application_id' => $job->id]);
        }

        $this->actingAs($user)->batch([
            'ids' => [$active->id, $alreadyArchived->id],
            'is_archived' => true,
            'delete_open_todos' => true,
        ])->assertOk();

        $this->assertSame(1, $active->todos()->count(), 'open to-do deleted, done one kept');
        $this->assertSame(2, $alreadyArchived->todos()->count(), 'already archived: untouched');
    }

    /**
     * @return array<string, array{ArchiveTodosAction, int}>
     */
    public static function settingsAndRemainingTodos(): array
    {
        return [
            'delete removes the open one' => [ArchiveTodosAction::Delete, 1],
            'ask keeps it' => [ArchiveTodosAction::Ask, 2],
            'keep keeps it' => [ArchiveTodosAction::Keep, 2],
        ];
    }

    #[DataProvider('settingsAndRemainingTodos')]
    public function test_batch_archive_without_the_flag_follows_the_users_setting(ArchiveTodosAction $setting, int $remaining): void
    {
        $user = User::factory()->create(['archive_todos' => $setting]);
        $job = $this->jobsFor($user, 1)->first();
        Todo::factory()->for($user)->create(['job_application_id' => $job->id]);
        Todo::factory()->for($user)->done()->create(['job_application_id' => $job->id]);

        $this->actingAs($user)->batch(['ids' => [$job->id], 'is_archived' => true])->assertOk();

        $this->assertSame($remaining, $job->todos()->count());
    }

    public function test_the_todo_flag_is_ignored_when_restoring(): void
    {
        $user = User::factory()->create();
        $job = $this->jobsFor($user, 1, ['is_archived' => true])->first();
        Todo::factory()->for($user)->create(['job_application_id' => $job->id]);

        $this->actingAs($user)->batch(['ids' => [$job->id], 'is_archived' => false, 'delete_open_todos' => true])->assertOk();

        $this->assertSame(1, $job->todos()->count());
    }

    public function test_saves_a_different_status_for_each_application(): void
    {
        $user = User::factory()->create();
        [$first, $second, $third] = $this->jobsFor($user, 3);
        $untouched = $this->jobsFor($user, 1)->first();

        $this->actingAs($user)->saveChanges([
            ['id' => $first->id, 'status' => 'interview'],
            ['id' => $second->id, 'status' => 'interview'],
            ['id' => $third->id, 'status' => 'rejected'],
        ])->assertOk()->assertJsonCount(3, 'data');

        $this->assertSame(JobStatus::Interview, $first->fresh()->status);
        $this->assertSame(JobStatus::Interview, $second->fresh()->status);
        $this->assertSame(JobStatus::Rejected, $third->fresh()->status);
        $this->assertSame(JobStatus::Applied, $untouched->fresh()->status);
    }

    public function test_saves_tag_changes_per_application(): void
    {
        $user = User::factory()->create();
        [$first, $second] = $this->jobsFor($user);
        $remote = Tag::factory()->for($user)->create(['name' => 'remote']);
        $fintech = Tag::factory()->for($user)->create(['name' => 'fintech']);
        $second->tags()->attach($fintech);

        $this->actingAs($user)->saveChanges([
            ['id' => $first->id, 'add_tag_ids' => [$remote->id]],
            ['id' => $second->id, 'add_tag_ids' => [$remote->id], 'remove_tag_ids' => [$fintech->id], 'status' => 'offer'],
        ])->assertOk();

        $this->assertSame(['remote'], $first->tags()->pluck('name')->all());
        $this->assertSame(['remote'], $second->tags()->pluck('name')->all());
        $this->assertSame(JobStatus::Applied, $first->fresh()->status);
        $this->assertSame(JobStatus::Offer, $second->fresh()->status);
    }

    public function test_a_change_for_an_application_that_is_not_the_users_is_not_found_and_nothing_is_saved(): void
    {
        $user = User::factory()->create();
        $mine = $this->jobsFor($user, 1)->first();
        $theirs = $this->jobsFor(User::factory()->create(), 1)->first();

        $this->actingAs($user)->saveChanges([
            ['id' => $mine->id, 'status' => 'rejected'],
            ['id' => $theirs->id, 'status' => 'rejected'],
        ])->assertNotFound();

        $this->assertSame(JobStatus::Applied, $mine->fresh()->status);
        $this->assertSame(JobStatus::Applied, $theirs->fresh()->status);
    }

    public function test_an_id_sent_as_a_signed_string_is_saved(): void
    {
        $user = User::factory()->create();
        $job = $this->jobsFor($user, 1)->first();

        $this->actingAs($user)->saveChanges([['id' => "+{$job->id}", 'status' => 'offer']])->assertOk();

        $this->assertSame(JobStatus::Offer, $job->fresh()->status);
    }

    public function test_a_saved_status_change_counts_as_an_update(): void
    {
        $user = User::factory()->create();
        $this->travelTo(now()->subDays(3));
        $job = $this->jobsFor($user, 1)->first();
        $this->travelBack();

        $this->actingAs($user)->saveChanges([['id' => $job->id, 'status' => 'interview']])->assertOk();

        $this->assertTrue($job->fresh()->updated_at->isToday());
    }

    /**
     * @return array<string, array{Closure(int, int, int): array<int, array<string, mixed>>, string}>
     */
    public static function invalidChanges(): array
    {
        return [
            'no changes' => [static fn (int $jobId, int $tagId, int $theirTagId): array => [], 'changes'],
            'more than 200 changes' => [static fn (int $jobId, int $tagId, int $theirTagId): array => array_map(fn (int $id) => ['id' => $id, 'status' => 'offer'], range(1, 201)), 'changes'],
            'the same application twice' => [static fn (int $jobId, int $tagId, int $theirTagId): array => [['id' => $jobId, 'status' => 'offer'], ['id' => $jobId, 'status' => 'rejected']], 'changes.0.id'],
            'an entry without a change' => [static fn (int $jobId, int $tagId, int $theirTagId): array => [['id' => $jobId]], 'changes.0'],
            'unknown status' => [static fn (int $jobId, int $tagId, int $theirTagId): array => [['id' => $jobId, 'status' => 'hired']], 'changes.0.status'],
            'same tag added and removed' => [static fn (int $jobId, int $tagId, int $theirTagId): array => [['id' => $jobId, 'add_tag_ids' => [$tagId], 'remove_tag_ids' => [$tagId]]], 'changes.0.remove_tag_ids'],
            'another users tag' => [static fn (int $jobId, int $tagId, int $theirTagId): array => [['id' => $jobId, 'add_tag_ids' => [$theirTagId]]], 'changes.0.add_tag_ids.0'],
            'tag ids that are lists' => [static fn (int $jobId, int $tagId, int $theirTagId): array => [['id' => $jobId, 'add_tag_ids' => [[$tagId]], 'remove_tag_ids' => [[$tagId]]]], 'changes.0.add_tag_ids.0'],
        ];
    }

    #[DataProvider('invalidChanges')]
    public function test_invalid_changes_return_422_and_save_nothing(Closure $changes, string $errorKey): void
    {
        $user = User::factory()->create();
        $job = $this->jobsFor($user, 1)->first();
        $tag = Tag::factory()->for($user)->create();
        $theirTag = Tag::factory()->create();

        $this->actingAs($user)->saveChanges($changes($job->id, $tag->id, $theirTag->id))->assertJsonValidationErrors($errorKey);

        $this->assertSame(JobStatus::Applied, $job->fresh()->status);
        $this->assertFalse($job->tags()->exists());
    }
}
