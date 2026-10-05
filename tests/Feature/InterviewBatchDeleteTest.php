<?php

namespace Tests\Feature;

use App\Models\BankQuestion;
use App\Models\Interview;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class InterviewBatchDeleteTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return list<Interview>
     */
    private function interviewsFor(User $user, int $count): array
    {
        $job = $user->jobApplications()->create(['company_name' => 'Acme', 'position' => 'Developer']);

        return collect(range(1, $count))->map(fn (int $day) => $job->interviews()->create([
            'user_id' => $user->id,
            'interview_date' => now()->addDays($day),
            'type' => 'online',
        ]))->all();
    }

    public function test_deletes_the_selected_interviews_and_their_bank_question_links_only(): void
    {
        $user = User::factory()->create();
        [$first, $second, $kept] = $this->interviewsFor($user, 3);
        $question = BankQuestion::factory()->for($user)->create();
        $first->bankQuestions()->attach($question, ['position' => 0]);

        $this->actingAs($user)->deleteJson('/api/interviews/batch', ['ids' => [$first->id, $second->id]])
            ->assertNoContent();

        $this->assertModelMissing($first);
        $this->assertModelMissing($second);
        $this->assertModelExists($kept);
        $this->assertModelExists($question);
        $this->assertDatabaseMissing('bank_question_interview', ['interview_id' => $first->id]);
    }

    public function test_nothing_is_deleted_when_one_id_is_someone_elses(): void
    {
        $user = User::factory()->create();
        [$mine] = $this->interviewsFor($user, 1);
        [$theirs] = $this->interviewsFor(User::factory()->create(), 1);

        $this->actingAs($user)->deleteJson('/api/interviews/batch', ['ids' => [$mine->id, $theirs->id]])
            ->assertNotFound();

        $this->assertModelExists($mine);
        $this->assertModelExists($theirs);
    }

    /**
     * @return array<string, array{array<string, mixed>, string}>
     */
    public static function invalidBodies(): array
    {
        return [
            'no ids' => [[], 'ids'],
            'an empty list' => [['ids' => []], 'ids'],
            'more than 200' => [['ids' => range(1, 201)], 'ids'],
            'not a number' => [['ids' => ['abc']], 'ids.0'],
            'the same id twice' => [['ids' => [1, 1]], 'ids.0'],
        ];
    }

    /**
     * @param  array<string, mixed>  $body
     */
    #[DataProvider('invalidBodies')]
    public function test_rejects_an_invalid_list(array $body, string $errorField): void
    {
        $user = User::factory()->create();
        $this->interviewsFor($user, 1);

        $this->actingAs($user)->deleteJson('/api/interviews/batch', $body)
            ->assertUnprocessable()
            ->assertJsonValidationErrors($errorField);

        $this->assertSame(1, Interview::count());
    }

    public function test_guests_cannot_delete_interviews(): void
    {
        $this->deleteJson('/api/interviews/batch', ['ids' => [1]])->assertUnauthorized();
    }
}
