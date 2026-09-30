<?php

namespace App\Models;

use App\Enums\ArchiveTodosAction;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'daily_goal',
        'weekly_goal',
        'archive_todos',
    ];

    /**
     * Same defaults as the columns, so a just-created user already has them.
     *
     * @var array<string, int|string>
     */
    protected $attributes = [
        'daily_goal' => 5,
        'weekly_goal' => 20,
        'archive_todos' => 'ask',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'daily_goal' => 'integer',
            'weekly_goal' => 'integer',
            'archive_todos' => ArchiveTodosAction::class,
        ];
    }

    public function isDemo(): bool
    {
        return $this->email === config('app.demo_email');
    }

    public function jobApplications(): HasMany
    {
        return $this->hasMany(JobApplication::class);
    }

    public function profile(): HasOne
    {
        return $this->hasOne(Profile::class);
    }

    public function todos(): HasMany
    {
        return $this->hasMany(Todo::class);
    }

    public function notes(): HasMany
    {
        return $this->hasMany(Note::class);
    }
}
