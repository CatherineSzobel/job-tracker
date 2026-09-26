<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Tests\TestCase;

class BrokenFeaturesTest extends TestCase
{
    use RefreshDatabase;

    private const HEADINGS = ['company_name', 'position', 'status', 'priority', 'applied_date', 'location', 'notes', 'job_link'];

    private function xlsx(array $rows): UploadedFile
    {
        $spreadsheet = new Spreadsheet;
        $spreadsheet->getActiveSheet()->fromArray([self::HEADINGS, ...$rows]);

        $path = tempnam(sys_get_temp_dir(), 'import').'.xlsx';
        (new Xlsx($spreadsheet))->save($path);

        return new UploadedFile($path, 'jobs.xlsx', null, null, true);
    }

    public function test_stats_count_upcoming_interviews(): void
    {
        $user = User::factory()->create();
        $job = $user->jobApplications()->create(['company_name' => 'Acme', 'position' => 'Developer']);
        $job->interviews()->create(['user_id' => $user->id, 'interview_date' => now()->addDays(2)]);
        $job->interviews()->create(['user_id' => $user->id, 'interview_date' => now()->addWeek()]);
        $job->interviews()->create(['user_id' => $user->id, 'interview_date' => now()->subWeek()]);

        $this->actingAs($user)
            ->getJson('/api/job-applications/stats')
            ->assertOk()
            ->assertJsonPath('data.upcomingInterviews', 2);
    }

    public function test_import_reports_invalid_rows_and_keeps_valid_ones(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/job-applications/import', ['file' => $this->xlsx([
                ['Acme', 'Developer', 'applied', 'high', '2026-09-01', 'Brussels', 'Note', 'https://acme.test/job'],
                ['Globex', 'Designer', 'bogus-status', 'low', '2026-09-02', 'Ghent', null, null],
                ['Initech', 'Tester', 'offer', 'medium', '2026-09-03', null, null, null],
            ])])
            ->assertOk()
            ->assertJsonCount(1, 'failures')
            ->assertJsonPath('failures.0.row', 3)
            ->assertJsonPath('failures.0.attribute', 'status');

        $this->assertSame(['Acme', 'Initech'], $user->jobApplications()->orderBy('company_name')->pluck('company_name')->all());
    }

    public function test_reimporting_updates_existing_jobs_instead_of_duplicating(): void
    {
        $user = User::factory()->create();
        $rows = [['Acme', 'Developer', 'applied', 'high', '2026-09-01', 'Brussels', null, null]];

        $this->actingAs($user)->postJson('/api/job-applications/import', ['file' => $this->xlsx($rows)])->assertOk();

        $rows[0][2] = 'interview';
        $this->actingAs($user)->postJson('/api/job-applications/import', ['file' => $this->xlsx($rows)])->assertOk();

        $this->assertSame(1, $user->jobApplications()->count());
        $this->assertSame('interview', $user->jobApplications()->first()->status);
    }

    public function test_import_does_not_touch_other_users_jobs(): void
    {
        $other = User::factory()->create();
        $theirs = $other->jobApplications()->create(['company_name' => 'Acme', 'position' => 'Developer', 'status' => 'offer']);

        $this->actingAs(User::factory()->create())
            ->postJson('/api/job-applications/import', ['file' => $this->xlsx([
                ['Acme', 'Developer', 'rejected', 'low', '2026-09-01', null, null, null],
            ])])
            ->assertOk();

        $this->assertSame('offer', $theirs->fresh()->status);
    }

    public function test_register_requires_matching_password_confirmation(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Jane',
            'email' => 'jane@example.com',
            'password' => 'password123',
            'password_confirmation' => 'different123',
        ])->assertJsonValidationErrors('password');

        $this->assertDatabaseMissing('users', ['email' => 'jane@example.com']);
    }
}
