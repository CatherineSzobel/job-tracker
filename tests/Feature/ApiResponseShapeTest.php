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

    private const INTERVIEW = ['id', 'job_application_id', 'interview_date', 'type', 'location', 'notes', 'prep_progress' => ['done', 'total']];

    private const INTERVIEW_DETAIL = [
        ...self::INTERVIEW,
        'prep' => ['checklist', 'people', 'questions_to_ask', 'questions_asked'],
        'rating', 'debrief_notes',
    ];

    private const TODO = ['id', 'text', 'done', 'due_date', 'job_application', 'created_at'];

    private const NOTE = ['id', 'title', 'content', 'is_pinned', 'created_at'];

    private const DOCUMENT = ['id', 'kind', 'category', 'name', 'url', 'original_filename', 'mime_type', 'size', 'archived_at', 'created_at'];

    private const TAG = ['id', 'name', 'color'];

    private const BANK_QUESTION = ['id', 'question', 'answer', 'category'];

    private const SETTINGS = ['archive_todos', 'reminders_in_app', 'reminders_email', 'reminder_days', 'reminder_dismiss_mode'];

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
            ->assertExactJsonStructure(['data' => ['id', 'name', 'email', 'daily_goal', 'weekly_goal', 'is_demo']]);

        $this->assertHidden($response, 'data');
    }

    public function test_job_applications(): void
    {
        $this->job->tags()->attach($this->user->tags()->create(['name' => 'remote', 'color' => 'blue']));

        $list = $this->getJson('/api/job-applications')
            ->assertOk()
            ->assertJsonStructure(['data' => [[...self::JOB, 'interviews' => [self::INTERVIEW], 'open_todos_count', 'tags' => [self::TAG]]]])
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
            ->assertJsonStructure(['data' => [...self::JOB, 'interviews' => [self::INTERVIEW], 'open_todos_count', 'tags' => [self::TAG], 'documents' => []]])
            ->assertJsonMissingPath('success');

        $this->putJson("/api/job-applications/{$this->job->id}", ['status' => 'offer'])
            ->assertOk()
            ->assertJsonPath('data.status', 'offer');

        $this->putJson("/api/job-applications/{$this->job->id}/tags", ['tag_ids' => []])
            ->assertOk()
            ->assertJsonStructure(['data' => [...self::JOB, 'tags']]);

        $this->postJson("/api/job-applications/{$this->job->id}/interviews", ['interview_date' => now()->addWeek()->toDateTimeString()])
            ->assertCreated()
            ->assertJsonStructure(['data' => self::INTERVIEW])
            ->assertJsonMissingPath('success');

        $this->deleteJson("/api/job-applications/{$this->job->id}")->assertNoContent();
    }

    public function test_batch_update(): void
    {
        $this->patchJson('/api/job-applications/batch', ['ids' => [$this->job->id], 'status' => 'offer'])
            ->assertOk()
            ->assertJsonStructure(['data' => [[...self::JOB, 'interviews' => [self::INTERVIEW], 'open_todos_count', 'tags']]]);
    }

    public function test_reminders(): void
    {
        $this->getJson('/api/reminders')->assertOk()->assertExactJsonStructure(['data' => ['applications', 'todos']]);

        $this->user->update(['reminders_in_app' => true]);
        $this->travel(8)->days();
        $this->user->todos()->create(['text' => 'Call', 'due_date' => today()->toDateString()]);

        $this->getJson('/api/reminders')
            ->assertOk()
            ->assertExactJsonStructure(['data' => ['applications' => [[...self::JOB, 'days_since_update']], 'todos' => [self::TODO]]]);
        $this->postJson("/api/job-applications/{$this->job->id}/dismiss-reminder")->assertNoContent();
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

        $this->getJson("/api/interviews/{$this->interview->id}")
            ->assertOk()
            ->assertExactJsonStructure(['data' => [...self::INTERVIEW_DETAIL, 'job' => $job, 'bank_questions']]);

        $this->putJson("/api/interviews/{$this->interview->id}/prep", [
            'checklist' => [], 'people' => [], 'questions_to_ask' => [], 'questions_asked' => [], 'rating' => 3, 'debrief_notes' => null,
        ])
            ->assertOk()
            ->assertExactJsonStructure(['data' => [...self::INTERVIEW_DETAIL, 'job' => $job]]);

        $this->deleteJson("/api/interviews/{$this->interview->id}")->assertNoContent();
    }

    public function test_bank_questions(): void
    {
        $response = $this->postJson('/api/bank-questions', ['question' => 'Why us?', 'category' => 'motivation'])
            ->assertCreated()
            ->assertExactJsonStructure(['data' => self::BANK_QUESTION]);
        $this->assertHidden($response, 'data');
        $questionId = $response->json('data.id');

        $this->getJson('/api/bank-questions')->assertOk()->assertExactJsonStructure(['data' => [[...self::BANK_QUESTION, 'interviews_count']]]);
        $this->patchJson("/api/bank-questions/{$questionId}", ['answer' => 'Your mission'])
            ->assertOk()
            ->assertExactJsonStructure(['data' => self::BANK_QUESTION]);
        $this->putJson("/api/interviews/{$this->interview->id}/bank-questions", ['questions' => [['id' => $questionId, 'note' => 'Short']]])
            ->assertOk()
            ->assertExactJsonStructure(['data' => [
                ...self::INTERVIEW_DETAIL,
                'job' => ['id', 'company_name', 'position'],
                'bank_questions' => [[...self::BANK_QUESTION, 'note']],
            ]]);
        $this->deleteJson("/api/bank-questions/{$questionId}")->assertNoContent();
    }

    public function test_interview_prep_template(): void
    {
        $structure = ['data' => ['items' => ['*' => ['text', 'type']], 'is_default']];

        $this->getJson('/api/interview-prep-template')->assertOk()->assertExactJsonStructure($structure);
        $this->putJson('/api/interview-prep-template', ['items' => [['text' => 'Print CV', 'type' => null]]])
            ->assertOk()
            ->assertExactJsonStructure($structure);
        $this->deleteJson('/api/interview-prep-template')->assertOk()->assertExactJsonStructure($structure);
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

    public function test_settings(): void
    {
        $response = $this->getJson('/api/settings')->assertOk()->assertExactJsonStructure(['data' => self::SETTINGS]);
        $this->assertHidden($response, 'data');
        $this->putJson('/api/settings', ['archive_todos' => 'keep'])->assertOk()->assertExactJsonStructure(['data' => self::SETTINGS]);
    }

    public function test_tags(): void
    {
        $response = $this->postJson('/api/tags', ['name' => 'remote'])->assertCreated()->assertExactJsonStructure(['data' => self::TAG]);
        $this->assertHidden($response, 'data');
        $tagId = $response->json('data.id');

        $this->getJson('/api/tags')->assertOk()->assertExactJsonStructure(['data' => [[...self::TAG, 'applications_count']]]);
        $this->patchJson("/api/tags/{$tagId}", ['color' => 'pink'])->assertOk()->assertExactJsonStructure(['data' => self::TAG]);
        $this->deleteJson("/api/tags/{$tagId}")->assertNoContent();
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
