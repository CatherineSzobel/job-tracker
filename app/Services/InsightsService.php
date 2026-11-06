<?php

namespace App\Services;

use App\Enums\ApplicationSource;
use App\Enums\JobStatus;
use App\Models\JobApplication;
use App\Models\StatusChange;
use App\Models\User;
use Illuminate\Support\Collection;

/**
 * How the user's job search is going, over all their applications (archived ones too):
 * response rate, interview → offer rate, average days to a first reply and applications by source.
 */
class InsightsService
{
    /**
     * Statuses that mean the company answered
     */
    private const REPLY_STATUSES = [JobStatus::Interview, JobStatus::Offer, JobStatus::Rejected];

    /**
     * Rates are whole percentages, null when there's nothing to divide by; the average is in days (one
     * decimal), null until a reply has been recorded in the status history.
     *
     * @return array{applied: int, responded: int, response_rate: int|null, interviewed: int, offers: int, offer_rate: int|null, average_days_to_reply: float|null, timed_replies: int, by_source: list<array{source: string|null, count: int}>}
     */
    public function forUser(User $user): array
    {
        $jobs = $user->jobApplications()
            ->with(['statusChanges' => fn ($query) => $query->orderBy('changed_at')])
            ->withExists('interviews')
            ->get(['id', 'status', 'applied_date', 'source']);

        // Saved ones aren't applied for yet
        $applied = $jobs->whereNotNull('applied_date');
        $responded = $applied->filter(fn (JobApplication $job) => $job->interviews_exists || $this->reachedAny($job, self::REPLY_STATUSES));
        $interviewed = $jobs->filter(fn (JobApplication $job) => $job->interviews_exists || $this->reachedAny($job, [JobStatus::Interview, JobStatus::Offer]));
        $offers = $interviewed->filter(fn (JobApplication $job) => $this->reachedAny($job, [JobStatus::Offer]));
        $daysToReply = $applied->map(fn (JobApplication $job) => $this->daysToFirstReply($job))->filter(fn (?int $days) => $days !== null);

        return [
            'applied' => $applied->count(),
            'responded' => $responded->count(),
            'response_rate' => $this->percentage($responded->count(), $applied->count()),
            'interviewed' => $interviewed->count(),
            'offers' => $offers->count(),
            'offer_rate' => $this->percentage($offers->count(), $interviewed->count()),
            'average_days_to_reply' => $daysToReply->isEmpty() ? null : round($daysToReply->avg(), 1),
            'timed_replies' => $daysToReply->count(),
            'by_source' => $this->bySource($jobs),
        ];
    }

    /**
     * Whether the application is in, or was ever moved to, one of these statuses
     *
     * @param  list<JobStatus>  $statuses
     */
    private function reachedAny(JobApplication $job, array $statuses): bool
    {
        return in_array($job->status, $statuses, true)
            || $job->statusChanges->contains(fn (StatusChange $change) => in_array($change->to_status, $statuses, true));
    }

    /**
     * Whole days from applying to the first recorded change to a reply status, or null when none is recorded
     */
    private function daysToFirstReply(JobApplication $job): ?int
    {
        $firstReply = $job->statusChanges->first(fn (StatusChange $change) => in_array($change->to_status, self::REPLY_STATUSES, true));

        return $firstReply ? (int) max(0, $job->applied_date->diffInDays($firstReply->changed_at)) : null;
    }

    /**
     * One entry per source with applications, in the list's order, then those without a source
     *
     * @param  Collection<int, JobApplication>  $jobs
     * @return list<array{source: string|null, count: int}>
     */
    private function bySource(Collection $jobs): array
    {
        $counts = $jobs->countBy(fn (JobApplication $job) => $job->source?->value ?? '');

        return collect(ApplicationSource::cases())
            ->map(fn (ApplicationSource $source) => ['source' => $source->value, 'count' => $counts[$source->value] ?? 0])
            ->push(['source' => null, 'count' => $counts[''] ?? 0])
            ->filter(fn (array $entry) => $entry['count'] > 0)
            ->values()
            ->all();
    }

    private function percentage(int $part, int $whole): ?int
    {
        return $whole === 0 ? null : (int) round($part / $whole * 100);
    }
}
