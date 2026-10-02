<?php

namespace App\Notifications;

use App\Models\JobApplication;
use App\Models\Todo;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Collection;

/**
 * The daily reminders email: applications with no recent update and to-dos that are due.
 * Sections without items are left out.
 */
class RemindersDigest extends Notification
{
    use Queueable;

    /**
     * @param  Collection<int, JobApplication>  $applications
     * @param  Collection<int, Todo>  $todos  with jobApplication loaded
     */
    public function __construct(public Collection $applications, public Collection $todos) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject('Your job search reminders')
            ->greeting("Hi {$notifiable->name},");

        if ($this->applications->isNotEmpty()) {
            $mail->line('**Time to follow up:**');
            foreach ($this->applications as $job) {
                $days = (int) $job->updated_at->diffInDays(now());
                $mail->line("- {$job->company_name} ({$job->position}): no update for {$days} days");
            }
        }

        if ($this->todos->isNotEmpty()) {
            $mail->line('**To-dos due:**');
            foreach ($this->todos as $todo) {
                $company = $todo->jobApplication ? " ({$todo->jobApplication->company_name})" : '';
                $mail->line("- {$todo->text}{$company}, due {$todo->due_date->format('D j M')}");
            }
        }

        return $mail
            ->action('Open Job Tracker', config('app.frontend_url'))
            ->line('You get this because email reminders are on. Turn them off in Settings.');
    }
}
