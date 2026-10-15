<?php

namespace App\Services;

use App\Enums\JobStatus;
use App\Models\Document;
use App\Models\Interview;
use App\Models\JobApplication;
use App\Models\StatusChange;
use App\Models\Todo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * An application's activity timeline, built from what's already stored: when it was saved or applied for,
 * its status changes, past interviews, completed to-dos, documents sent and when it was archived.
 */
class ApplicationActivityService
{
    /**
     * Newest first. Each event has a type and when it happened (at), plus:
     * status: from, to; interview: interview_id, interview_type; todo_done: text; document_sent: document_name.
     * "applied" is a date (Y-m-d), the rest are timestamps.
     *
     * @return list<array<string, mixed>>
     */
    public function timeline(JobApplication $job): array
    {
        $job->loadMissing(['statusChanges', 'interviews', 'documents']);

        $statusChanges = $job->statusChanges->sortBy('changed_at');
        $leftSaved = $statusChanges->first(fn (StatusChange $change) => $change->from_status === JobStatus::Saved);

        $events = collect()
            ->when($job->status === JobStatus::Saved || $leftSaved !== null, fn (Collection $events) => $events->push(['type' => 'saved', 'at' => $job->created_at]))
            // Leaving Saved already shows as a status change, which is when it was applied for
            ->when($job->applied_date !== null && $leftSaved === null, fn (Collection $events) => $events->push(['type' => 'applied', 'at' => $job->applied_date]))
            ->concat($statusChanges->map(fn (StatusChange $change) => [
                'type' => 'status',
                'at' => $change->changed_at,
                'from' => $change->from_status,
                'to' => $change->to_status,
            ]))
            ->concat($job->interviews->filter(fn (Interview $interview) => $interview->interview_date->isPast())->map(fn (Interview $interview) => [
                'type' => 'interview',
                'at' => $interview->interview_date,
                'interview_id' => $interview->id,
                'interview_type' => $interview->type,
            ]))
            ->concat($job->todos()->whereNotNull('completed_at')->get(['text', 'completed_at'])->map(fn (Todo $todo) => [
                'type' => 'todo_done',
                'at' => $todo->completed_at,
                'text' => $todo->text,
            ]))
            ->concat($job->documents->map(fn (Document $document) => [
                'type' => 'document_sent',
                'at' => Carbon::parse($document->pivot->attached_at),
                'document_name' => $document->name,
            ]))
            ->when($job->archived_at !== null, fn (Collection $events) => $events->push(['type' => 'archived', 'at' => $job->archived_at]));

        return $events
            ->sortByDesc(fn (array $event) => $event['at']->getTimestamp())
            ->map(fn (array $event) => [
                ...$event,
                // The applied date has no time of day, so it goes out as a plain date
                'at' => $event['type'] === 'applied' ? $event['at']->format('Y-m-d') : $event['at'],
            ])
            ->values()
            ->all();
    }
}
