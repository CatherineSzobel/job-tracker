<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

/**
 * An application in the reminders list: the usual fields plus how long it's been without an update
 * (the reminder card's "No update for N days").
 *
 * @mixin \App\Models\JobApplication
 */
class ReminderApplicationResource extends JobApplicationResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            ...parent::toArray($request),
            'days_since_update' => (int) $this->updated_at->diffInDays(now()),
        ];
    }
}
