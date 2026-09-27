<?php

namespace App\Policies;

use App\Models\JobApplication;
use App\Models\User;
use App\Policies\Concerns\ChecksOwnership;
use Illuminate\Auth\Access\Response;

class JobApplicationPolicy
{
    use ChecksOwnership;

    public function view(User $user, JobApplication $jobApplication): Response
    {
        return $this->owns($user, $jobApplication->user_id);
    }

    public function update(User $user, JobApplication $jobApplication): Response
    {
        return $this->owns($user, $jobApplication->user_id);
    }

    public function delete(User $user, JobApplication $jobApplication): Response
    {
        return $this->owns($user, $jobApplication->user_id);
    }
}
