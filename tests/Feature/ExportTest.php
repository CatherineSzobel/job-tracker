<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Tests\TestCase;

class ExportTest extends TestCase
{
    use RefreshDatabase;

    public function test_export_writes_the_users_jobs_with_plain_status_and_priority(): void
    {
        $user = User::factory()->create();
        $user->jobApplications()->create([
            'company_name' => 'Acme', 'position' => 'Developer', 'status' => 'offer', 'priority' => 'high', 'applied_date' => '2026-09-01',
        ]);
        User::factory()->create()->jobApplications()->create(['company_name' => 'Globex', 'position' => 'Designer']);

        $response = $this->actingAs($user)->get('/api/job-applications/export')->assertOk();

        $rows = IOFactory::load($response->baseResponse->getFile()->getPathname())->getActiveSheet()->toArray();

        $this->assertSame([
            [
                'company_name', 'position', 'status', 'priority', 'applied_date', 'location', 'notes', 'job_link', 'tags',
                'salary_min', 'salary_max', 'salary_currency', 'source', 'contact_name', 'contact_details', 'deadline',
            ],
            ['Acme', 'Developer', 'offer', 'high', '2026-09-01', null, null, null, null, null, null, 'EUR', null, null, null, null],
        ], $rows);
    }

    public function test_export_lists_each_jobs_tags_by_name(): void
    {
        $user = User::factory()->create();
        $job = $user->jobApplications()->create(['company_name' => 'Acme', 'position' => 'Developer']);
        $job->tags()->attach([
            $user->tags()->create(['name' => 'remote', 'color' => 'blue'])->id,
            $user->tags()->create(['name' => 'fintech', 'color' => 'red'])->id,
        ]);

        $response = $this->actingAs($user)->get('/api/job-applications/export')->assertOk();

        $rows = IOFactory::load($response->baseResponse->getFile()->getPathname())->getActiveSheet()->toArray();

        $this->assertSame('tags', $rows[0][8]);
        $this->assertSame('fintech, remote', $rows[1][8]);
    }

    public function test_export_writes_text_starting_with_an_equals_sign_as_text_not_a_formula(): void
    {
        $user = User::factory()->create();
        $user->jobApplications()->create(['company_name' => 'Acme', 'position' => 'Developer', 'contact_name' => '=HYPERLINK("https://evil.test","Open")']);

        $response = $this->actingAs($user)->get('/api/job-applications/export')->assertOk();

        $cell = IOFactory::load($response->baseResponse->getFile()->getPathname())->getActiveSheet()->getCell('N2');
        $this->assertSame(DataType::TYPE_STRING, $cell->getDataType());
        $this->assertSame('=HYPERLINK("https://evil.test","Open")', $cell->getValue());
    }

    public function test_export_writes_the_salary_source_contact_and_deadline(): void
    {
        $user = User::factory()->create();
        $user->jobApplications()->create([
            'company_name' => 'Acme', 'position' => 'Developer', 'salary_min' => 50000, 'salary_max' => 60000, 'salary_currency' => 'CHF',
            'source' => 'company_website', 'contact_name' => 'Jane Doe', 'contact_details' => 'jane@acme.test', 'deadline' => '2026-10-31',
        ]);

        $response = $this->actingAs($user)->get('/api/job-applications/export')->assertOk();

        $rows = IOFactory::load($response->baseResponse->getFile()->getPathname())->getActiveSheet()->toArray();

        $this->assertSame(['50000', '60000', 'CHF', 'company_website', 'Jane Doe', 'jane@acme.test', '2026-10-31'], array_slice($rows[1], 9));
    }
}
