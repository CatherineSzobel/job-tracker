<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

/** @mixin \App\Models\Document */
class DocumentResource extends JsonResource
{
    /**
     * The storage path is never exposed: files are only reachable through the download route.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'kind' => $this->kind,
            'category' => $this->category,
            'name' => $this->name,
            'url' => $this->url,
            'original_filename' => $this->original_filename,
            'mime_type' => $this->mime_type,
            'size' => $this->size,
            'archived_at' => $this->archived_at,
            'created_at' => $this->created_at,
            'applications_count' => $this->whenCounted('jobApplications'),
            'attached_at' => $this->whenPivotLoaded('document_job_application', fn () => Carbon::parse($this->pivot->attached_at)),
        ];
    }
}
