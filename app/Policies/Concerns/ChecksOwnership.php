<?php

namespace App\Policies\Concerns;

use App\Models\User;
use Illuminate\Auth\Access\Response;

trait ChecksOwnership
{
    /**
     * Someone else's record answers 404 rather than 403, so IDs can't be probed.
     */
    protected function owns(User $user, ?int $ownerId): Response
    {
        return $user->id === $ownerId
            ? Response::allow()
            : Response::denyAsNotFound();
    }
}
