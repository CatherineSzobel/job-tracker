<?php

// app/Models/Link.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProfileLink extends Model
{
    use HasFactory;

    protected $fillable = ['label', 'url'];

    public function profile() {
        return $this->belongsTo(Profile::class);
    }
}
