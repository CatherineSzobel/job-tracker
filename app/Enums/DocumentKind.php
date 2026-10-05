<?php

namespace App\Enums;

use App\Enums\Concerns\HasValues;

enum DocumentKind: string
{
    use HasValues;

    case File = 'file';
    case Link = 'link';
}
