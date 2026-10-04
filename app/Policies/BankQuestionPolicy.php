<?php

namespace App\Policies;

use App\Models\BankQuestion;
use App\Models\User;
use App\Policies\Concerns\ChecksOwnership;
use Illuminate\Auth\Access\Response;

class BankQuestionPolicy
{
    use ChecksOwnership;

    public function update(User $user, BankQuestion $bankQuestion): Response
    {
        return $this->owns($user, $bankQuestion->user_id);
    }

    public function delete(User $user, BankQuestion $bankQuestion): Response
    {
        return $this->owns($user, $bankQuestion->user_id);
    }
}
