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

    public function test_changes_the_status_of_every_selected_application_only(): void
    {
        $user = User::factory()->create();
        [$first, $second] = $this->jobsFor($user);
        $untouched = $this->jobsFor($user, 1)->first();

        $this->actingAs($user)->batch(['ids' => [$first->id, $second->id], 'status' => 'rejected'])
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.status', 'rejected');

        $this->assertSame(JobStatus::Rejected, $first->fresh()->status);
        $this->assertSame(JobStatus::Rejected, $second->fresh()->status);
        $this->assertSame(JobStatus::Applied, $untouched->fresh()->status);
    }

    public function test_archives_and_restores_the_selected_applications(): void
    {
        $user = User::factory()->create();
        $jobs = $this->jobsFor($user);
        $ids = $jobs->pluck('id')->all();

        $this->actingAs($user)->batch(['ids' => $ids, 'is_archived' => true])->assertOk();
        $this->assertTrue($jobs->every(fn (JobApplication $job) => $job->fresh()->is_archived));

        $this->batch(['ids' => $ids, 'is_archived' => false])->assertOk();
        $this->assertTrue($jobs->every(fn (JobApplication $job) => ! $job->fresh()->is_archived));
    }

    public function test_adds_and_removes_tags_without_duplicates(): void
    {
        $user = User::factory()->create();
        [$first, $second] = $this->jobsFor($user);
        $remote = Tag::factory()->for($user)->create(['name' => 'remote']);
        $fintech = Tag::factory()->for($user)->create(['name' => 'fintech']);
        $first->tags()->attach([$remote->id, $fintech->id]);
        $ids = [$first->id, $second->id];

        $this->actingAs($user)->batch(['ids' => $ids, 'add_tag_ids' => [$remote->id]])->assertOk();

        $this->assertSame(1, $first->tags()->whereKey($remote->id)->count(), 'no duplicate pivot row');
        $this->assertTrue($second->tags()->whereKey($remote->id)->exists());

        $this->batch(['ids' => $ids, 'remove_tag_ids' => [$fintech->id]])->assertOk();

        $this->assertFalse($first->tags()->whereKey($fintech->id)->exists());
        $this->assertTrue($first->tags()->whereKey($remote->id)->exists());
    }

    public function test_applies_several_changes_in_one_request(): void
    {
        $user = User::factory()->create();
        $job = $this->jobsFor($user, 1)->first();
        $tag = Tag::factory()->for($user)->create(['name' => 'remote']);

        $this->actingAs($user)->batch(['ids' => [$job->id], 'status' => 'offer', 'add_tag_ids' => [$tag->id]])
            ->assertOk()
            ->assertJsonPath('data.0.status', 'offer')
            ->assertJsonPath('data.0.tags.0.name', 'remote');
    }

    public function test_any_id_that_is_not_the_users_is_not_found_and_nothing_changes(): void
    {
        $user = User::factory()->create();
        $mine = $this->jobsFor($user, 1)->first();
        $theirs = $this->jobsFor(User::factory()->create(), 1)->first();

        $this->actingAs($user)->batch(['ids' => [$mine->id, $theirs->id], 'status' => 'rejected'])->assertNotFound();
        $this->batch(['ids' => [$mine->id, 999999], 'status' => 'rejected'])->assertNotFound();

        $this->assertSame(JobStatus::Applied, $mine->fresh()->status);
        $this->assertSame(JobStatus::Applied, $theirs->fresh()->status);
    }

    /**
     * @return array<string, array{Closure(int, int): array<string, mixed>, string}>
     */
    public static function invalidBatches(): array
    {
        return [
            'no ids' => [static fn (int $jobId, int $tagId): array => ['ids' => [], 'status' => 'offer'], 'ids'],
            'more than 200 ids' => [static fn (int $jobId, int $tagId): array => ['ids' => range(1, 201), 'status' => 'offer'], 'ids'],
            'the same id twice' => [static fn (int $jobId, int $tagId): array => ['ids' => [$jobId, $jobId], 'status' => 'offer'], 'ids.0'],
            'no change' => [static fn (int $jobId, int $tagId): array => ['ids' => [$jobId]], 'changes'],
            'unknown status' => [static fn (int $jobId, int $tagId): array => ['ids' => [$jobId], 'status' => 'hired'], 'status'],
            'same tag added and removed' => [static fn (int $jobId, int $tagId): array => ['ids' => [$jobId], 'add_tag_ids' => [$tagId], 'remove_tag_ids' => [$tagId]], 'remove_tag_ids'],
            'tag ids that are lists' => [static fn (int $jobId, int $tagId): array => ['ids' => [$jobId], 'add_tag_ids' => [[$tagId]], 'remove_tag_ids' => [[$tagId]]], 'add_tag_ids.0'],
        ];
    }

    #[DataProvider('invalidBatches')]
    public function test_invalid_batches_return_422_and_change_nothing(Closure $body, string $errorKey): void
    {
        $user = User::factory()->create();
        $job = $this->jobsFor($user, 1)->first();
        $tag = Tag::factory()->for($user)->create();

        $this->actingAs($user)->batch($body($job->id, $tag->id))->assertJsonValidationErrors($errorKey);

        $this->assertSame(JobStatus::Applied, $job->fresh()->status);
        $this->assertFalse($job->tags()->exists());
    }

    public function test_another_users_tag_returns_422(): void
    {
        $user = User::factory()->create();
        $job = $this->jobsFor($user, 1)->first();
        $theirTag = Tag::factory()->create();

        $this->actingAs($user)->batch(['ids' => [$job->id], 'add_tag_ids' => [$theirTag->id]])
            ->assertJsonValidationErrors('add_tag_ids.0');

        $this->assertFalse($job->tags()->exists());
    }

    public function test_a_batch_status_change_counts_as_an_update(): void
    {
        $user = User::factory()->create();
        $this->travelTo(now()->subDays(3));
        $job = $this->jobsFor($user, 1)->first();
        $this->travelBack();

        $this->actingAs($user)->batch(['ids' => [$job->id], 'status' => 'interview'])->assertOk();

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

    public function test_the_todo_flag_is_ignored_when_not_archiving(): void
    {
        $user = User::factory()->create();
        $job = $this->jobsFor($user, 1)->first();
        Todo::factory()->for($user)->create(['job_application_id' => $job->id]);

        $this->actingAs($user)->batch(['ids' => [$job->id], 'status' => 'offer', 'delete_open_todos' => true])->assertOk();

        $this->assertSame(1, $job->todos()->count());
    }
}
