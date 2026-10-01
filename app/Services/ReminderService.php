<?php

namespace App\Services;

use App\Enums\ReminderDismissMode;
use App\Models\JobApplication;
use App\Models\Todo;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

/**
 * What a user should be reminded about, shared by GET /api/reminders and the daily email.
 */
class ReminderService
{
    /**
     * @return array{applications: Collection<int, JobApplication>, todos: Collection<int, Todo>}
     */
    public function dueFor(User $user): array
    {
        return [
            'applications' => $user->jobApplications()->needsReminder($user->reminder_days)->oldest('updated_at')->get(),
            'todos' => $user->todos()->dueForReminder()->with('jobApplication:id,company_name,position')->orderBy('due_date')->get(),
        ];
    }

    /**
     * Hide the application's reminder for the rest of today, or until it's next updated, depending on the
     * owner's setting. Saved without touching updated_at, which the "until updated" rule compares against.
     */
    public function dismiss(JobApplication $job): void
    {
        $changes = $job->user->reminder_dismiss_mode === ReminderDismissMode::Permanent
            ? ['reminder_dismissed_at' => now()]
            : ['reminder_hidden_until' => now()->endOfDay()];

        $job->timestamps = false;
        $job->forceFill($changes)->saveQuietly();
    }
}
