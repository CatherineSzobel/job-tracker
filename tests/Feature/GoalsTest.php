<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class GoalsTest extends TestCase
{
    use RefreshDatabase;

    public function test_new_users_get_the_default_goals(): void
    {
        $this->actingAs(User::factory()->create())
            ->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('data.daily_goal', 5)
            ->assertJsonPath('data.weekly_goal', 20);
    }

    public function test_user_can_update_their_goals(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->putJson('/api/account/goals', ['daily_goal' => 3, 'weekly_goal' => 12])
            ->assertOk()
            ->assertJsonPath('data.daily_goal', 3)
            ->assertJsonPath('data.weekly_goal', 12);

        $this->assertSame([3, 12], [$user->fresh()->daily_goal, $user->fresh()->weekly_goal]);
    }

    /**
     * @return array<string, array{array<string, mixed>, string}>
     */
    public static function invalidGoals(): array
    {
        return [
            'daily missing' => [['weekly_goal' => 20], 'daily_goal'],
            'daily zero' => [['daily_goal' => 0, 'weekly_goal' => 20], 'daily_goal'],
            'daily too high' => [['daily_goal' => 101, 'weekly_goal' => 20], 'daily_goal'],
            'daily not a whole number' => [['daily_goal' => 2.5, 'weekly_goal' => 20], 'daily_goal'],
            'weekly missing' => [['daily_goal' => 5], 'weekly_goal'],
            'weekly zero' => [['daily_goal' => 5, 'weekly_goal' => 0], 'weekly_goal'],
            'weekly too high' => [['daily_goal' => 5, 'weekly_goal' => 501], 'weekly_goal'],
            'weekly not a number' => [['daily_goal' => 5, 'weekly_goal' => 'lots'], 'weekly_goal'],
            'weekly below daily' => [['daily_goal' => 10, 'weekly_goal' => 9], 'weekly_goal'],
        ];
    }

    #[DataProvider('invalidGoals')]
    public function test_invalid_goals_are_rejected(array $payload, string $field): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->putJson('/api/account/goals', $payload)
            ->assertJsonValidationErrors($field);

        $this->assertSame([5, 20], [$user->fresh()->daily_goal, $user->fresh()->weekly_goal]);
    }

    public function test_guests_cannot_update_goals(): void
    {
        $this->putJson('/api/account/goals', ['daily_goal' => 3, 'weekly_goal' => 12])->assertUnauthorized();
    }
}
