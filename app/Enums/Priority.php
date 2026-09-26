<?php

namespace App\Enums;

use App\Enums\Concerns\HasValues;

enum Priority: string
{
    use HasValues;

    case Low = 'low';
    case Medium = 'medium';
    case High = 'high';
}
