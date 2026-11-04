<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Todo */
class TodoResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'text' => $this->text,
            'done' => (bool) $this->done, // unset on a just-created todo; the column defaults to false
            'due_date' => $this->due_date?->format('Y-m-d'),
            'job_application' => $this->relationLoaded('jobApplication') && $this->jobApplication
                ? [
                    'id' => $this->jobApplication->id,
                    'company_name' => $this->jobApplication->company_name,
                    'position' => $this->jobApplication->position,
                ]
                : null,
            'created_at' => $this->created_at,
        ];
    }
}
