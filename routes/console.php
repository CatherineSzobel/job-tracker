<?php

use App\Models\User;
use App\Notifications\RemindersDigest;
use App\Services\DocumentService;
use App\Services\ReminderService;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schedule;

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

Artisan::command('demo:reset', function (DocumentService $documentService) {
    $demo = User::where('email', config('app.demo_email'))->first();

    // All or nothing: if seeding fails, the old demo data stays
    DB::transaction(function () use ($demo) {
        $demo?->delete(); // its applications, interviews, to-dos, notes and documents go with it (cascade)
        $this->call('db:seed', ['--force' => true]);
    });

    if ($demo) {
        $documentService->deleteFilesFor($demo);
    }

    $this->info('The demo account has been reset.');
})->purpose('Replace the shared demo account with fresh seed data, relative to today');

// Visitors share the demo account, so whatever one of them changes is gone the next morning
Schedule::command('demo:reset')->dailyAt('04:00');
