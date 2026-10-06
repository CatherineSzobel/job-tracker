<?php

namespace App\Models;

use App\Enums\BankQuestionCategory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * A question in the user's question bank with their prepared answer, linkable to interviews.
 */
class BankQuestion extends Model
{
    /** @use HasFactory<\Database\Factories\BankQuestionFactory> */
    use HasFactory;

    protected $fillable = ['question', 'answer', 'category'];

    protected function casts(): array
    {
        return [
            'category' => BankQuestionCategory::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function interviews(): BelongsToMany
    {
        return $this->belongsToMany(Interview::class)->withPivot('note', 'position');
    }
}
