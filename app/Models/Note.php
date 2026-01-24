<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Note extends Model
{
     use HasFactory;

    protected $fillable = [
        'job_application_id',
        'user_id',
        'content'
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
