<?php

namespace Tests\Feature;

use App\Enums\DocumentKind;
use App\Enums\JobStatus;
use App\Models\Interview;
use App\Models\StatusChange;
use App\Models\User;
use Database\Seeders\DocumentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_database_seeder_runs_and_creates_one_demo_user_with_data(): void
    {
        $this->seed();

        $demo = User::where('email', config('app.demo_email'))->sole();

        $this->assertNotNull($demo->profile);
        $this->assertDatabaseCount('profiles', 1);
        $this->assertGreaterThanOrEqual(20, $demo->jobApplications()->count());
    }

    public function test_demo_data_shows_every_part_of_the_app_relative_to_today(): void
    {
        Storage::fake(config('filesystems.documents_disk'));

        $this->seed();

        $demo = User::where('email', config('app.demo_email'))->sole();
        $jobs = $demo->jobApplications()->get();

        $this->assertEqualsCanonicalizing(JobStatus::cases(), $jobs->pluck('status')->unique()->values()->all(), 'every status is on the board');
        $this->assertTrue($jobs->where('status', JobStatus::Saved)->every(fn ($job) => $job->applied_date === null));
        $this->assertTrue($jobs->contains(fn ($job) => $job->applied_date?->isToday()), 'something applied today, for the goals');
        $this->assertTrue($jobs->where('is_archived', true)->every(fn ($job) => $job->archived_at !== null));
        $this->assertGreaterThan(0, StatusChange::count());
        $this->assertTrue(Interview::where('user_id', $demo->id)->where('interview_date', '>', now())->whereNotNull('meeting_url')->exists());
        $this->assertTrue(Interview::where('user_id', $demo->id)->where('interview_date', '<', now())->whereNotNull('rating')->exists());
        $this->assertTrue($demo->todos()->where('done', false)->whereDate('due_date', today())->exists(), 'a to-do due today');
        $this->assertTrue($demo->todos()->where('done', true)->whereNotNull('completed_at')->exists());
        $this->assertTrue($demo->notes()->where('is_pinned', true)->exists());
    }

    public function test_demo_user_gets_a_question_bank_linked_to_their_next_interview(): void
    {
        Storage::fake(config('filesystems.documents_disk'));

        $this->seed();

        $demo = User::where('email', config('app.demo_email'))->sole();
        $nextInterview = Interview::where('user_id', $demo->id)->where('interview_date', '>=', now())->orderBy('interview_date')->first();

        $this->assertGreaterThanOrEqual(10, $demo->bankQuestions()->count());
        $this->assertSame(5, $demo->bankQuestions()->distinct()->count('category'));
        $this->assertSame(3, $nextInterview->bankQuestions()->count());
        $this->assertNotNull($nextInterview->bankQuestions()->first()->pivot->note);
    }

    public function test_seeder_fills_the_demo_library_with_downloadable_files_links_and_attachments(): void
    {
        Storage::fake(config('filesystems.documents_disk'));

        $this->seed();

        $demo = User::where('email', config('app.demo_email'))->sole();
        $documents = $demo->documents()->get();
        $files = $documents->where('kind', DocumentKind::File);
        $this->assertNotEmpty($files);
        $this->assertNotEmpty($documents->where('kind', DocumentKind::Link));
        $this->assertLessThan(10, $documents->count(), 'demo visitors must still be able to add documents');
        foreach ($files as $file) {
            Storage::disk(config('filesystems.documents_disk'))->assertExists($file->path);
            $this->assertStringStartsWith("documents/{$demo->id}/", $file->path);
        }
        $this->assertGreaterThan(0, DB::table('document_job_application')->count());
    }

    public function test_reseeding_documents_replaces_the_demo_library_instead_of_duplicating_it(): void
    {
        Storage::fake(config('filesystems.documents_disk'));
        $this->seed();
        $demo = User::where('email', config('app.demo_email'))->sole();
        $countAfterFirstSeed = $demo->documents()->count();

        $this->seed(DocumentSeeder::class);

        $this->assertSame($countAfterFirstSeed, $demo->documents()->count());
        foreach ($demo->documents()->whereNotNull('path')->get() as $file) {
            Storage::disk(config('filesystems.documents_disk'))->assertExists($file->path);
        }
    }

    public function test_demo_user_can_log_in_with_seeded_password(): void
    {
        $this->seed();

        // Sent like the SPA does, so Sanctum starts a session
        $this->withHeader('Referer', config('app.url'))->postJson('/api/login', [
            'email' => config('app.demo_email'),
            'password' => 'secret123',
        ])->assertOk();
    }
}
