<?php

namespace App\Enums;

use App\Enums\Concerns\HasValues;

enum JobStatus: string
{
    use HasValues;

    case Applied = 'applied';
    case Interview = 'interview';
    case Offer = 'offer';
    case Rejected = 'rejected';
}
