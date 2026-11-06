<?php

namespace App\Enums;

/**
 * What a reminder's Dismiss button does: hide it until tomorrow, or until the application is next updated.
 */
enum ReminderDismissMode: string
{
    case Today = 'today';
    case Permanent = 'permanent';
}
