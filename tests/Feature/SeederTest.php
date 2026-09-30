<?php

namespace Tests\Feature;

use App\Enums\DocumentKind;
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
