<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Interview extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_application_id',
        'user_id',
        'interview_date',
        'type',
        'location',
        'notes'
    ];
    protected $casts = [
        'interview_date' => 'datetime',
    ];

    public function job()
    {
        return $this->belongsTo(JobApplication::class, 'job_application_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
