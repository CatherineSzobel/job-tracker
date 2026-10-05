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
}
