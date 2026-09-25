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
