<?php

namespace Tests\Feature;

use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OwnershipTest extends TestCase
{
    use RefreshDatabase;

    private function jobFor(User $user): JobApplication
    {
        return $user->jobApplications()->create([
            'company_name' => 'Acme',
            'position' => 'Developer',
        ]);
    }

    public function test_user_cannot_update_another_users_job_application(): void
    {
        $job = $this->jobFor(User::factory()->create());

        $this->actingAs(User::factory()->create())
            ->putJson("/api/job-applications/{$job->id}", ['company_name' => 'Hacked'])
            ->assertNotFound();

        $this->assertSame('Acme', $job->fresh()->company_name);
    }

    public function test_user_cannot_delete_another_users_job_application(): void
    {
        $job = $this->jobFor(User::factory()->create());

        $this->actingAs(User::factory()->create())
            ->deleteJson("/api/job-applications/{$job->id}")
            ->assertNotFound();

        $this->assertModelExists($job);
    }

    public function test_user_can_update_and_delete_own_job_application(): void
    {
        $owner = User::factory()->create();
        $job = $this->jobFor($owner);

        $this->actingAs($owner)
            ->putJson("/api/job-applications/{$job->id}", ['company_name' => 'Globex'])
            ->assertOk();
        $this->assertSame('Globex', $job->fresh()->company_name);

        $this->actingAs($owner)
            ->deleteJson("/api/job-applications/{$job->id}")
            ->assertOk();
        $this->assertModelMissing($job);
    }

    public function test_user_cannot_delete_another_users_todo(): void
    {
        $todo = User::factory()->create()->todos()->create(['text' => 'Not yours']);

        $this->actingAs(User::factory()->create())
            ->deleteJson("/api/todos/{$todo->id}")
            ->assertNotFound();

        $this->assertModelExists($todo);
    }

    /**
     * Every route that targets a single record must answer 404 for someone else's record,
     * so IDs can't be probed and nothing is changed.
     */
    public function test_other_users_records_are_not_found_on_every_route(): void
    {
        $owner = User::factory()->create();
        $job = $this->jobFor($owner);
        $interview = $job->interviews()->create(['user_id' => $owner->id, 'interview_date' => now()->addDay()]);
        $todo = $owner->todos()->create(['text' => 'Mine']);
        $note = $owner->notes()->create(['title' => 'Mine', 'content' => 'Secret']);
        $link = $owner->profile()->create(['name' => 'Owner'])->links()->create(['type' => 'GitHub', 'url' => 'https://github.com/owner']);

        $intruder = User::factory()->create();
        $intruder->profile()->create(['name' => 'Intruder']);

        $requests = [
            ['getJson', "/api/job-applications/{$job->id}"],
            ['postJson', "/api/job-applications/{$job->id}/interviews", ['interview_date' => now()->addWeek()->toDateTimeString()]],
            ['putJson', "/api/interviews/{$interview->id}", ['location' => 'Hacked']],
            ['deleteJson', "/api/interviews/{$interview->id}"],
            ['putJson', "/api/todos/{$todo->id}", ['done' => true]],
            ['putJson', "/api/notes/{$note->id}", ['title' => 'Hacked']],
            ['deleteJson', "/api/notes/{$note->id}"],
            ['putJson', "/api/profile/links/{$link->id}", ['type' => 'Hacked', 'url' => 'https://evil.test']],
            ['deleteJson', "/api/profile/links/{$link->id}"],
        ];

        foreach ($requests as $request) {
            [$method, $uri] = $request;
            $status = $this->actingAs($intruder)->{$method}($uri, $request[2] ?? [])->status();

            $this->assertSame(404, $status, "{$method} {$uri} should be 404 for another user's record, got {$status}");
        }

        $this->assertSame(1, $job->interviews()->count());
        $this->assertNull($interview->fresh()->location);
        $this->assertFalse((bool) $todo->fresh()->done);
        $this->assertSame('Mine', $note->fresh()->title);
        $this->assertSame('GitHub', $link->fresh()->type);
    }

    public function test_user_without_profile_gets_404_not_500_on_someone_elses_link(): void
    {
        $owner = User::factory()->create();
        $link = $owner->profile()->create(['name' => 'Owner'])->links()->create(['type' => 'GitHub', 'url' => 'https://github.com/owner']);

        $this->actingAs(User::factory()->create())
            ->putJson("/api/profile/links/{$link->id}", ['type' => 'Hacked', 'url' => 'https://evil.test'])
            ->assertNotFound();
    }

    public function test_owner_can_still_manage_own_records(): void
    {
        $owner = User::factory()->create();
        $job = $this->jobFor($owner);
        $interview = $job->interviews()->create(['user_id' => $owner->id, 'interview_date' => now()->addDay()]);
        $todo = $owner->todos()->create(['text' => 'Mine']);
        $note = $owner->notes()->create(['title' => 'Mine', 'content' => '']);
        $link = $owner->profile()->create(['name' => 'Owner'])->links()->create(['type' => 'GitHub', 'url' => 'https://github.com/owner']);

        $this->actingAs($owner);
        $this->getJson("/api/job-applications/{$job->id}")->assertOk();
        $this->putJson("/api/interviews/{$interview->id}", ['location' => 'Office'])->assertOk();
        $this->putJson("/api/todos/{$todo->id}", ['done' => true])->assertOk();
        $this->putJson("/api/notes/{$note->id}", ['title' => 'Renamed'])->assertOk();
        $this->putJson("/api/profile/links/{$link->id}", ['type' => 'GitLab', 'url' => 'https://gitlab.com/owner'])->assertOk();

        $this->deleteJson("/api/interviews/{$interview->id}")->assertOk();
        $this->deleteJson("/api/notes/{$note->id}")->assertOk();
        $this->deleteJson("/api/profile/links/{$link->id}")->assertOk();
        $this->assertModelMissing($interview);
        $this->assertModelMissing($note);
        $this->assertModelMissing($link);
    }

    public function test_user_can_delete_own_todo(): void
    {
        $owner = User::factory()->create();
        $todo = $owner->todos()->create(['text' => 'Mine']);

        $this->actingAs($owner)
            ->deleteJson("/api/todos/{$todo->id}")
            ->assertOk();

        $this->assertModelMissing($todo);
    }
}
