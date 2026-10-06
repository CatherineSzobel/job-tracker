<?php

namespace App\Enums;

use App\Enums\Concerns\HasValues;

/**
 * The fixed palette for tags, in the order new tags pick them.
 */
enum TagColor: string
{
    use HasValues;

    case Slate = 'slate';
    case Red = 'red';
    case Amber = 'amber';
    case Green = 'green';
    case Teal = 'teal';
    case Blue = 'blue';
    case Violet = 'violet';
    case Pink = 'pink';

    /**
     * The colour a new tag gets: the first one not used yet; once all are used, cycle through them by tag count.
     *
     * @param  list<string>  $usedColors  the colour values of the user's existing tags
     */
    public static function nextAfter(array $usedColors): self
    {
        foreach (self::cases() as $color) {
            if (! in_array($color->value, $usedColors, true)) {
                return $color;
            }
        }

        return self::cases()[count($usedColors) % count(self::cases())];
    }
}
