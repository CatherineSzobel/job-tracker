<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\BankQuestion */
class BankQuestionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'question' => $this->question,
            'answer' => $this->answer,
            'category' => $this->category,
            'interviews_count' => $this->whenCounted('interviews'),
            // When listed on an interview: that interview's note
            'note' => $this->whenPivotLoaded('bank_question_interview', fn () => $this->pivot->note),
        ];
    }
}
