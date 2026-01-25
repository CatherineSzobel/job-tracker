<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Note;

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
        'is_archived'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function notes()
    {
        return $this->hasMany(Note::class);
    }

    public function interviews()
    {
        return $this->hasMany(Interview::class);
    }
}
