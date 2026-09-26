<?php

namespace App\Enums;

use App\Enums\Concerns\HasValues;

enum InterviewType: string
{
    use HasValues;

    case Phone = 'phone';
    case Online = 'online';
    case Onsite = 'onsite';
}
