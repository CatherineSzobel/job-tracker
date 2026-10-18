<?php

namespace Tests\Feature;

use App\Enums\ApplicationSource;
use App\Enums\Currency;
use App\Enums\JobStatus;
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

    private const DETAIL_HEADINGS = ['salary_min', 'salary_max', 'salary_currency', 'source', 'contact_name', 'contact_details', 'deadline'];

    /**
     * @param  list<string>  $headings
     */
    private function xlsx(array $rows, array $headings = self::HEADINGS): UploadedFile
    {
        $spreadsheet = new Spreadsheet;
        $spreadsheet->getActiveSheet()->fromArray([$headings, ...$rows]);

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

    public function test_import_reads_status_labels_and_leaves_saved_rows_without_an_applied_date(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/job-applications/import', ['file' => $this->xlsx([
                ['Acme', 'Developer', 'No response', 'high', '2026-09-01', null, null, null],
                ['Globex', 'Designer', 'Saved', 'low', null, null, null, null],
            ])])
            ->assertOk();

        $jobs = $user->jobApplications()->orderBy('company_name')->get();
        $this->assertSame(JobStatus::NoResponse, $jobs[0]->status);
        $this->assertSame(JobStatus::Saved, $jobs[1]->status);
        $this->assertNull($jobs[1]->applied_date);
    }

    public function test_import_reads_the_salary_source_contact_and_deadline_columns(): void
    {
        $user = User::factory()->create();
        $headings = [...self::HEADINGS, ...self::DETAIL_HEADINGS];

        $this->actingAs($user)
            ->postJson('/api/job-applications/import', ['file' => $this->xlsx([
                ['Acme', 'Developer', 'applied', 'high', '2026-09-01', null, null, null, 50000, 60000, 'gbp', 'Company website', 'Jane Doe', 'jane@acme.test', '2026-10-31'],
                ['Globex', 'Designer', 'applied', 'low', '2026-09-02', null, null, null, null, null, null, 'Newspaper', null, null, null],
            ], $headings)])
            ->assertOk()
            ->assertJsonCount(1, 'failures')
            ->assertJsonPath('failures.0.attribute', 'source');

        $job = $user->jobApplications()->sole();
        $this->assertSame(['salary_min' => 50000, 'salary_max' => 60000, 'contact_name' => 'Jane Doe', 'contact_details' => 'jane@acme.test'], $job->only(['salary_min', 'salary_max', 'contact_name', 'contact_details']));
        $this->assertSame(Currency::Gbp, $job->salary_currency);
        $this->assertSame(ApplicationSource::CompanyWebsite, $job->source);
        $this->assertSame('2026-10-31', $job->deadline->toDateString());
    }

    public function test_reimporting_a_file_without_the_detail_columns_keeps_the_details(): void
    {
        $user = User::factory()->create();
        $user->jobApplications()->create(['company_name' => 'Acme', 'position' => 'Developer', 'salary_min' => 50000, 'salary_currency' => 'CHF', 'deadline' => '2026-10-31']);

        $this->actingAs($user)
            ->postJson('/api/job-applications/import', ['file' => $this->xlsx([['Acme', 'Developer', 'interview', 'high', '2026-09-01', null, null, null]])])
            ->assertOk();

        $job = $user->jobApplications()->sole();
        $this->assertSame(JobStatus::Interview, $job->status);
        $this->assertSame(50000, $job->salary_min);
        $this->assertSame(Currency::Chf, $job->salary_currency);
        $this->assertSame('2026-10-31', $job->deadline->toDateString());
    }

    public function test_reimporting_a_row_without_an_applied_date_keeps_the_existing_one(): void
    {
        $user = User::factory()->create();
        $user->jobApplications()->create(['company_name' => 'Acme', 'position' => 'Developer', 'applied_date' => '2026-09-01']);
        $user->jobApplications()->create(['company_name' => 'Globex', 'position' => 'Designer', 'applied_date' => '2026-09-02']);

        $this->actingAs($user)
            ->postJson('/api/job-applications/import', ['file' => $this->xlsx([
                ['Acme', 'Developer', 'Saved', 'high', null, null, null, null],
                ['Globex', 'Designer', 'interview', 'low', null, null, null, null],
            ])])
            ->assertOk();

        $jobs = $user->jobApplications()->orderBy('company_name')->get();
        $this->assertSame('2026-09-01', $jobs[0]->applied_date->toDateString());
        $this->assertSame('2026-09-02', $jobs[1]->applied_date->toDateString());
    }

    public function test_reimporting_updates_existing_jobs_instead_of_duplicating(): void
    {
        $user = User::factory()->create();
        $rows = [['Acme', 'Developer', 'applied', 'high', '2026-09-01', 'Brussels', null, null]];

        $this->actingAs($user)->postJson('/api/job-applications/import', ['file' => $this->xlsx($rows)])->assertOk();

        $rows[0][2] = 'interview';
        $this->actingAs($user)->postJson('/api/job-applications/import', ['file' => $this->xlsx($rows)])->assertOk();

        $this->assertSame(1, $user->jobApplications()->count());
        $this->assertSame(JobStatus::Interview, $user->jobApplications()->first()->status);
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

        $this->assertSame(JobStatus::Offer, $theirs->fresh()->status);
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
