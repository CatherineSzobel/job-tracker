<?php

namespace Tests\Feature;

use App\Enums\TagColor;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class TagsTest extends TestCase
{
    use RefreshDatabase;

    public function test_lists_the_users_tags_by_name_with_how_often_they_are_used(): void
    {
        $user = User::factory()->create();
        $remote = Tag::factory()->for($user)->create(['name' => 'remote']);
        Tag::factory()->for($user)->create(['name' => 'fintech']);
        Tag::factory()->create(['name' => 'not mine']);
        $user->jobApplications()->create(['company_name' => 'Acme', 'position' => 'Developer'])->tags()->attach($remote);

        $this->actingAs($user)->getJson('/api/tags')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.name', 'fintech')
            ->assertJsonPath('data.0.applications_count', 0)
            ->assertJsonPath('data.1.name', 'remote')
            ->assertJsonPath('data.1.applications_count', 1);
    }

    public function test_creates_a_tag_with_the_colour_given(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/api/tags', ['name' => 'remote', 'color' => 'teal'])
            ->assertCreated()
            ->assertJsonPath('data.name', 'remote')
            ->assertJsonPath('data.color', 'teal');

        $this->assertSame(TagColor::Teal, $user->tags()->sole()->color);
    }

    public function test_without_a_colour_the_first_unused_palette_colour_is_picked(): void
    {
        $user = User::factory()->create();
        Tag::factory()->for($user)->create(['color' => TagColor::Slate]);

        $this->actingAs($user)->postJson('/api/tags', ['name' => 'remote'])
            ->assertCreated()
            ->assertJsonPath('data.color', 'red');
    }

    public function test_once_every_colour_is_used_new_tags_cycle_through_the_palette(): void
    {
        $user = User::factory()->create();
        foreach (TagColor::cases() as $color) {
            Tag::factory()->for($user)->create(['color' => $color]);
        }

        // 8 tags already: 8 % 8 = the first colour again
        $this->actingAs($user)->postJson('/api/tags', ['name' => 'ninth'])
            ->assertCreated()
            ->assertJsonPath('data.color', 'slate');
    }

    /**
     * @return array<string, array{string}>
     */
    public static function sameNameAsRemote(): array
    {
        return [
            'different case' => ['Remote'],
            'surrounding spaces' => ['  remote '],
        ];
    }

    #[DataProvider('sameNameAsRemote')]
    public function test_a_name_the_user_already_has_is_rejected_ignoring_case_and_spaces(string $name): void
    {
        $user = User::factory()->create();
        Tag::factory()->for($user)->create(['name' => 'remote']);

        $this->actingAs($user)->postJson('/api/tags', ['name' => $name])
            ->assertJsonValidationErrors('name');

        $this->assertSame(1, $user->tags()->count());
    }

    public function test_another_user_can_use_the_same_name(): void
    {
        Tag::factory()->create(['name' => 'remote']);

        $this->actingAs(User::factory()->create())->postJson('/api/tags', ['name' => 'remote'])
            ->assertCreated();
    }

    /**
     * @return array<string, array{array<string, mixed>, string}>
     */
    public static function invalidTags(): array
    {
        return [
            'no name' => [['color' => 'red'], 'name'],
            'name not text' => [['name' => ['remote']], 'name'],
            'name too long' => [['name' => str_repeat('a', 31)], 'name'],
            'unknown colour' => [['name' => 'remote', 'color' => 'gold'], 'color'],
        ];
    }

    #[DataProvider('invalidTags')]
    public function test_invalid_tags_return_422(array $body, string $errorKey): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/api/tags', $body)->assertJsonValidationErrors($errorKey);

        $this->assertSame(0, $user->tags()->count());
    }

    public function test_renames_and_recolours_a_tag(): void
    {
        $user = User::factory()->create();
        $tag = Tag::factory()->for($user)->create(['name' => 'remote', 'color' => TagColor::Blue]);

        $this->actingAs($user)->patchJson("/api/tags/{$tag->id}", ['name' => 'hybrid', 'color' => 'pink'])
            ->assertOk()
            ->assertJsonPath('data.name', 'hybrid')
            ->assertJsonPath('data.color', 'pink');

        $this->assertSame('hybrid', $tag->fresh()->name);
    }

    public function test_renaming_a_tag_to_its_own_name_in_another_case_is_allowed(): void
    {
        $user = User::factory()->create();
        $tag = Tag::factory()->for($user)->create(['name' => 'remote']);

        $this->actingAs($user)->patchJson("/api/tags/{$tag->id}", ['name' => 'Remote'])
            ->assertOk()
            ->assertJsonPath('data.name', 'Remote');
    }

    public function test_renaming_to_another_of_the_users_tag_names_is_rejected(): void
    {
        $user = User::factory()->create();
        Tag::factory()->for($user)->create(['name' => 'remote']);
        $tag = Tag::factory()->for($user)->create(['name' => 'fintech']);

        $this->actingAs($user)->patchJson("/api/tags/{$tag->id}", ['name' => 'REMOTE'])
            ->assertJsonValidationErrors('name');

        $this->assertSame('fintech', $tag->fresh()->name);
    }

    public function test_deleting_a_tag_removes_it_from_applications(): void
    {
        $user = User::factory()->create();
        $tag = Tag::factory()->for($user)->create();
        $job = $user->jobApplications()->create(['company_name' => 'Acme', 'position' => 'Developer']);
        $job->tags()->attach($tag);

        $this->actingAs($user)->deleteJson("/api/tags/{$tag->id}")->assertNoContent();

        $this->assertModelMissing($tag);
        $this->assertModelExists($job);
        $this->assertFalse($job->tags()->exists());
    }

    public function test_sets_the_tags_of_an_application(): void
    {
        $user = User::factory()->create();
        $job = $user->jobApplications()->create(['company_name' => 'Acme', 'position' => 'Developer']);
        $remote = Tag::factory()->for($user)->create(['name' => 'remote']);
        $fintech = Tag::factory()->for($user)->create(['name' => 'fintech']);
        $job->tags()->attach($remote);

        $this->actingAs($user)->putJson("/api/job-applications/{$job->id}/tags", ['tag_ids' => [$remote->id, $fintech->id]])
            ->assertOk()
            ->assertJsonPath('data.tags.0.name', 'fintech')
            ->assertJsonPath('data.tags.1.name', 'remote');

        $this->putJson("/api/job-applications/{$job->id}/tags", ['tag_ids' => []])
            ->assertOk()
            ->assertJsonCount(0, 'data.tags');

        $this->assertFalse($job->tags()->exists());
    }

    public function test_an_application_cannot_get_another_users_tag(): void
    {
        $user = User::factory()->create();
        $job = $user->jobApplications()->create(['company_name' => 'Acme', 'position' => 'Developer']);
        $theirTag = Tag::factory()->create();

        $this->actingAs($user)->putJson("/api/job-applications/{$job->id}/tags", ['tag_ids' => [$theirTag->id]])
            ->assertJsonValidationErrors('tag_ids.0');

        $this->assertFalse($job->tags()->exists());
    }

    public function test_application_list_and_detail_include_tags_sorted_by_name(): void
    {
        $user = User::factory()->create();
        $job = $user->jobApplications()->create(['company_name' => 'Acme', 'position' => 'Developer']);
        $job->tags()->attach([
            Tag::factory()->for($user)->create(['name' => 'remote'])->id,
            Tag::factory()->for($user)->create(['name' => 'fintech'])->id,
        ]);

        $this->actingAs($user)->getJson('/api/job-applications')
            ->assertOk()
            ->assertJsonPath('data.0.tags.0.name', 'fintech')
            ->assertJsonPath('data.0.tags.1.name', 'remote');
        $this->getJson("/api/job-applications/{$job->id}")
            ->assertOk()
            ->assertJsonCount(2, 'data.tags');
    }

    public function test_saving_the_whole_application_keeps_and_returns_its_tags(): void
    {
        $user = User::factory()->create();
        $job = $user->jobApplications()->create(['company_name' => 'Acme', 'position' => 'Developer']);
        $tag = Tag::factory()->for($user)->create();
        $job->tags()->attach($tag);

        // The job page PUTs the whole job, including its tags array
        $this->actingAs($user)->putJson("/api/job-applications/{$job->id}", [
            'company_name' => 'Globex',
            'tags' => [['id' => 999, 'name' => 'injected', 'color' => 'red']],
        ])
            ->assertOk()
            ->assertJsonCount(1, 'data.tags')
            ->assertJsonPath('data.tags.0.id', $tag->id);

        $this->assertSame([$tag->id], $job->tags()->pluck('tags.id')->all());
    }
}
