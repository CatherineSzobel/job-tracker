<?php

namespace App\Enums;

enum InterviewType: string
{
    case Phone = 'phone';
    case Online = 'online';
    case Onsite = 'onsite';

    /**
     * As the app shows it (INTERVIEW_TYPES in the frontend), e.g. in calendar invites
     */
    public function label(): string
    {
        return match ($this) {
            self::Phone => 'Phone',
            self::Online => 'Online',
            self::Onsite => 'On-site',
        };
    }
}
