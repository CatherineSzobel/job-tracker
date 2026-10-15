<?php

namespace App\Enums;

use App\Enums\Concerns\HasValues;

/**
 * Where the user found the job.
 */
enum ApplicationSource: string
{
    use HasValues;

    case LinkedIn = 'linkedin';
    case CompanyWebsite = 'company_website';
    case JobBoard = 'job_board';
    case Referral = 'referral';
    case Recruiter = 'recruiter';
    case Other = 'other';
}
