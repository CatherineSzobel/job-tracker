<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
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
}
