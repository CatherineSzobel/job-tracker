<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\JobApplication */
class JobApplicationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'company_name' => $this->company_name,
            'position' => $this->position,
            'location' => $this->location,
            'status' => $this->status,
            'priority' => $this->priority,
            'applied_date' => $this->applied_date?->format('Y-m-d'),
            'job_link' => $this->job_link,
            'notes' => $this->notes,
            'is_archived' => (bool) $this->is_archived,
            'interviews' => InterviewResource::collection($this->whenLoaded('interviews')),
            'documents' => DocumentResource::collection($this->whenLoaded('documents')),
        ];
    }
}
