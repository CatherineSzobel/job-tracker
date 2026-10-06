<?php

namespace Tests\Feature;

use App\Enums\DocumentCategory;
use App\Enums\DocumentKind;
use App\Models\Document;
use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DocumentsTest extends TestCase
{
    use RefreshDatabase;

    private function fakeDocumentsDisk(): Filesystem
    {
        Storage::fake(config('filesystems.documents_disk'));

        return Storage::disk(config('filesystems.documents_disk'));
    }

    private function jobFor(User $user): JobApplication
    {
        return $user->jobApplications()->create(['company_name' => 'Acme', 'position' => 'Developer']);
    }

    /**
     * A file document whose file really exists on the (fake) documents disk.
     */
    private function storedFileFor(User $user, array $attributes = []): Document
    {
        $document = Document::factory()->for($user)->file()->create($attributes);
        Storage::disk(config('filesystems.documents_disk'))->put($document->path, 'file contents');

        return $document;
    }

    public function test_upload_stores_the_file_under_the_users_folder_and_returns_201_without_path(): void
    {
        $disk = $this->fakeDocumentsDisk();
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/documents', [
            'kind' => 'file',
            'name' => 'CV – backend v3',
            'category' => 'cv',
            'file' => UploadedFile::fake()->create('cv-v3.pdf', 120, 'application/pdf'),
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.kind', 'file')
            ->assertJsonPath('data.name', 'CV – backend v3')
            ->assertJsonPath('data.original_filename', 'cv-v3.pdf')
            ->assertJsonPath('data.mime_type', 'application/pdf')
            ->assertJsonPath('data.size', 120 * 1024)
            ->assertJsonPath('data.url', null)
            ->assertJsonMissingPath('data.path');
        $document = $user->documents()->sole();
        $this->assertStringStartsWith("documents/{$user->id}/", $document->path);
        $this->assertStringEndsWith('.pdf', $document->path);
        $disk->assertExists($document->path);
    }

    public function test_link_is_created_with_201_and_no_file_fields(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/api/documents', [
            'kind' => 'link',
            'name' => 'GitHub',
            'category' => 'github',
            'url' => 'https://github.com/jane',
        ])
            ->assertCreated()
            ->assertJsonPath('data.kind', 'link')
            ->assertJsonPath('data.url', 'https://github.com/jane')
            ->assertJsonPath('data.original_filename', null);

        $document = $user->documents()->sole();
        $this->assertSame(DocumentCategory::GitHub, $document->category);
        $this->assertNull($document->path);
    }

    public function test_upload_rejects_a_disallowed_file_type(): void
    {
        $disk = $this->fakeDocumentsDisk();
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/api/documents', [
            'kind' => 'file',
            'name' => 'Page',
            'category' => 'other',
            'file' => UploadedFile::fake()->create('page.html', 5, 'text/html'),
        ])->assertJsonValidationErrors(['file' => 'must be a file of type']);

        $this->assertSame(0, $user->documents()->count());
        $disk->assertDirectoryEmpty('/');
    }

    public function test_upload_rejects_files_over_10_mb(): void
    {
        $this->fakeDocumentsDisk();
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/api/documents', [
            'kind' => 'file',
            'name' => 'Huge',
            'category' => 'cv',
            'file' => UploadedFile::fake()->create('huge.pdf', 10241, 'application/pdf'),
        ])->assertJsonValidationErrors(['file' => 'must not be greater than 10240 kilobytes']);

        $this->assertSame(0, $user->documents()->count());
    }

    public function test_upload_rejects_an_executable_renamed_to_pdf(): void
    {
        $this->fakeDocumentsDisk();
        $user = User::factory()->create();
        // A real (non-fake) upload, so the MIME type is detected from the content, not the name
        $path = tempnam(sys_get_temp_dir(), 'exe');
        file_put_contents($path, "MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xFF\xFF\x00\x00".str_repeat("\x00", 44)."\x40\x00\x00\x00PE\x00\x00");
        $renamed = new UploadedFile($path, 'cv.pdf', 'application/pdf', null, true);

        $this->actingAs($user)->postJson('/api/documents', [
            'kind' => 'file',
            'name' => 'Totally a CV',
            'category' => 'cv',
            'file' => $renamed,
        ])->assertJsonValidationErrors('file');

        $this->assertSame(0, $user->documents()->count());
    }

    public function test_listing_returns_newest_first_with_application_counts_and_hides_archived(): void
    {
        $user = User::factory()->create();
        $older = Document::factory()->for($user)->create(['name' => 'Older', 'created_at' => now()->subDay()]);
        $newer = Document::factory()->for($user)->create(['name' => 'Newer']);
        Document::factory()->for($user)->archived()->create(['name' => 'Archived']);
        Document::factory()->create(['name' => 'Someone else’s']);
        $this->jobFor($user)->documents()->attach($older, ['attached_at' => now()]);

        $response = $this->actingAs($user)->getJson('/api/documents');

        $response->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.id', $newer->id)
            ->assertJsonPath('data.0.applications_count', 0)
            ->assertJsonPath('data.1.id', $older->id)
            ->assertJsonPath('data.1.applications_count', 1);
    }

    public function test_listing_includes_archived_documents_when_asked(): void
    {
        $user = User::factory()->create();
        Document::factory()->for($user)->create();
        $archived = Document::factory()->for($user)->archived()->create();

        $this->actingAs($user)->getJson('/api/documents?include_archived=1')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonFragment(['id' => $archived->id]);
    }

    public function test_listing_filters_by_category(): void
    {
        $user = User::factory()->create();
        $cv = Document::factory()->for($user)->file()->create();
        Document::factory()->for($user)->create(['category' => DocumentCategory::GitHub]);

        $this->actingAs($user)->getJson('/api/documents?category=cv')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $cv->id);
    }

    public function test_demo_user_gets_422_on_an_eleventh_document_counting_archived_ones(): void
    {
        $demo = User::factory()->create(['email' => config('app.demo_email')]);
        Document::factory()->for($demo)->count(9)->create();
        Document::factory()->for($demo)->archived()->create();

        $this->actingAs($demo)->postJson('/api/documents', [
            'kind' => 'link', 'name' => 'One too many', 'category' => 'website', 'url' => 'https://example.com',
        ])->assertJsonValidationErrors(['document' => 'The demo account can keep up to 10 documents.']);

        $this->assertSame(10, $demo->documents()->count());
    }

    public function test_regular_users_are_not_limited_to_10_documents(): void
    {
        $user = User::factory()->create();
        Document::factory()->for($user)->count(10)->create();

        $this->actingAs($user)->postJson('/api/documents', [
            'kind' => 'link', 'name' => 'Eleventh', 'category' => 'website', 'url' => 'https://example.com',
        ])->assertCreated();
    }

    public function test_update_changes_name_and_category_but_ignores_file_fields(): void
    {
        $user = User::factory()->create();
        $document = Document::factory()->for($user)->create(['url' => 'https://jane.dev']);

        $this->actingAs($user)->patchJson("/api/documents/{$document->id}", [
            'name' => 'Portfolio 2026',
            'category' => 'portfolio',
            'url' => 'https://evil.test',
            'path' => 'documents/1/other.pdf',
            'kind' => 'file',
        ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Portfolio 2026')
            ->assertJsonPath('data.category', 'portfolio');

        $document->refresh();
        $this->assertSame('https://jane.dev', $document->url);
        $this->assertNull($document->path);
        $this->assertSame(DocumentKind::Link, $document->kind);
    }

    public function test_download_returns_the_file_under_its_original_filename(): void
    {
        $this->fakeDocumentsDisk();
        $user = User::factory()->create();
        $document = $this->storedFileFor($user, ['original_filename' => 'Jane Doe CV.pdf']);

        $response = $this->actingAs($user)->get("/api/documents/{$document->id}/download");

        $response->assertOk()->assertDownload('Jane Doe CV.pdf');
        $this->assertSame('file contents', $response->streamedContent());
    }

    public function test_download_keeps_a_non_ascii_filename(): void
    {
        $this->fakeDocumentsDisk();
        $user = User::factory()->create();
        $document = $this->storedFileFor($user, ['original_filename' => 'Lebenslauf – Zoë.pdf']);

        $response = $this->actingAs($user)->get("/api/documents/{$document->id}/download");

        $response->assertOk();
        $this->assertStringContainsString(
            "filename*=utf-8''".rawurlencode('Lebenslauf – Zoë.pdf'),
            $response->headers->get('content-disposition'),
        );
    }

    public function test_download_of_a_link_returns_404(): void
    {
        $user = User::factory()->create();
        $link = Document::factory()->for($user)->create();

        $this->actingAs($user)->getJson("/api/documents/{$link->id}/download")->assertNotFound();
    }

    public function test_download_returns_404_when_the_file_is_missing_from_disk(): void
    {
        $this->fakeDocumentsDisk();
        $user = User::factory()->create();
        $document = Document::factory()->for($user)->file()->create();

        $this->actingAs($user)->getJson("/api/documents/{$document->id}/download")->assertNotFound();
    }

    public function test_deleting_an_unattached_document_removes_the_row_and_file_and_returns_204(): void
    {
        $disk = $this->fakeDocumentsDisk();
        $user = User::factory()->create();
        $document = $this->storedFileFor($user);

        $this->actingAs($user)->deleteJson("/api/documents/{$document->id}")->assertNoContent();

        $this->assertModelMissing($document);
        $disk->assertMissing($document->path);
    }

    public function test_deleting_an_attached_document_archives_it_keeps_the_file_and_returns_200(): void
    {
        $disk = $this->fakeDocumentsDisk();
        $this->freezeSecond(); // timestamps are stored without microseconds
        $user = User::factory()->create();
        $document = $this->storedFileFor($user);
        $this->jobFor($user)->documents()->attach($document, ['attached_at' => now()]);

        $this->actingAs($user)->deleteJson("/api/documents/{$document->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $document->id)
            ->assertJsonPath('data.applications_count', 1)
            ->assertJsonPath('data.archived_at', now()->toJSON());

        $this->assertTrue($document->fresh()->archived_at->equalTo(now()));
        $disk->assertExists($document->path);
    }

    public function test_restore_clears_archived_at(): void
    {
        $user = User::factory()->create();
        $document = Document::factory()->for($user)->archived()->create();

        $this->actingAs($user)->postJson("/api/documents/{$document->id}/restore")
            ->assertOk()
            ->assertJsonPath('data.archived_at', null);

        $this->assertNull($document->fresh()->archived_at);
    }

    public function test_archived_document_whose_application_was_deleted_can_then_be_deleted_for_real(): void
    {
        $disk = $this->fakeDocumentsDisk();
        $user = User::factory()->create();
        $document = $this->storedFileFor($user, ['archived_at' => now()]);
        $job = $this->jobFor($user);
        $job->documents()->attach($document, ['attached_at' => now()]);
        $this->actingAs($user)->deleteJson("/api/job-applications/{$job->id}")->assertNoContent();

        $this->deleteJson("/api/documents/{$document->id}")->assertNoContent();

        $this->assertModelMissing($document);
        $disk->assertMissing($document->path);
    }

    public function test_sync_attaches_and_detaches_and_returns_the_attached_set(): void
    {
        $this->travelTo('2026-09-29 12:00:00');
        $user = User::factory()->create();
        $job = $this->jobFor($user);
        [$kept, $removed, $added] = Document::factory()->for($user)->count(3)->create();
        $job->documents()->attach([$kept->id, $removed->id], ['attached_at' => '2026-09-28 09:00:00']);

        $response = $this->actingAs($user)->putJson("/api/job-applications/{$job->id}/documents", [
            'document_ids' => [$kept->id, $added->id],
        ]);

        $response->assertOk()->assertJsonCount(2, 'data');
        $this->assertEqualsCanonicalizing([$kept->id, $added->id], $job->documents()->pluck('documents.id')->all());
        $this->assertSame('2026-09-29 12:00:00', $job->documents()->find($added->id)->pivot->attached_at);
    }

    public function test_sync_with_an_empty_list_detaches_everything(): void
    {
        $user = User::factory()->create();
        $job = $this->jobFor($user);
        $job->documents()->attach(Document::factory()->for($user)->create(), ['attached_at' => now()]);

        $this->actingAs($user)->putJson("/api/job-applications/{$job->id}/documents", ['document_ids' => []])
            ->assertOk()
            ->assertJsonCount(0, 'data');

        $this->assertSame(0, $job->documents()->count());
    }

    public function test_resync_keeps_the_original_attached_at(): void
    {
        $user = User::factory()->create();
        $job = $this->jobFor($user);
        $document = Document::factory()->for($user)->create();
        $job->documents()->attach($document, ['attached_at' => '2026-09-01 09:00:00']);
        $this->travelTo('2026-09-29 12:00:00');

        $this->actingAs($user)->putJson("/api/job-applications/{$job->id}/documents", ['document_ids' => [$document->id]])
            ->assertOk()
            ->assertJsonPath('data.0.attached_at', Carbon::parse('2026-09-01 09:00:00')->toJSON()); // app timezone → UTC JSON, like created_at

        $this->assertSame('2026-09-01 09:00:00', $job->documents()->sole()->pivot->attached_at);
    }

    public function test_sync_rejects_a_newly_added_archived_document_with_422(): void
    {
        $user = User::factory()->create();
        $job = $this->jobFor($user);
        $archived = Document::factory()->for($user)->archived()->create();

        $this->actingAs($user)->putJson("/api/job-applications/{$job->id}/documents", ['document_ids' => [$archived->id]])
            ->assertJsonValidationErrors(['document_ids' => 'Archived documents can’t be attached. Restore them first.']);

        $this->assertSame(0, $job->documents()->count());
    }

    public function test_sync_keeps_an_already_attached_archived_document(): void
    {
        $user = User::factory()->create();
        $job = $this->jobFor($user);
        $archived = Document::factory()->for($user)->archived()->create();
        $job->documents()->attach($archived, ['attached_at' => now()]);
        $other = Document::factory()->for($user)->create();

        $this->actingAs($user)->putJson("/api/job-applications/{$job->id}/documents", ['document_ids' => [$archived->id, $other->id]])
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_account_deletion_removes_the_users_files_but_not_other_users(): void
    {
        $disk = $this->fakeDocumentsDisk();
        $user = User::factory()->create();
        $other = User::factory()->create();
        $disk->put("documents/{$user->id}/cv.pdf", 'mine');
        $disk->put("documents/{$other->id}/cv.pdf", 'theirs');

        // Sent like the SPA does, so Sanctum starts a session (deleteAccount invalidates it)
        $this->actingAs($user)
            ->withHeader('Referer', config('app.url'))
            ->deleteJson('/api/account', ['password' => 'password'])
            ->assertOk();

        $disk->assertMissing("documents/{$user->id}/cv.pdf");
        $disk->assertExists("documents/{$other->id}/cv.pdf");
    }

    public function test_application_show_and_update_include_documents(): void
    {
        $user = User::factory()->create();
        $job = $this->jobFor($user);
        $document = Document::factory()->for($user)->create();
        $job->documents()->attach($document, ['attached_at' => now()]);

        $this->actingAs($user)->getJson("/api/job-applications/{$job->id}")
            ->assertOk()
            ->assertJsonPath('data.documents.0.id', $document->id);
        $this->putJson("/api/job-applications/{$job->id}", ['status' => 'offer'])
            ->assertOk()
            ->assertJsonPath('data.documents.0.id', $document->id);
    }
}
