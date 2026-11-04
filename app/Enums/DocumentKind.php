<?php

namespace App\Enums;

enum DocumentKind: string
{
    case File = 'file';
    case Link = 'link';
}
