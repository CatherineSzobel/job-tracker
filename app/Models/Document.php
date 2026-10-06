<?php

namespace App\Models;

use App\Enums\DocumentCategory;
use App\Enums\DocumentKind;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * An uploaded file or a link in a user's library. The file/URL itself never changes
 * after creation; a new version is a new document.
 */
class Document extends Model
{
    /** @use HasFactory<\Database\Factories\DocumentFactory> */
    use HasFactory;

    /**
     * How many documents (archived included: they still take up storage) the shared demo account may keep.
     */
    public const DEMO_LIMIT = 10;

    protected $fillable = [
        'kind',
        'category',
        'name',
        'url',
        'path',
        'original_filename',
        'mime_type',
        'size',
        'archived_at',
    ];

    protected function casts(): array
    {
        return [
            'kind' => DocumentKind::class,
            'category' => DocumentCategory::class,
            'size' => 'integer',
            'archived_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function jobApplications(): BelongsToMany
    {
        return $this->belongsToMany(JobApplication::class)->withPivot('attached_at');
    }
}
