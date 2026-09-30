<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * The user's account preferences (the Reminders feature adds its settings here).
 *
 * @mixin \App\Models\User
 */
class SettingsResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'archive_todos' => $this->archive_todos,
        ];
    }
}
