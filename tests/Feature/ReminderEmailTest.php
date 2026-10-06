<?php

namespace Tests\Feature;

use App\Models\Todo;
use App\Models\User;
use App\Notifications\RemindersDigest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class ReminderEmailTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function userWithStaleJob(array $attributes = []): User
    {
        $user = User::factory()->create($attributes);
        $this->travelTo(now()->subDays(10));
        $user->jobApplications()->create(['company_name' => 'Acme', 'position' => 'Developer']);
        $this->travelBack();

        return $user;
    }

    public function test_emails_a_digest_to_users_who_want_it_and_have_something_due(): void
    {
        Notification::fake();
        $wantsEmail = $this->userWithStaleJob(['reminders_email' => true]);
        $onlyTodo = User::factory()->create(['reminders_email' => true]);
        Todo::factory()->for($onlyTodo)->create(['due_date' => today()->toDateString()]);

        $this->artisan('reminders:send')->assertSuccessful();

        Notification::assertSentTo($wantsEmail, RemindersDigest::class, fn (RemindersDigest $digest) => $digest->applications->count() === 1 && $digest->todos->isEmpty());
        Notification::assertSentTo($onlyTodo, RemindersDigest::class, fn (RemindersDigest $digest) => $digest->applications->isEmpty() && $digest->todos->count() === 1);
    }

    public function test_email_does_not_depend_on_in_app_reminders(): void
    {
        Notification::fake();
        $emailOnly = $this->userWithStaleJob(['reminders_email' => true, 'reminders_in_app' => false]);
        $inAppOnly = $this->userWithStaleJob(['reminders_email' => false, 'reminders_in_app' => true]);

        $this->artisan('reminders:send')->assertSuccessful();

        Notification::assertSentTo($emailOnly, RemindersDigest::class);
        Notification::assertNotSentTo($inAppOnly, RemindersDigest::class);
    }

    public function test_skips_users_with_nothing_due_and_the_demo_user(): void
    {
        Notification::fake();
        $nothingDue = User::factory()->create(['reminders_email' => true]);
        $demo = $this->userWithStaleJob(['reminders_email' => true, 'email' => config('app.demo_email')]);

        $this->artisan('reminders:send')->assertSuccessful();

        Notification::assertNotSentTo($nothingDue, RemindersDigest::class);
        Notification::assertNotSentTo($demo, RemindersDigest::class);
    }

    public function test_the_digest_lists_the_applications_and_todos_with_a_link_to_the_app(): void
    {
        config(['app.frontend_url' => 'http://localhost:5173']);
        $user = $this->userWithStaleJob(['reminders_email' => true]);
        $job = $user->jobApplications()->first();
        $todo = Todo::factory()->for($user)->create(['text' => 'Email the recruiter', 'due_date' => today()->toDateString(), 'job_application_id' => $job->id]);

        $mail = (new RemindersDigest(collect([$job]), collect([$todo->load('jobApplication')])))->toMail($user);
        $text = implode("\n", [...$mail->introLines, ...$mail->outroLines]);

        $this->assertStringContainsString('Acme (Developer): no update for 10 days', $text);
        $this->assertStringContainsString('Email the recruiter (Acme)', $text);
        $this->assertSame('http://localhost:5173', $mail->actionUrl);
    }

    public function test_it_is_scheduled_daily_at_eight(): void
    {
        // schedule:list boots the console routes, where the schedule is defined
        Artisan::call('schedule:list');

        $this->assertMatchesRegularExpression('/0 8 \* \* \*\s+php artisan reminders:send/', Artisan::output());
    }
}
