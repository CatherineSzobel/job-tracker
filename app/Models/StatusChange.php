<?php

namespace App\Models;

use App\Enums\JobStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * An application's status going from one value to another, for its activity timeline. Recorded by
 * JobApplication whenever it's saved with a new status.
 */
class StatusChange extends Model
{
    // changed_at is the only time it needs
    public $timestamps = false;

    protected $fillable = ['job_application_id', 'from_status', 'to_status', 'changed_at'];

    protected function casts(): array
    {
        return [
            'from_status' => JobStatus::class,
            'to_status' => JobStatus::class,
            'changed_at' => 'datetime',
        ];
    }

    public function jobApplication(): BelongsTo
    {
        return $this->belongsTo(JobApplication::class);
    }
}
