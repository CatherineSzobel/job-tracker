<?php

namespace App\Policies;

use App\Models\Todo;
use App\Models\User;
use App\Policies\Concerns\ChecksOwnership;
use Illuminate\Auth\Access\Response;

class TodoPolicy
{
    use ChecksOwnership;

    public function update(User $user, Todo $todo): Response
    {
        return $this->owns($user, $todo->user_id);
    }

    public function delete(User $user, Todo $todo): Response
    {
        return $this->owns($user, $todo->user_id);
    }
}
