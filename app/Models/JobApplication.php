<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
    protected $casts = [
        'applied_date' => 'date:Y-m-d',
        'is_archived' => 'boolean',
    ];
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function interviews()
    {
        return $this->hasMany(Interview::class);
    }
}
