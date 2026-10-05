<?php

namespace App\Policies;

use App\Models\Document;
use App\Models\User;
use App\Policies\Concerns\ChecksOwnership;
use Illuminate\Auth\Access\Response;

class DocumentPolicy
{
    use ChecksOwnership;

    public function view(User $user, Document $document): Response
    {
        return $this->owns($user, $document->user_id);
    }

    public function update(User $user, Document $document): Response
    {
        return $this->owns($user, $document->user_id);
    }

    public function delete(User $user, Document $document): Response
    {
        return $this->owns($user, $document->user_id);
    }

    public function restore(User $user, Document $document): Response
    {
        return $this->owns($user, $document->user_id);
    }
}
