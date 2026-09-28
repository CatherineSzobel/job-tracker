<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        // Sent like the SPA does, so Sanctum starts a session
        $this->withHeader('Referer', config('app.url'));
        $this->user = User::factory()->create();
    }

    private function login(string $password = 'password')
    {
        return $this->postJson('/api/login', ['email' => $this->user->email, 'password' => $password]);
    }

    public function test_valid_credentials_log_the_user_in(): void
    {
        $this->login()
            ->assertOk()
            ->assertJsonPath('user.email', $this->user->email)
            ->assertJsonMissingPath('user.password');

        $this->assertAuthenticatedAs($this->user, 'web');
    }

    public function test_wrong_password_is_a_validation_error_on_email(): void
    {
        $this->login('wrong-password')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email' => __('auth.failed')]);

        $this->assertGuest('web');
    }

    public function test_five_failed_attempts_lock_the_account_with_429(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->login('wrong-password')->assertUnprocessable();
        }

        // Even the right password is refused while locked out
        $this->login()
            ->assertTooManyRequests()
            ->assertJsonValidationErrors('email');
    }

    public function test_successful_logins_do_not_count_towards_the_limit(): void
    {
        for ($i = 0; $i < 6; $i++) {
            $this->login()->assertOk();
            $this->postJson('/api/logout')->assertOk();
        }
    }

    public function test_successful_login_resets_the_failed_attempts(): void
    {
        for ($i = 0; $i < 4; $i++) {
            $this->login('wrong-password')->assertUnprocessable();
        }

        $this->login()->assertOk();
        $this->postJson('/api/logout')->assertOk();

        // The counter restarted, so 4 more failures are still not a lockout
        for ($i = 0; $i < 4; $i++) {
            $this->login('wrong-password')->assertUnprocessable();
        }
    }
}
