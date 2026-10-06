<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\User */
class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'daily_goal' => $this->daily_goal,
            'weekly_goal' => $this->weekly_goal,
            // The shared demo login: the frontend hides what it can't change (email, password, deletion)
            'is_demo' => $this->isDemo(),
        ];
    }
}
