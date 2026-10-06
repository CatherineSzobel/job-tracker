<?php

namespace Tests\Feature;

use App\Enums\ArchiveTodosAction;
use App\Enums\ReminderDismissMode;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class SettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_new_users_are_asked_what_to_do_with_open_todos_by_default(): void
    {
        $this->actingAs(User::factory()->create())
            ->getJson('/api/settings')
            ->assertOk()
            ->assertJsonPath('data.archive_todos', 'ask');
    }

    public function test_user_can_choose_what_happens_to_open_todos_on_archive(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->putJson('/api/settings', ['archive_todos' => 'delete'])
            ->assertOk()
            ->assertJsonPath('data.archive_todos', 'delete');

        $this->assertSame(ArchiveTodosAction::Delete, $user->fresh()->archive_todos);
    }

    public function test_an_unknown_archive_todos_value_returns_422(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->putJson('/api/settings', ['archive_todos' => 'shred'])
            ->assertJsonValidationErrors('archive_todos');

        $this->assertSame(ArchiveTodosAction::Ask, $user->fresh()->archive_todos);
    }

    public function test_guests_get_401(): void
    {
        $this->getJson('/api/settings')->assertUnauthorized();
        $this->putJson('/api/settings', ['archive_todos' => 'keep'])->assertUnauthorized();
    }

    public function test_reminders_are_off_by_default(): void
    {
        $this->actingAs(User::factory()->create())
            ->getJson('/api/settings')
            ->assertOk()
            ->assertJsonPath('data.reminders_in_app', false)
            ->assertJsonPath('data.reminders_email', false)
            ->assertJsonPath('data.reminder_days', 7)
            ->assertJsonPath('data.reminder_dismiss_mode', 'today');
    }

    public function test_user_can_change_their_reminder_settings_one_at_a_time(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->putJson('/api/settings', ['reminders_in_app' => true])->assertOk()->assertJsonPath('data.reminders_in_app', true);
        $this->putJson('/api/settings', ['reminders_email' => true])->assertOk();
        $this->putJson('/api/settings', ['reminder_days' => 14])->assertOk()->assertJsonPath('data.reminder_days', 14);
        $this->putJson('/api/settings', ['reminder_dismiss_mode' => 'permanent'])->assertOk();

        $user->refresh();
        $this->assertTrue($user->reminders_in_app);
        $this->assertTrue($user->reminders_email);
        $this->assertSame(14, $user->reminder_days);
        $this->assertSame(ReminderDismissMode::Permanent, $user->reminder_dismiss_mode);
    }

    /**
     * @return array<string, array{array<string, mixed>, string}>
     */
    public static function invalidReminderSettings(): array
    {
        return [
            'zero days' => [['reminder_days' => 0], 'reminder_days'],
            'more than 60 days' => [['reminder_days' => 61], 'reminder_days'],
            'days not a number' => [['reminder_days' => 'soon'], 'reminder_days'],
            'unknown dismiss mode' => [['reminder_dismiss_mode' => 'forever'], 'reminder_dismiss_mode'],
            'toggle not a boolean' => [['reminders_in_app' => 'yes please'], 'reminders_in_app'],
        ];
    }

    #[DataProvider('invalidReminderSettings')]
    public function test_invalid_reminder_settings_return_422(array $body, string $errorKey): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->putJson('/api/settings', $body)->assertJsonValidationErrors($errorKey);

        $this->assertSame(7, $user->fresh()->reminder_days);
        $this->assertFalse($user->fresh()->reminders_in_app);
    }
}
