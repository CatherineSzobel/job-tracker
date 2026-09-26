<?php

namespace Tests\Feature;

use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Inputs that used to reach the database unvalidated and cause a 500.
 */
class ServerErrorRegressionTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private JobApplication $job;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->user->profile()->create(['name' => $this->user->name]);
        $this->job = $this->user->jobApplications()->create([
            'company_name' => 'Acme',
            'position' => 'Developer',
            'location' => 'Brussels',
        ]);
    }

    public function test_note_content_can_be_cleared(): void
    {
        $note = $this->user->notes()->create(['title' => 'Title', 'content' => 'Some text']);

        $this->actingAs($this->user)
            ->putJson("/api/notes/{$note->id}", ['title' => 'Title', 'content' => ''])
            ->assertOk();

        $this->assertSame('', $note->fresh()->content);
    }

    public function test_note_update_without_content_keeps_existing_content(): void
    {
        $note = $this->user->notes()->create(['title' => 'Title', 'content' => 'Keep me']);

        $this->actingAs($this->user)
            ->putJson("/api/notes/{$note->id}", ['title' => 'Renamed'])
            ->assertOk();

        $this->assertSame('Keep me', $note->fresh()->content);
    }

    public function test_interview_update_rejects_unknown_type(): void
    {
        $interview = $this->job->interviews()->create([
            'user_id' => $this->user->id,
            'interview_date' => now()->addDay(),
        ]);

        $this->actingAs($this->user)
            ->putJson("/api/interviews/{$interview->id}", ['type' => 'carrier-pigeon'])
            ->assertJsonValidationErrors('type');
    }

    public function test_interview_location_can_be_cleared(): void
    {
        $interview = $this->job->interviews()->create([
            'user_id' => $this->user->id,
            'interview_date' => now()->addDay(),
            'location' => 'Office',
        ]);

        $this->actingAs($this->user)
            ->putJson("/api/interviews/{$interview->id}", ['location' => null])
            ->assertOk();

        $this->assertNull($interview->fresh()->location);
    }

    public function test_profile_fields_are_length_limited(): void
    {
        $this->actingAs($this->user)
            ->putJson('/api/profile', [
                'name' => str_repeat('a', 256),
                'title' => str_repeat('a', 256),
                'location' => str_repeat('a', 256),
                'bio' => str_repeat('a', 5001),
            ])
            ->assertJsonValidationErrors(['name', 'title', 'location', 'bio']);
    }

    public function test_job_location_can_be_cleared(): void
    {
        $this->actingAs($this->user)
            ->putJson("/api/job-applications/{$this->job->id}", ['location' => null])
            ->assertOk();

        $this->assertNull($this->job->fresh()->location);
    }

    public function test_job_priority_must_be_known_value(): void
    {
        $this->actingAs($this->user)
            ->putJson("/api/job-applications/{$this->job->id}", ['priority' => 'urgent'])
            ->assertJsonValidationErrors('priority');
    }
}
