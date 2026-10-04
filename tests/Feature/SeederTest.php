<?php

namespace Tests\Feature;

use App\Models\Interview;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_database_seeder_runs_and_creates_one_demo_user_with_data(): void
    {
        $this->seed();

        $demo = User::where('email', config('app.demo_email'))->sole();

        $this->assertNotNull($demo->profile);
        $this->assertDatabaseCount('profiles', 1);
        $this->assertGreaterThanOrEqual(20, $demo->jobApplications()->count());
    }

    public function test_demo_user_gets_a_question_bank_linked_to_their_next_interview(): void
    {
        $this->seed();

        $demo = User::where('email', config('app.demo_email'))->sole();
        $nextInterview = Interview::where('user_id', $demo->id)->orderBy('interview_date')->first();

        $this->assertGreaterThanOrEqual(10, $demo->bankQuestions()->count());
        $this->assertSame(5, $demo->bankQuestions()->distinct()->count('category'));
        $this->assertSame(3, $nextInterview->bankQuestions()->count());
        $this->assertNotNull($nextInterview->bankQuestions()->first()->pivot->note);
    }

    public function test_demo_user_can_log_in_with_seeded_password(): void
    {
        $this->seed();

        // Sent like the SPA does, so Sanctum starts a session
        $this->withHeader('Referer', config('app.url'))->postJson('/api/login', [
            'email' => config('app.demo_email'),
            'password' => 'secret123',
        ])->assertOk();
    }
}
