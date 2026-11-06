<?php

namespace App\Enums;

/**
 * Groups for the question bank.
 */
enum BankQuestionCategory: string
{
    case AboutMe = 'about_me';
    case Behavioural = 'behavioural';
    case Technical = 'technical';
    case Motivation = 'motivation';
    case Other = 'other';
}
