<?php

use App\Models\User;
use App\Notifications\RemindersDigest;
use App\Services\ReminderService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('reminders:send', function (ReminderService $reminderService) {
    $sentCount = 0;
    $failedCount = 0;

    User::where('reminders_email', true)->each(function (User $user) use ($reminderService, &$sentCount, &$failedCount) {
        if ($user->isDemo()) {
            return;
        }

        $due = $reminderService->dueFor($user);
        if ($due['applications']->isEmpty() && $due['todos']->isEmpty()) {
            return;
        }

        // One failed send (bad address, mail server hiccup) mustn't stop everyone else's email
        try {
            $user->notify(new RemindersDigest($due['applications'], $due['todos']));
            $sentCount++;
        } catch (Throwable $exception) {
            report($exception);
            $failedCount++;
        }
    });

    $this->info("Sent {$sentCount} reminder email(s), {$failedCount} failed.");
})->purpose('Email each user who wants it a digest of their due reminders');

Schedule::command('reminders:send')->dailyAt('08:00');
