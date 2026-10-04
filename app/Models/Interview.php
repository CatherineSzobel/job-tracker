<?php

namespace App\Models;

use App\Enums\InterviewType;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Interview extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_application_id',
        'user_id',
        'interview_date',
        'type',
        'location',
        'notes',
        'prep',
        'rating',
        'debrief_notes',
    ];

    /**
     * Every list of the prep document. An interview without prep (e.g. from before this feature) has them all empty.
     *
     * @var array{checklist: list<array{text: string, done: bool}>, people: list<array{name: string, role: ?string, url: ?string}>, questions_to_ask: list<string>, questions_asked: list<string>}
     */
    public const EMPTY_PREP = [
        'checklist' => [],
        'people' => [],
        'questions_to_ask' => [],
        'questions_asked' => [],
    ];

    protected function casts(): array
    {
        return [
            'interview_date' => 'datetime',
            'type' => InterviewType::class,
            'rating' => 'integer',
        ];
    }

    /**
     * The prep document, always with every list of EMPTY_PREP.
     */
    protected function prep(): Attribute
    {
        return Attribute::make(
            get: fn (?string $value) => [...self::EMPTY_PREP, ...($value === null ? [] : json_decode($value, true))],
            set: fn (array $value) => json_encode($value),
        );
    }

    public function job(): BelongsTo
    {
        return $this->belongsTo(JobApplication::class, 'job_application_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Linked bank questions in the order the interview page shows them, each with a per-interview note.
     */
    public function bankQuestions(): BelongsToMany
    {
        return $this->belongsToMany(BankQuestion::class)->withPivot('note', 'position')->orderByPivot('position');
    }
}
