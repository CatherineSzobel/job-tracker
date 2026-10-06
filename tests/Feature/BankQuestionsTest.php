<?php

namespace Tests\Feature;

use App\Models\BankQuestion;
use App\Models\Interview;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class BankQuestionsTest extends TestCase
{
    use RefreshDatabase;

    private function interviewFor(User $user): Interview
    {
        return $user->jobApplications()->create(['company_name' => 'Acme', 'position' => 'Developer'])
            ->interviews()->create(['user_id' => $user->id, 'interview_date' => now()->addDay(), 'type' => 'online']);
    }

    public function test_lists_the_users_questions_newest_first_with_how_often_they_are_used(): void
    {
        $user = User::factory()->create();
        $older = BankQuestion::factory()->for($user)->create(['question' => 'Why us?', 'created_at' => now()->subDay()]);
        BankQuestion::factory()->for($user)->create(['question' => 'Tell me about yourself']);
        BankQuestion::factory()->create(['question' => 'Not mine']);
        $this->interviewFor($user)->bankQuestions()->attach($older, ['position' => 0]);

        $this->actingAs($user)->getJson('/api/bank-questions')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.question', 'Tell me about yourself')
            ->assertJsonPath('data.0.interviews_count', 0)
            ->assertJsonPath('data.1.question', 'Why us?')
            ->assertJsonPath('data.1.interviews_count', 1);
    }

    public function test_filters_by_category(): void
    {
        $user = User::factory()->create();
        BankQuestion::factory()->for($user)->create(['question' => 'Explain REST', 'category' => 'technical']);
        BankQuestion::factory()->for($user)->create(['question' => 'Why us?', 'category' => 'motivation']);

        $this->actingAs($user)->getJson('/api/bank-questions?category=technical')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.question', 'Explain REST');
    }

    public function test_creates_updates_and_deletes_a_question(): void
    {
        $user = User::factory()->create();

        $questionId = $this->actingAs($user)
            ->postJson('/api/bank-questions', ['question' => 'Why us?', 'answer' => 'Your mission.', 'category' => 'motivation'])
            ->assertCreated()
            ->assertJsonPath('data.category', 'motivation')
            ->json('data.id');

        $this->patchJson("/api/bank-questions/{$questionId}", ['answer' => 'Your product.'])
            ->assertOk()
            ->assertJsonPath('data.answer', 'Your product.')
            ->assertJsonPath('data.question', 'Why us?');

        $this->deleteJson("/api/bank-questions/{$questionId}")->assertNoContent();
        $this->assertSame(0, $user->bankQuestions()->count());
    }

    /**
     * @return array<string, array{array<string, mixed>, string}>
     */
    public static function invalidQuestions(): array
    {
        return [
            'question too long' => [['question' => str_repeat('a', 501), 'category' => 'other'], 'question'],
            'no question' => [['category' => 'other'], 'question'],
            'no category' => [['question' => 'Why us?'], 'category'],
            'unknown category' => [['question' => 'Why us?', 'category' => 'trivia'], 'category'],
            'answer too long' => [['question' => 'Why us?', 'category' => 'other', 'answer' => str_repeat('a', 10001)], 'answer'],
        ];
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    #[DataProvider('invalidQuestions')]
    public function test_rejects_an_invalid_question(array $payload, string $errorField): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/api/bank-questions', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors($errorField);

        $this->assertSame(0, $user->bankQuestions()->count());
    }

    public function test_deleting_a_question_removes_it_from_interviews(): void
    {
        $user = User::factory()->create();
        $interview = $this->interviewFor($user);
        $question = BankQuestion::factory()->for($user)->create();
        $interview->bankQuestions()->attach($question, ['position' => 0]);

        $this->actingAs($user)->deleteJson("/api/bank-questions/{$question->id}")->assertNoContent();

        $this->assertSame(0, $interview->bankQuestions()->count());
        $this->assertModelExists($interview);
    }

    public function test_linking_keeps_the_order_and_notes_and_replaces_the_previous_set(): void
    {
        $user = User::factory()->create();
        $interview = $this->interviewFor($user);
        [$first, $second, $third] = BankQuestion::factory()->for($user)->count(3)->create()->all();
        $interview->bankQuestions()->attach($first, ['position' => 0]);

        $this->actingAs($user)->putJson("/api/interviews/{$interview->id}/bank-questions", ['questions' => [
            ['id' => $third->id, 'note' => 'Mention the Acme project'],
            ['id' => $second->id],
        ]])
            ->assertOk()
            ->assertJsonCount(2, 'data.bank_questions')
            ->assertJsonPath('data.bank_questions.0.id', $third->id)
            ->assertJsonPath('data.bank_questions.0.note', 'Mention the Acme project')
            ->assertJsonPath('data.bank_questions.1.id', $second->id)
            ->assertJsonPath('data.bank_questions.1.note', null);
    }

    public function test_an_interview_shows_the_current_answer_of_a_linked_question(): void
    {
        $user = User::factory()->create();
        $interview = $this->interviewFor($user);
        $question = BankQuestion::factory()->for($user)->create(['answer' => 'Old answer']);
        $interview->bankQuestions()->attach($question, ['position' => 0, 'note' => 'Keep it short']);

        $this->actingAs($user)->patchJson("/api/bank-questions/{$question->id}", ['answer' => 'New answer'])->assertOk();

        $this->getJson("/api/interviews/{$interview->id}")
            ->assertOk()
            ->assertJsonPath('data.bank_questions.0.answer', 'New answer')
            ->assertJsonPath('data.bank_questions.0.note', 'Keep it short');
    }

    public function test_cannot_link_another_users_question(): void
    {
        $user = User::factory()->create();
        $interview = $this->interviewFor($user);
        $theirs = BankQuestion::factory()->create();

        $this->actingAs($user)->putJson("/api/interviews/{$interview->id}/bank-questions", ['questions' => [['id' => $theirs->id]]])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('questions.0.id');

        $this->assertSame(0, $interview->bankQuestions()->count());
    }

    public function test_cannot_link_the_same_question_twice(): void
    {
        $user = User::factory()->create();
        $interview = $this->interviewFor($user);
        $question = BankQuestion::factory()->for($user)->create();

        $this->actingAs($user)->putJson("/api/interviews/{$interview->id}/bank-questions", ['questions' => [
            ['id' => $question->id], ['id' => $question->id],
        ]])->assertUnprocessable()->assertJsonValidationErrors('questions.0.id');
    }
}
