<?php

namespace App\Enums;

use App\Enums\Concerns\HasValues;

enum DocumentCategory: string
{
    use HasValues;

    case Cv = 'cv';
    case CoverLetter = 'cover_letter';
    case Portfolio = 'portfolio';
    case Certificate = 'certificate';
    case LinkedIn = 'linkedin';
    case GitHub = 'github';
    case Website = 'website';
    case Other = 'other';

    /**
     * Best guess for a free-text profile link label, e.g. "my GitHub" → GitHub.
     */
    public static function fromLabel(string $label): self
    {
        $label = strtolower($label);

        return match (true) {
            str_contains($label, 'linkedin') => self::LinkedIn,
            str_contains($label, 'github') => self::GitHub,
            str_contains($label, 'portfolio') => self::Portfolio,
            default => self::Website,
        };
    }
}
