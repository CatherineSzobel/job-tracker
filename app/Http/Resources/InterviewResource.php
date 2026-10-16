<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Interview */
class InterviewResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $checklist = $this->prep['checklist'];

        return [
            'id' => $this->id,
            'job_application_id' => $this->job_application_id,
            'interview_date' => $this->interview_date,
            'type' => $this->type,
            'location' => $this->location,
            // The video call link, for the Join button
            'meeting_url' => $this->meeting_url,
            'notes' => $this->notes,
            // The debrief's 1–5 stars, shown on past interview cards
            'rating' => $this->rating,
            // For the "Prep 3/7" chip on interview cards; lists don't carry the prep document itself
            'prep_progress' => [
                'done' => count(array_filter($checklist, fn (array $item) => (bool) $item['done'])),
                'total' => count($checklist),
            ],
            // Only the fields the interview lists show, loaded as job:id,company_name,position
            'job' => $this->whenLoaded('job', fn () => [
                'id' => $this->job->id,
                'company_name' => $this->job->company_name,
                'position' => $this->job->position,
            ]),
        ];
    }
}
