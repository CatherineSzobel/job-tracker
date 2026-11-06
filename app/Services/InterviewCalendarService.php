<?php

namespace App\Services;

use App\Models\Interview;
use Carbon\CarbonInterface;
use Illuminate\Support\Str;

/**
 * An interview as an iCalendar (.ics) file, for "Add to calendar": Google, Outlook and Apple Calendar all open it.
 */
class InterviewCalendarService
{
    /**
     * Interviews have no end time, so the event gets this long
     */
    private const DURATION_MINUTES = 60;

    /**
     * The whole file: one event with the time (UTC), "Phone interview: Developer at Acme", the place (or the
     * meeting link when there's no place), the link and the notes.
     */
    public function ics(Interview $interview): string
    {
        $interview->loadMissing('job');
        $start = $interview->interview_date;
        $type = $interview->type ? $interview->type->label().' interview' : 'Interview';
        $description = collect([
            $interview->meeting_url ? "Join: {$interview->meeting_url}" : null,
            $interview->notes,
        ])->filter()->implode("\n\n");

        $lines = array_filter([
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Job Tracker//Interviews//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'BEGIN:VEVENT',
            'UID:interview-'.$interview->id.'@'.(parse_url(config('app.url'), PHP_URL_HOST) ?: 'job-tracker'),
            'DTSTAMP:'.$this->time(now()),
            'DTSTART:'.$this->time($start),
            'DTEND:'.$this->time($start->copy()->addMinutes(self::DURATION_MINUTES)),
            'SUMMARY:'.$this->text("{$type}: {$interview->job->position} at {$interview->job->company_name}"),
            ($interview->location ?? $interview->meeting_url) ? 'LOCATION:'.$this->text($interview->location ?? $interview->meeting_url) : null,
            $interview->meeting_url ? 'URL:'.$interview->meeting_url : null,
            $description !== '' ? 'DESCRIPTION:'.$this->text($description) : null,
            'END:VEVENT',
            'END:VCALENDAR',
        ]);

        return implode("\r\n", array_map(fn (string $line) => $this->fold($line), $lines))."\r\n";
    }

    /**
     * A name for the download: "interview-acme-2026-10-20.ics"
     */
    public function filename(Interview $interview): string
    {
        $interview->loadMissing('job');

        return 'interview-'.Str::slug($interview->job->company_name).'-'.$interview->interview_date->format('Y-m-d').'.ics';
    }

    private function time(CarbonInterface $time): string
    {
        return $time->copy()->utc()->format('Ymd\THis\Z');
    }

    /**
     * Text values escape backslashes, semicolons, commas and line breaks (RFC 5545 §3.3.11)
     */
    private function text(string $value): string
    {
        return str_replace(['\\', ';', ',', "\r\n", "\n", "\r"], ['\\\\', '\;', '\,', '\n', '\n', '\n'], $value);
    }

    /**
     * Lines longer than 75 bytes continue on the next line after a space (RFC 5545 §3.1), without splitting a
     * multi-byte character
     */
    private function fold(string $line): string
    {
        $parts = [];
        while (strlen($line) > 75) {
            $part = mb_strcut($line, 0, 75, 'UTF-8');
            $parts[] = $part;
            $line = ' '.substr($line, strlen($part));
        }
        $parts[] = $line;

        return implode("\r\n", $parts);
    }
}
