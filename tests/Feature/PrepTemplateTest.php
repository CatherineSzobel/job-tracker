<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class PrepTemplateTest extends TestCase
{
    use RefreshDatabase;

    public function test_without_a_custom_template_the_default_is_returned(): void
    {
        $this->actingAs(User::factory()->create())->getJson('/api/interview-prep-template')
            ->assertOk()
            ->assertJsonPath('data.is_default', true)
            ->assertJsonCount(8, 'data.items')
            ->assertJsonPath('data.items.0', ['text' => 'Research the company', 'type' => null])
            ->assertJsonPath('data.items.5', ['text' => 'Test camera, mic and the video link', 'type' => 'online']);
    }

    public function test_saves_a_custom_template(): void
    {
        $user = User::factory()->create();
        $items = [['text' => 'Print CV', 'type' => null], ['text' => 'Book a meeting room', 'type' => 'onsite']];

        $this->actingAs($user)->putJson('/api/interview-prep-template', ['items' => $items])
            ->assertOk()
            ->assertJsonPath('data.is_default', false)
            ->assertJsonPath('data.items', $items);

        $this->assertSame($items, $user->fresh()->prep_template);
        $this->getJson('/api/interview-prep-template')->assertJsonPath('data.items', $items);
    }

    public function test_an_item_without_a_type_applies_to_every_interview(): void
    {
        $this->actingAs(User::factory()->create())
            ->putJson('/api/interview-prep-template', ['items' => [['text' => 'Print CV']]])
            ->assertOk()
            ->assertJsonPath('data.items.0', ['text' => 'Print CV', 'type' => null]);
    }

    /**
     * @return array<string, array{array<string, mixed>, string}>
     */
    public static function invalidTemplates(): array
    {
        return [
            'unknown type' => [['items' => [['text' => 'Print CV', 'type' => 'video']]], 'items.0.type'],
            'too many items' => [['items' => array_fill(0, 31, ['text' => 'Item', 'type' => null])], 'items'],
            'item without text' => [['items' => [['text' => '', 'type' => null]]], 'items.0.text'],
            'no items key' => [[], 'items'],
        ];
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    #[DataProvider('invalidTemplates')]
    public function test_rejects_an_invalid_template(array $payload, string $errorField): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->putJson('/api/interview-prep-template', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors($errorField);

        $this->assertNull($user->fresh()->prep_template);
    }

    public function test_resetting_goes_back_to_the_default(): void
    {
        $user = User::factory()->create(['prep_template' => [['text' => 'Print CV', 'type' => null]]]);

        $this->actingAs($user)->deleteJson('/api/interview-prep-template')
            ->assertOk()
            ->assertJsonPath('data.is_default', true)
            ->assertJsonCount(8, 'data.items');

        $this->assertNull($user->fresh()->prep_template);
    }
}
