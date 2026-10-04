<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

/**
 * One interview for its prep page: the list fields plus the prep document, rating and debrief notes.
 *
 * @mixin \App\Models\Interview
 */
class InterviewDetailResource extends InterviewResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            ...parent::toArray($request),
            'prep' => $this->prep,
            'rating' => $this->rating,
            'debrief_notes' => $this->debrief_notes,
        ];
    }
}
