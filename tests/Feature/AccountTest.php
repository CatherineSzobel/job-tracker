<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AccountTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Sent like the SPA does, so Sanctum starts a session
        $this->withHeader('Referer', config('app.url'));
    }

    public function test_registered_user_is_logged_in_and_can_log_in_again(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Jane',
            'email' => 'jane@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertCreated();

        $user = User::where('email', 'jane@example.com')->sole();
        $this->assertTrue(Hash::check('password123', $user->password), 'password must be stored hashed');
        $this->assertNotNull($user->profile, 'registration creates a profile');
        $this->assertAuthenticatedAs($user);

        $this->postJson('/api/logout')->assertOk();
        $this->postJson('/api/login', ['email' => 'jane@example.com', 'password' => 'password123'])->assertOk();
    }

    public function test_password_change_requires_the_current_password(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->putJson('/api/account/password', [
                'current_password' => 'wrong-password',
                'password' => 'new-password-1',
                'password_confirmation' => 'new-password-1',
            ])
            ->assertUnprocessable();

        $this->assertTrue(Hash::check('password', $user->fresh()->password));
    }

    public function test_password_can_be_changed(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->putJson('/api/account/password', [
                'current_password' => 'password',
                'password' => 'new-password-1',
                'password_confirmation' => 'new-password-1',
            ])
            ->assertOk();

        $this->assertTrue(Hash::check('new-password-1', $user->fresh()->password));
    }

    public function test_account_deletion_requires_the_password(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->deleteJson('/api/account', ['password' => 'wrong-password'])
            ->assertUnprocessable();

        $this->assertModelExists($user);
    }

    public function test_demo_user_is_refused_before_password_is_even_checked(): void
    {
        $demo = User::factory()->create(['email' => config('app.demo_email')]);

        $this->actingAs($demo)
            ->deleteJson('/api/account', ['password' => 'wrong-password'])
            ->assertForbidden()
            ->assertJsonPath('message', 'The demo account cannot be deleted.');
    }
}
