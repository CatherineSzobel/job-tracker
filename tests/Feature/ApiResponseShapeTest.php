<?php

namespace Tests\Feature;

use App\Models\Document;
use App\Models\Interview;
use App\Models\JobApplication;
use App\Models\Note;
use App\Models\Todo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Every endpoint answers { "data": ... } (deletes: 204), exposing only the listed fields.
 */
class ApiResponseShapeTest extends TestCase
{
    use RefreshDatabase;

    private const JOB = ['id', 'company_name', 'position', 'location', 'status', 'priority', 'applied_date', 'job_link', 'notes', 'is_archived'];

    private const INTERVIEW = ['id', 'job_application_id', 'interview_date', 'type', 'location', 'notes'];

    private const TODO = ['id', 'text', 'done', 'created_at'];

    private const NOTE = ['id', 'title', 'content', 'is_pinned', 'created_at'];

    private const DOCUMENT = ['id', 'kind', 'category', 'name', 'url', 'original_filename', 'mime_type', 'size', 'archived_at', 'created_at'];

    private User $user;

    private JobApplication $job;

    private Interview $interview;

    private Todo $todo;

    private Note $note;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->job = $this->user->jobApplications()->create([
            'company_name' => 'Acme', 'position' => 'Developer', 'applied_date' => '2026-09-01',
        ]);
        $this->interview = $this->job->interviews()->create(['user_id' => $this->user->id, 'interview_date' => now()->addDay()]);
        $this->todo = $this->user->todos()->create(['text' => 'Follow up']);
        $this->note = $this->user->notes()->create(['title' => 'Idea', 'content' => '']);
        $this->user->profile()->create(['name' => 'Jane']);

        $this->actingAs($this->user);
    }

    private function assertHidden($response, string $prefix): void
    {
        foreach (['user_id', 'profile_id', 'updated_at', 'success', 'password', 'path'] as $field) {
            $response->assertJsonMissingPath("{$prefix}.{$field}");
        }
    }

    public function test_current_user(): void
    {
        $response = $this->getJson('/api/user')
            ->assertOk()
            ->assertExactJsonStructure(['data' => ['id', 'name', 'email', 'daily_goal', 'weekly_goal']]);

        $this->assertHidden($response, 'data');
    }

    public function test_job_applications(): void
    {
        $list = $this->getJson('/api/job-applications')
            ->assertOk()
            ->assertJsonStructure(['data' => [[...self::JOB, 'interviews' => [self::INTERVIEW]]]])
            ->assertJsonPath('data.0.applied_date', '2026-09-01')
            ->assertJsonPath('data.0.is_archived', false)
            ->assertJsonMissingPath('data.0.documents');
        $this->assertHidden($list, 'data.0');

        $this->postJson('/api/job-applications', ['company_name' => 'Globex', 'position' => 'Designer'])
            ->assertCreated()
            ->assertJsonStructure(['data' => self::JOB])
            ->assertJsonMissingPath('success');

        $this->getJson("/api/job-applications/{$this->job->id}")
            ->assertOk()
            ->assertJsonStructure(['data' => [...self::JOB, 'interviews' => [self::INTERVIEW], 'documents' => []]])
            ->assertJsonMissingPath('success');

        $this->putJson("/api/job-applications/{$this->job->id}", ['status' => 'offer'])
            ->assertOk()
            ->assertJsonPath('data.status', 'offer');

        $this->postJson("/api/job-applications/{$this->job->id}/interviews", ['interview_date' => now()->addWeek()->toDateTimeString()])
            ->assertCreated()
            ->assertJsonStructure(['data' => self::INTERVIEW])
            ->assertJsonMissingPath('success');

        $this->deleteJson("/api/job-applications/{$this->job->id}")->assertNoContent();
    }

    public function test_interviews(): void
    {
        $job = ['id', 'company_name', 'position'];

        $this->getJson('/api/interviews')
            ->assertOk()
            ->assertExactJsonStructure(['data' => [[...self::INTERVIEW, 'job' => $job]]]);

        $this->putJson("/api/interviews/{$this->interview->id}", ['location' => 'Office'])
            ->assertOk()
            ->assertExactJsonStructure(['data' => [...self::INTERVIEW, 'job' => $job]])
            ->assertJsonPath('data.location', 'Office');

        $this->deleteJson("/api/interviews/{$this->interview->id}")->assertNoContent();
    }

    public function test_todos(): void
    {
        $this->getJson('/api/todos')->assertOk()->assertExactJsonStructure(['data' => [self::TODO]]);
        $this->postJson('/api/todos', ['text' => 'Apply'])->assertCreated()->assertExactJsonStructure(['data' => self::TODO]);
        $this->putJson("/api/todos/{$this->todo->id}", ['done' => true])
            ->assertOk()
            ->assertExactJsonStructure(['data' => self::TODO])
            ->assertJsonPath('data.done', true);
        $this->deleteJson("/api/todos/{$this->todo->id}")->assertNoContent();
    }

    public function test_notes(): void
    {
        $this->getJson('/api/notes')->assertOk()->assertExactJsonStructure(['data' => [self::NOTE]]);
        $this->postJson('/api/notes', ['title' => 'Another'])->assertCreated()->assertExactJsonStructure(['data' => self::NOTE]);
        $this->putJson("/api/notes/{$this->note->id}", ['title' => 'Idea', 'is_pinned' => true])
            ->assertOk()
            ->assertExactJsonStructure(['data' => self::NOTE])
            ->assertJsonPath('data.is_pinned', true);
        $this->deleteJson("/api/notes/{$this->note->id}")->assertNoContent();
    }

    public function test_documents(): void
    {
        $document = Document::factory()->for($this->user)->create();
        $this->job->documents()->attach($document, ['attached_at' => now()]);
        $listed = [...self::DOCUMENT, 'applications_count'];

        $list = $this->getJson('/api/documents')->assertOk()->assertExactJsonStructure(['data' => [$listed]]);
        $this->assertHidden($list, 'data.0');
        $this->postJson('/api/documents', ['kind' => 'link', 'name' => 'Site', 'category' => 'website', 'url' => 'https://jane.dev'])
            ->assertCreated()
            ->assertExactJsonStructure(['data' => $listed]);
        $this->patchJson("/api/documents/{$document->id}", ['name' => 'Renamed'])
            ->assertOk()
            ->assertExactJsonStructure(['data' => $listed]);
        $this->putJson("/api/job-applications/{$this->job->id}/documents", ['document_ids' => [$document->id]])
            ->assertOk()
            ->assertExactJsonStructure(['data' => [[...self::DOCUMENT, 'attached_at']]]);
        $this->deleteJson("/api/documents/{$document->id}")
            ->assertOk()
            ->assertExactJsonStructure(['data' => $listed]);
        $this->postJson("/api/documents/{$document->id}/restore")
            ->assertOk()
            ->assertExactJsonStructure(['data' => $listed]);
    }

    public function test_profile(): void
    {
        $profile = ['id', 'name', 'title', 'bio', 'location'];

        $this->getJson('/api/profile')->assertOk()->assertExactJsonStructure(['data' => $profile]);
        $this->putJson('/api/profile', ['title' => 'Engineer'])->assertOk()->assertExactJsonStructure(['data' => $profile]);
    }

    public function test_profile_link_endpoints_are_gone(): void
    {
        $this->getJson('/api/profile/links')->assertNotFound();
    }
}
