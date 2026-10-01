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
        ];
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
}
