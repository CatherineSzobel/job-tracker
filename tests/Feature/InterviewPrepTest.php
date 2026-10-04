<?php

namespace Tests\Feature;

use App\Models\Interview;
use App\Models\JobApplication;
use App\Models\User;
use Closure;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Arr;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class InterviewPrepTest extends TestCase
{
    use RefreshDatabase;

    private const SHARED_ITEMS = [
        'Research the company',
        'Re-read the job ad',
        'Prepare answers to likely questions',
        'Prepare questions to ask',
        'Have CV and job ad to hand',
    ];

    private function jobFor(User $user): JobApplication
    {
        return $user->jobApplications()->create(['company_name' => 'Acme', 'position' => 'Developer']);
    }

    /**
     * Schedules an interview through the API, the way the app does.
     *
     * @param  array<string, mixed>  $fields
     */
    private function schedule(User $user, array $fields = []): Interview
    {
        $job = $this->jobFor($user);

        $this->actingAs($user)
            ->postJson("/api/job-applications/{$job->id}/interviews", ['interview_date' => now()->addDay()->toDateTimeString(), ...$fields])
            ->assertCreated();

        return $job->interviews()->sole();
    }

    /**
     * An interview created directly, so it has no prep yet (like interviews from before this feature).
     */
    private function interviewFor(User $user): Interview
    {
        return $this->jobFor($user)->interviews()->create([
            'user_id' => $user->id,
            'interview_date' => now()->addDay(),
            'type' => 'online',
        ]);
    }

    /**
     * @return list<string>
     */
    private function checklistTexts(Interview $interview): array
    {
        return array_column($interview->fresh()->prep['checklist'], 'text');
    }

    /**
     * @return array<string, mixed>
     */
    private static function validPrep(): array
    {
        return [
            'checklist' => [['text' => 'Research the company', 'done' => true], ['text' => 'Print CV', 'done' => false]],
            'people' => [['name' => 'Sam Lee', 'role' => 'Engineering Manager', 'url' => 'https://linkedin.com/in/samlee']],
            'questions_to_ask' => ['What does onboarding look like?'],
            'questions_asked' => ['Tell me about a time you disagreed with a colleague'],
            'rating' => 4,
            'debrief_notes' => 'Went well.',
        ];
    }

    public function test_scheduling_an_online_interview_copies_the_shared_and_online_items(): void
    {
        $interview = $this->schedule(User::factory()->create(), ['type' => 'online']);

        $this->assertSame([...self::SHARED_ITEMS, 'Test camera, mic and the video link'], $this->checklistTexts($interview));
        $this->assertFalse($interview->prep['checklist'][0]['done']);
    }

    public function test_scheduling_without_a_type_uses_the_online_items(): void
    {
        $interview = $this->schedule(User::factory()->create());

        $this->assertSame([...self::SHARED_ITEMS, 'Test camera, mic and the video link'], $this->checklistTexts($interview));
    }

    public function test_scheduling_uses_the_users_own_template(): void
    {
        $user = User::factory()->create(['prep_template' => [
            ['text' => 'Print CV', 'type' => null],
            ['text' => 'Book a meeting room', 'type' => 'onsite'],
            ['text' => 'Charge headset', 'type' => 'phone'],
        ]]);

        $interview = $this->schedule($user, ['type' => 'phone']);

        $this->assertSame(['Print CV', 'Charge headset'], $this->checklistTexts($interview));
    }

    public function test_changing_the_type_later_keeps_the_checklist(): void
    {
        $user = User::factory()->create();
        $interview = $this->schedule($user, ['type' => 'online']);

        $this->actingAs($user)->putJson("/api/interviews/{$interview->id}", ['type' => 'onsite'])->assertOk();

        $this->assertContains('Test camera, mic and the video link', $this->checklistTexts($interview));
        $this->assertNotContains('Plan route and arrival time', $this->checklistTexts($interview));
    }

    public function test_an_interview_without_prep_returns_empty_lists_and_its_job(): void
    {
        $user = User::factory()->create();
        $interview = $this->interviewFor($user);

        $this->actingAs($user)->getJson("/api/interviews/{$interview->id}")
            ->assertOk()
            ->assertJsonPath('data.prep', ['checklist' => [], 'people' => [], 'questions_to_ask' => [], 'questions_asked' => []])
            ->assertJsonPath('data.prep_progress', ['done' => 0, 'total' => 0])
            ->assertJsonPath('data.rating', null)
            ->assertJsonPath('data.job.company_name', 'Acme');
    }

    public function test_saving_prep_replaces_the_document_rating_and_debrief_notes(): void
    {
        $user = User::factory()->create();
        $interview = $this->interviewFor($user);

        $this->actingAs($user)->putJson("/api/interviews/{$interview->id}/prep", self::validPrep())
            ->assertOk()
            ->assertJsonPath('data.prep.people.0.name', 'Sam Lee')
            ->assertJsonPath('data.prep_progress', ['done' => 1, 'total' => 2])
            ->assertJsonPath('data.rating', 4)
            ->assertJsonPath('data.debrief_notes', 'Went well.');

        $interview->refresh();
        $this->assertSame(self::validPrep()['questions_asked'], $interview->prep['questions_asked']);
        $this->assertSame(4, $interview->rating);
    }

    public function test_the_rating_can_be_cleared(): void
    {
        $user = User::factory()->create();
        $interview = $this->interviewFor($user);
        $interview->update(['rating' => 3]);

        $this->actingAs($user)->putJson("/api/interviews/{$interview->id}/prep", [...self::validPrep(), 'rating' => null])
            ->assertOk()
            ->assertJsonPath('data.rating', null);
    }

    /**
     * @return array<string, array{Closure(array<string, mixed>): array<string, mixed>, string}>
     */
    public static function invalidPrep(): array
    {
        return [
            'too many checklist items' => [fn (array $prep) => [...$prep, 'checklist' => array_fill(0, 51, ['text' => 'Item', 'done' => false])], 'checklist'],
            'checklist item without text' => [fn (array $prep) => [...$prep, 'checklist' => [['text' => '', 'done' => false]]], 'checklist.0.text'],
            'missing list' => [fn (array $prep) => Arr::except($prep, 'people'), 'people'],
            'link that is not http(s)' => [fn (array $prep) => [...$prep, 'people' => [['name' => 'Sam', 'role' => null, 'url' => 'javascript:alert(1)']]], 'people.0.url'],
            'link without a scheme' => [fn (array $prep) => [...$prep, 'people' => [['name' => 'Sam', 'role' => null, 'url' => 'linkedin.com/in/sam']]], 'people.0.url'],
            'link with a space' => [fn (array $prep) => [...$prep, 'people' => [['name' => 'Sam', 'role' => null, 'url' => 'https://www.linkedin.com/in/sam lee']]], 'people.0.url'],
            'person without a name' => [fn (array $prep) => [...$prep, 'people' => [['name' => '', 'role' => 'CTO', 'url' => null]]], 'people.0.name'],
            'too many questions asked' => [fn (array $prep) => [...$prep, 'questions_asked' => array_fill(0, 51, 'Why?')], 'questions_asked'],
            'rating 0' => [fn (array $prep) => [...$prep, 'rating' => 0], 'rating'],
            'rating 6' => [fn (array $prep) => [...$prep, 'rating' => 6], 'rating'],
        ];
    }

    #[DataProvider('invalidPrep')]
    public function test_rejects_invalid_prep(Closure $makeInvalid, string $errorField): void
    {
        $user = User::factory()->create();
        $interview = $this->interviewFor($user);

        $this->actingAs($user)->putJson("/api/interviews/{$interview->id}/prep", $makeInvalid(self::validPrep()))
            ->assertUnprocessable()
            ->assertJsonValidationErrors($errorField);

        $this->assertNull($interview->fresh()->getRawOriginal('prep'));
    }
}
