<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

/**
 * One interview for its prep page: the list fields plus the prep document, debrief notes
 * and (when loaded) the linked bank questions, each with the bank's current answer and this interview's note.
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
            'debrief_notes' => $this->debrief_notes,
            'bank_questions' => BankQuestionResource::collection($this->whenLoaded('bankQuestions')),
        ];
    }
}
