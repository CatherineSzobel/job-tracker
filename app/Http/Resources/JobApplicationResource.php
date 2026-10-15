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
            'salary_min' => $this->salary_min,
            'salary_max' => $this->salary_max,
            'salary_currency' => $this->salary_currency,
            'source' => $this->source,
            'contact_name' => $this->contact_name,
            'contact_details' => $this->contact_details,
            'deadline' => $this->deadline?->format('Y-m-d'),
            'is_archived' => (bool) $this->is_archived,
            'archived_at' => $this->archived_at,
            // "Last update" on the detail page
            'updated_at' => $this->updated_at,
            'interviews' => InterviewResource::collection($this->whenLoaded('interviews')),
            'open_todos_count' => $this->whenCounted('open_todos'),
            'tags' => TagResource::collection($this->whenLoaded('tags')),
            'documents' => DocumentResource::collection($this->whenLoaded('documents')),
        ];
    }
}
