<?php

namespace Tests\Feature;

use App\Enums\ArchiveTodosAction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
}
