<?php

namespace App\Enums;

use App\Enums\Concerns\HasValues;

/**
 * What a reminder's Dismiss button does: hide it until tomorrow, or until the application is next updated.
 */
enum ReminderDismissMode: string
{
    use HasValues;

    case Today = 'today';
    case Permanent = 'permanent';
}
