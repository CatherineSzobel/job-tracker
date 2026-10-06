<?php

namespace App\Models;

use App\Enums\JobStatus;
use App\Enums\Priority;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JobApplication extends Model
{
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
    ];

    protected function casts(): array
    {
        return [
            'status' => JobStatus::class,
            'priority' => Priority::class,
            'applied_date' => 'date:Y-m-d',
            'is_archived' => 'boolean',
            'reminder_hidden_until' => 'datetime',
            'reminder_dismissed_at' => 'datetime',
        ];
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
