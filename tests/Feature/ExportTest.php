<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
            ['company_name', 'position', 'status', 'priority', 'applied_date', 'location', 'notes', 'job_link', 'tags'],
            ['Acme', 'Developer', 'offer', 'high', '2026-09-01', null, null, null, null],
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
}
