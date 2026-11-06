<?php

namespace App\Models;

use App\Enums\ApplicationSource;
use App\Enums\Currency;
use App\Enums\JobStatus;
use App\Enums\Priority;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JobApplication extends Model
{
    /** @use HasFactory<\Database\Factories\JobApplicationFactory> */
    use HasFactory;

    /**
     * The columns other lists show about an application (interviews, to-dos, reminders), for eager loads
     * like 'job:'.JobApplication::SUMMARY_COLUMNS.
     */
    public const SUMMARY_COLUMNS = 'id,company_name,position';

    protected $fillable = [
        'user_id',
        'company_name',
        'position',
        'location',
        'status',
        'priority',
        'applied_date',
        'job_link',
        'notes',
        'is_archived',
        'salary_min',
        'salary_max',
        'salary_currency',
        'source',
        'contact_name',
        'contact_details',
        'deadline',
    ];

    /**
     * Mirrors the column default, so a newly created application's response shows it too.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'salary_currency' => 'EUR',
    ];

    protected function casts(): array
    {
        return [
            'status' => JobStatus::class,
            'priority' => Priority::class,
            'applied_date' => 'date:Y-m-d',
            'is_archived' => 'boolean',
            'archived_at' => 'datetime',
            'salary_min' => 'integer',
            'salary_max' => 'integer',
            'salary_currency' => Currency::class,
            'source' => ApplicationSource::class,
            'deadline' => 'date:Y-m-d',
            'reminder_hidden_until' => 'datetime',
            'reminder_dismissed_at' => 'datetime',
        ];
    }

    /**
     * The rules every save follows (single updates, batches, imports): a new one without an applied date is applied
     * today unless it's only Saved; moving on from Saved for the first time
     * makes today the applied date (not to Withdrawn or No response, which can mean it was never sent); archived_at follows is_archived (an archived one keeps the date it was first
     * archived); and each status change is recorded in the history.
     */
    protected static function booted(): void
    {
        static::saving(function (JobApplication $job) {
            // No status yet means the column default, Applied
            if (! $job->exists && $job->applied_date === null && $job->status !== JobStatus::Saved) {
                $job->applied_date = now()->toDateString();
            }
            $notSent = [JobStatus::Saved, JobStatus::Withdrawn, JobStatus::NoResponse];
            if ($job->isDirty('status') && $job->applied_date === null
                && in_array($job->getOriginal('status'), $notSent, true) && ! in_array($job->status, $notSent, true)) {
                $job->applied_date = now()->toDateString();
            }
            if ($job->isDirty('is_archived')) {
                $job->archived_at = $job->is_archived ? ($job->archived_at ?? now()) : null;
            }
        });

        static::updated(function (JobApplication $job) {
            if ($job->wasChanged('status')) {
                $job->statusChanges()->create([
                    'from_status' => $job->getOriginal('status'),
                    'to_status' => $job->status,
                    'changed_at' => now(),
                ]);
            }
        });
    }

    /**
     * Applied, active applications with no update for $days days that the user hasn't dismissed:
     * not hidden for today, and not dismissed since their last update (dismissing never moves updated_at).
     */
    public function scopeNeedsReminder(Builder $query, int $days): Builder
    {
        return $query
            ->where('status', JobStatus::Applied)
            ->where('is_archived', false)
            ->where('updated_at', '<=', now()->subDays($days))
            ->where(fn (Builder $hidden) => $hidden->whereNull('reminder_hidden_until')->orWhere('reminder_hidden_until', '<', now()))
            ->where(fn (Builder $dismissed) => $dismissed->whereNull('reminder_dismissed_at')->orWhereColumn('reminder_dismissed_at', '<', 'updated_at'));
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function interviews(): HasMany
    {
        return $this->hasMany(Interview::class);
    }

    public function todos(): HasMany
    {
        return $this->hasMany(Todo::class);
    }

    public function statusChanges(): HasMany
    {
        return $this->hasMany(StatusChange::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class)->orderBy('tags.name');
    }

    /**
     * For withCount()/loadCount(): the number of the application's to-dos that aren't done, as open_todos_count.
     *
     * @return array<string, \Closure(Builder): Builder>
     */
    public static function openTodosCount(): array
    {
        return ['todos as open_todos_count' => fn (Builder $query) => $query->where('done', false)];
    }

    public function documents(): BelongsToMany
    {
        return $this->belongsToMany(Document::class)->withPivot('attached_at');
    }
}
