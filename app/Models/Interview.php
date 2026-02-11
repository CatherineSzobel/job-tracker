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
        'interview_date' => 'date',
    ];

    public function jobApplication()
    {
        return $this->belongsTo(JobApplication::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
