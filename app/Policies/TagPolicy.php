<?php

namespace App\Policies;

use App\Models\Tag;
use App\Models\User;
use App\Policies\Concerns\ChecksOwnership;
use Illuminate\Auth\Access\Response;

class TagPolicy
{
    use ChecksOwnership;

    public function update(User $user, Tag $tag): Response
    {
        return $this->owns($user, $tag->user_id);
    }

    public function delete(User $user, Tag $tag): Response
    {
        return $this->owns($user, $tag->user_id);
    }
}
