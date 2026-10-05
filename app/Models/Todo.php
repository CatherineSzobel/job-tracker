<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Todo extends Model
{
    /** @use HasFactory<\Database\Factories\TodoFactory> */
    use HasFactory;

    protected $fillable = ['user_id', 'job_application_id', 'text', 'done', 'due_date'];

    protected function casts(): array
    {
        return [
            'done' => 'boolean',
            'due_date' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function jobApplication(): BelongsTo
    {
        return $this->belongsTo(JobApplication::class);
    }

    /**
     * Open to-dos due today or earlier, unless they belong to an archived application.
     */
    public function scopeDueForReminder(Builder $query): Builder
    {
        return $query
            ->where('done', false)
            // whereDate, not a plain comparison: the date cast stores "Y-m-d 00:00:00" on SQLite
            ->whereDate('due_date', '<=', today())
            ->where(fn (Builder $linked) => $linked
                ->whereNull('job_application_id')
                ->orWhereHas('jobApplication', fn (Builder $job) => $job->where('is_archived', false)));
    }
}
