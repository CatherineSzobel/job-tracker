<?php

namespace App\Models;

use App\Enums\InterviewType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Interview extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_application_id',
        'user_id',
        'interview_date',
        'type',
        'location',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'interview_date' => 'datetime',
            'type' => InterviewType::class,
        ];
    }

    public function job(): BelongsTo
    {
        return $this->belongsTo(JobApplication::class, 'job_application_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
