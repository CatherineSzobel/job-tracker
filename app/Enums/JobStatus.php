<?php

namespace App\Enums;

/**
 * Where an application stands: in pipeline order, then the ways it can end without an offer.
 * Users set every status themselves; nothing changes one automatically.
 */
enum JobStatus: string
{
    // Not applied yet, so no applied date until it moves on (see JobApplication::booted())
    case Saved = 'saved';
    case Applied = 'applied';
    case Interview = 'interview';
    case Offer = 'offer';
    case Rejected = 'rejected';
    case NoResponse = 'no_response';
    case Withdrawn = 'withdrawn';
}
