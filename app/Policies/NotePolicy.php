<?php

namespace App\Policies;

use App\Models\Note;
use App\Models\User;
use App\Policies\Concerns\ChecksOwnership;
use Illuminate\Auth\Access\Response;

class NotePolicy
{
    use ChecksOwnership;

    public function update(User $user, Note $note): Response
    {
        return $this->owns($user, $note->user_id);
    }

    public function delete(User $user, Note $note): Response
    {
        return $this->owns($user, $note->user_id);
    }
}
