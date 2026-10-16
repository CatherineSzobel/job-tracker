<?php

namespace Tests\Feature;

use App\Models\Interview;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/**
 * The meeting link on interviews and the "Add to calendar" .ics download.
 */
class InterviewMeetingAndCalendarTest extends TestCase
{
    use RefreshDatabase;

    private const MEETING_URL = 'https://meet.example.test/abc-defg-hij';

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function interviewFor(User $user, array $attributes = []): Interview
    {
        $job = $user->jobApplications()->create(['company_name' => 'Acme', 'position' => 'Developer']);

        return $job->interviews()->create(['user_id' => $user->id, 'interview_date' => '2026-10-20 14:00:00', 'type' => 'online', ...$attributes]);
    }

    public function test_a_meeting_link_can_be_added_when_scheduling_changed_and_cleared(): void
    {
        $user = User::factory()->create();
        $job = $user->jobApplications()->create(['company_name' => 'Acme', 'position' => 'Developer']);

        $interviewId = $this->actingAs($user)->postJson("/api/job-applications/{$job->id}/interviews", [
            'interview_date' => '2026-10-20 14:00:00',
            'meeting_url' => self::MEETING_URL,
        ])
            ->assertCreated()
            ->assertJsonPath('data.meeting_url', self::MEETING_URL)
            ->json('data.id');

        $this->putJson("/api/interviews/{$interviewId}", ['meeting_url' => 'https://zoom.example.test/j/123'])
            ->assertOk()
            ->assertJsonPath('data.meeting_url', 'https://zoom.example.test/j/123');
        $this->putJson("/api/interviews/{$interviewId}", ['meeting_url' => null])
            ->assertOk()
            ->assertJsonPath('data.meeting_url', null);
    }

    /**
     * @return array<string, array{string}>
     */
    public static function invalidMeetingUrls(): array
    {
        return [
            'no scheme' => ['meet.example.test/abc'],
            'not http(s)' => ['javascript:alert(1)'],
            'too long' => ['https://meet.example.test/'.str_repeat('a', 2048)],
        ];
    }

    #[DataProvider('invalidMeetingUrls')]
    public function test_a_meeting_link_must_be_an_http_link(string $meetingUrl): void
    {
        $user = User::factory()->create();
        $interview = $this->interviewFor($user);

        $this->actingAs($user)->putJson("/api/interviews/{$interview->id}", ['meeting_url' => $meetingUrl])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('meeting_url');
    }

    public function test_the_calendar_file_has_the_time_title_place_link_and_notes(): void
    {
        $user = User::factory()->create();
        $interview = $this->interviewFor($user, ['meeting_url' => self::MEETING_URL, 'notes' => "Ask about the team, size; and\nthe stack"]);
        $this->travelTo('2026-10-16 12:00:00');

        $response = $this->actingAs($user)->get("/api/interviews/{$interview->id}/calendar")
            ->assertOk()
            ->assertHeader('Content-Type', 'text/calendar; charset=utf-8')
            ->assertHeader('Content-Disposition', 'attachment; filename="interview-acme-2026-10-20.ics"');

        $lines = explode("\r\n", $response->getContent());
        $this->assertSame('BEGIN:VCALENDAR', $lines[0]);
        foreach ([
            'DTSTAMP:20261016T120000Z',
            'DTSTART:20261020T140000Z',
            'DTEND:20261020T150000Z',
            'SUMMARY:Online interview: Developer at Acme',
            // No place given, so the link stands in
            'LOCATION:'.self::MEETING_URL,
            'URL:'.self::MEETING_URL,
            'DESCRIPTION:Join: '.self::MEETING_URL.'\n\nAsk about the team\, size\; and\nthe stack',
        ] as $line) {
            $this->assertContains($line, $this->unfold($lines));
        }
    }

    public function test_long_calendar_lines_are_folded_to_75_bytes(): void
    {
        $user = User::factory()->create();
        $location = 'Büro '.str_repeat('Großstraße ', 20);
        $interview = $this->interviewFor($user, ['location' => $location]);

        $content = $this->actingAs($user)->get("/api/interviews/{$interview->id}/calendar")->assertOk()->getContent();

        foreach (explode("\r\n", $content) as $line) {
            $this->assertLessThanOrEqual(75, strlen($line));
            $this->assertTrue(mb_check_encoding($line, 'UTF-8'), 'no character is split across lines');
        }
        $this->assertContains('LOCATION:'.$location, $this->unfold(explode("\r\n", $content)));
    }

    public function test_another_users_calendar_file_is_not_found(): void
    {
        $interview = $this->interviewFor(User::factory()->create());

        $this->actingAs(User::factory()->create())->get("/api/interviews/{$interview->id}/calendar")->assertNotFound();
    }

    /**
     * The lines as they were before folding: a line starting with a space continues the one before
     *
     * @param  list<string>  $lines
     * @return list<string>
     */
    private function unfold(array $lines): array
    {
        $unfolded = [];
        foreach ($lines as $line) {
            if (str_starts_with($line, ' ') && $unfolded !== []) {
                $unfolded[count($unfolded) - 1] .= substr($line, 1);
            } else {
                $unfolded[] = $line;
            }
        }

        return $unfolded;
    }
}
