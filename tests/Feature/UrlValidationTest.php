<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class UrlValidationTest extends TestCase
{
    use RefreshDatabase;

    public static function unsafeUrls(): array
    {
        return [
            'javascript' => ['javascript:alert(1)'],
            'javascript with slashes' => ['javascript://example.com/%0Aalert(1)'],
            'data' => ['data:text/html,<script>alert(1)</script>'],
            'ftp' => ['ftp://example.com/file'],
        ];
    }

    #[DataProvider('unsafeUrls')]
    public function test_job_link_rejects_non_http_urls(string $url): void
    {
        $this->actingAs(User::factory()->create())
            ->postJson('/api/job-applications', [
                'company_name' => 'Acme',
                'position' => 'Developer',
                'job_link' => $url,
            ])
            ->assertJsonValidationErrors('job_link');
    }

    #[DataProvider('unsafeUrls')]
    public function test_job_link_update_rejects_non_http_urls(string $url): void
    {
        $user = User::factory()->create();
        $job = $user->jobApplications()->create(['company_name' => 'Acme', 'position' => 'Developer']);

        $this->actingAs($user)
            ->putJson("/api/job-applications/{$job->id}", ['job_link' => $url])
            ->assertJsonValidationErrors('job_link');
    }

    #[DataProvider('unsafeUrls')]
    public function test_profile_link_rejects_non_http_urls(string $url): void
    {
        $user = User::factory()->create();
        $user->profile()->create(['name' => $user->name]);

        $this->actingAs($user)
            ->postJson('/api/profile/links', ['type' => 'GitHub', 'url' => $url])
            ->assertJsonValidationErrors('url');
    }

    public function test_https_links_are_accepted(): void
    {
        $user = User::factory()->create();
        $user->profile()->create(['name' => $user->name]);

        $this->actingAs($user)
            ->postJson('/api/job-applications', [
                'company_name' => 'Acme',
                'position' => 'Developer',
                'job_link' => 'https://example.com/jobs/1',
            ])
            ->assertCreated();

        $this->actingAs($user)
            ->postJson('/api/profile/links', ['type' => 'GitHub', 'url' => 'https://github.com/me'])
            ->assertCreated();
    }
}
