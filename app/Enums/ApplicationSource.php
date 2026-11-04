<?php

namespace App\Enums;

/**
 * Where the user found the job.
 */
enum ApplicationSource: string
{
    case LinkedIn = 'linkedin';
    case CompanyWebsite = 'company_website';
    case JobBoard = 'job_board';
    case Referral = 'referral';
    case Recruiter = 'recruiter';
    case Other = 'other';
}
