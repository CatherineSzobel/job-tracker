<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiRateLimitTest extends TestCase
{
    use RefreshDatabase;

    // Login and register limits are covered in LoginTest and AuthHardeningTest

    public function test_a_user_gets_60_requests_a_minute(): void
    {
        $this->actingAs(User::factory()->create());

        $this->useUp(60);

        $this->getJson('/api/tags')->assertTooManyRequests()->assertHeader('Retry-After');
    }

    public function test_the_user_route_is_limited_too(): void
    {
        $this->actingAs(User::factory()->create());

        $this->useUp(60, '/api/user');

        $this->getJson('/api/user')->assertTooManyRequests();
    }

    public function test_each_user_has_their_own_limit(): void
    {
        $this->actingAs(User::factory()->create());
        $this->useUp(60);

        $this->actingAs(User::factory()->create());
        $this->getJson('/api/tags')->assertOk();
    }

    public function test_demo_visitors_on_different_ips_have_their_own_limit(): void
    {
        $this->actingAs(User::factory()->create(['email' => config('app.demo_email')]));

        $this->useUp(60, ip: '10.0.0.1');
        $this->withServerVariables(['REMOTE_ADDR' => '10.0.0.1'])->getJson('/api/tags')->assertTooManyRequests();

        $this->withServerVariables(['REMOTE_ADDR' => '10.0.0.2'])->getJson('/api/tags')->assertOk();
    }

    public function test_the_limit_resets_after_a_minute(): void
    {
        $this->actingAs(User::factory()->create());
        $this->useUp(60);

        $this->travel(61)->seconds();

        $this->getJson('/api/tags')->assertOk();
    }

    public function test_a_guest_still_gets_401(): void
    {
        $this->getJson('/api/tags')->assertUnauthorized();
    }

    /**
     * Sends $count GET requests to $uri from $ip and asserts each one passes.
     */
    private function useUp(int $count, string $uri = '/api/tags', string $ip = '127.0.0.1'): void
    {
        for ($i = 0; $i < $count; $i++) {
            $this->withServerVariables(['REMOTE_ADDR' => $ip])->getJson($uri)->assertOk();
        }
    }
}
