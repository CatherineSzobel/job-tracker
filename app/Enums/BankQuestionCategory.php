<?php

namespace App\Enums;

use App\Enums\Concerns\HasValues;

/**
 * Groups for the question bank.
 */
enum BankQuestionCategory: string
{
    use HasValues;

    case AboutMe = 'about_me';
    case Behavioural = 'behavioural';
    case Technical = 'technical';
    case Motivation = 'motivation';
    case Other = 'other';
}
