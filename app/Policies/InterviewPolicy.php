<?php

namespace App\Policies;

use App\Models\Interview;
use App\Models\User;
use App\Policies\Concerns\ChecksOwnership;
use Illuminate\Auth\Access\Response;

class InterviewPolicy
{
    use ChecksOwnership;

    public function view(User $user, Interview $interview): Response
    {
        return $this->owns($user, $interview->user_id);
    }

    public function update(User $user, Interview $interview): Response
    {
        return $this->owns($user, $interview->user_id);
    }

    public function delete(User $user, Interview $interview): Response
    {
        return $this->owns($user, $interview->user_id);
    }
}
