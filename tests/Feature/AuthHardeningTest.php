<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthHardeningTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_is_rate_limited(): void
    {
        $user = User::factory()->create();
        $credentials = ['email' => $user->email, 'password' => 'wrong-password'];

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/login', $credentials)->assertUnauthorized();
        }

        $this->postJson('/api/login', $credentials)->assertTooManyRequests();
    }

    public function test_register_is_rate_limited(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/register', ['email' => 'not-an-email'])->assertUnprocessable();
        }

        $this->postJson('/api/register', ['email' => 'not-an-email'])->assertTooManyRequests();
    }

    public function test_demo_user_cannot_change_password(): void
    {
        $demo = User::factory()->create(['email' => config('app.demo_email')]);

        $this->actingAs($demo)
            ->putJson('/api/account/password', [
                'current_password' => 'password',
                'password' => 'new-password',
                'password_confirmation' => 'new-password',
            ])
            ->assertForbidden();
    }

    public function test_demo_user_cannot_delete_account(): void
    {
        $demo = User::factory()->create(['email' => config('app.demo_email')]);

        $this->actingAs($demo)
            ->deleteJson('/api/account', ['password' => 'password'])
            ->assertForbidden();

        $this->assertModelExists($demo);
    }

    public function test_regular_user_can_still_delete_account(): void
    {
        $user = User::factory()->create();

        // Sent like the SPA does, so Sanctum starts a session
        $this->actingAs($user)
            ->withHeader('Referer', config('app.url'))
            ->deleteJson('/api/account', ['password' => 'password'])
            ->assertOk();

        $this->assertModelMissing($user);
    }
}
