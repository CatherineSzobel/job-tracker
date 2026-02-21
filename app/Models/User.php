<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Models\JobApplication;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable; // <-- HasApiTokens must be included

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function jobApplications()
    {
        return $this->hasMany(JobApplication::class);
    }

    public function profile()
    {
        return $this->hasOne(Profile::class);
    }

    public function todos()
    {
        return $this->hasMany(Todo::class);
    }
    public function notes()
    {
        return $this->hasMany(Note::class);
    }
}
