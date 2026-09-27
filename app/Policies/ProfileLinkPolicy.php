<?php

namespace App\Policies;

use App\Models\ProfileLink;
use App\Models\User;
use App\Policies\Concerns\ChecksOwnership;
use Illuminate\Auth\Access\Response;

class ProfileLinkPolicy
{
    use ChecksOwnership;

    // Links belong to a profile, which belongs to the user
    public function update(User $user, ProfileLink $link): Response
    {
        return $this->owns($user, $link->profile->user_id);
    }

    public function delete(User $user, ProfileLink $link): Response
    {
        return $this->owns($user, $link->profile->user_id);
    }
}
