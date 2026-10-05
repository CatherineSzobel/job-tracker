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

    public function test_email_can_be_changed_with_the_current_password(): void
    {
        $user = User::factory()->create(['email' => 'old@example.com']);

        $this->actingAs($user)
            ->putJson('/api/account/email', ['email' => 'new@example.com', 'current_password' => 'password'])
            ->assertOk()
            ->assertJsonPath('data.email', 'new@example.com');

        $this->assertSame('new@example.com', $user->fresh()->email);
    }

    public function test_email_change_requires_the_current_password(): void
    {
        $user = User::factory()->create(['email' => 'old@example.com']);

        $this->actingAs($user)
            ->putJson('/api/account/email', ['email' => 'new@example.com', 'current_password' => 'wrong-password'])
            ->assertJsonValidationErrors('current_password');

        $this->assertSame('old@example.com', $user->fresh()->email);
    }

    public function test_email_already_used_by_another_account_is_rejected(): void
    {
        User::factory()->create(['email' => 'taken@example.com']);
        $user = User::factory()->create(['email' => 'old@example.com']);

        $this->actingAs($user)
            ->putJson('/api/account/email', ['email' => 'TAKEN@example.com', 'current_password' => 'password'])
            ->assertJsonValidationErrors('email');

        $this->assertSame('old@example.com', $user->fresh()->email);
    }

    public function test_an_invalid_email_is_rejected(): void
    {
        $user = User::factory()->create(['email' => 'old@example.com']);

        $this->actingAs($user)
            ->putJson('/api/account/email', ['email' => 'not-an-email', 'current_password' => 'password'])
            ->assertJsonValidationErrors('email');
    }

    public function test_demo_users_email_cannot_be_changed(): void
    {
        $demo = User::factory()->create(['email' => config('app.demo_email')]);

        $this->actingAs($demo)
            ->putJson('/api/account/email', ['email' => 'new@example.com', 'current_password' => 'password'])
            ->assertForbidden()
            ->assertJsonPath('message', 'The demo account email cannot be changed.');

        $this->assertSame(config('app.demo_email'), $demo->fresh()->email);
    }

    public function test_the_current_user_says_whether_it_is_the_demo_account(): void
    {
        $this->actingAs(User::factory()->create(['email' => config('app.demo_email')]))
            ->getJson('/api/user')
            ->assertJsonPath('data.is_demo', true);

        $this->actingAs(User::factory()->create())
            ->getJson('/api/user')
            ->assertJsonPath('data.is_demo', false);
    }

    public function test_guests_cannot_change_an_email(): void
    {
        $this->putJson('/api/account/email', ['email' => 'new@example.com', 'current_password' => 'password'])
            ->assertUnauthorized();
    }
}
