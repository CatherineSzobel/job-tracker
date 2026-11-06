<?php

namespace Tests\Feature;

use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ArchiveDateTest extends TestCase
{
    use RefreshDatabase;

    private function migration(): Migration
    {
        return require collect(glob(database_path('migrations/*_add_archived_at_to_job_applications_table.php')))->sole();
    }

    public function test_archiving_records_the_date_editing_keeps_it_and_restoring_clears_it(): void
    {
        $user = User::factory()->create();
        $job = JobApplication::factory()->for($user)->create();
        $this->travelTo('2026-10-02 09:30:00');

        $this->actingAs($user)->putJson("/api/job-applications/{$job->id}", ['is_archived' => true])
            ->assertOk()
            ->assertJsonPath('data.archived_at', '2026-10-02T09:30:00.000000Z');

        $this->travel(3)->days();
        $this->putJson("/api/job-applications/{$job->id}", ['notes' => 'Went with another candidate', 'is_archived' => true])->assertOk();
        $this->assertSame('2026-10-02 09:30:00', $job->fresh()->archived_at->toDateTimeString());

        $this->putJson("/api/job-applications/{$job->id}", ['is_archived' => false])
            ->assertOk()
            ->assertJsonPath('data.archived_at', null);
    }

    public function test_batch_archive_dates_only_newly_archived_applications_and_batch_restore_clears_them(): void
    {
        $user = User::factory()->create();
        $active = JobApplication::factory()->for($user)->create();
        $alreadyArchived = JobApplication::factory()->for($user)->archived()->create();
        $alreadyArchived->forceFill(['archived_at' => '2026-09-01 08:00:00'])->save();
        $this->travelTo('2026-10-02 09:30:00');
        $ids = [$active->id, $alreadyArchived->id];

        $this->actingAs($user)->patchJson('/api/job-applications/batch', ['ids' => $ids, 'is_archived' => true])->assertOk();

        $this->assertSame('2026-10-02 09:30:00', $active->fresh()->archived_at->toDateTimeString());
        $this->assertSame('2026-09-01 08:00:00', $alreadyArchived->fresh()->archived_at->toDateTimeString());

        $this->patchJson('/api/job-applications/batch', ['ids' => $ids, 'is_archived' => false])->assertOk();

        $this->assertNull($active->fresh()->archived_at);
        $this->assertNull($alreadyArchived->fresh()->archived_at);
    }

    public function test_the_migration_dates_archived_applications_by_their_last_update(): void
    {
        $migration = $this->migration();
        $migration->down();
        $user = User::factory()->create();
        // Without the model's events: before the migration there's no archived_at column for it to fill in
        [$archived, $active] = JobApplication::withoutEvents(fn () => [JobApplication::factory()->for($user)->archived()->create(), JobApplication::factory()->for($user)->create()]);
        DB::table('job_applications')->update(['updated_at' => '2026-08-15 14:00:00']);

        $migration->up();

        $this->assertSame('2026-08-15 14:00:00', $archived->fresh()->archived_at->toDateTimeString());
        $this->assertNull($active->fresh()->archived_at);
    }
}
