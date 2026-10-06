<?php

namespace App\Services;

use App\Enums\InterviewType;
use App\Models\Interview;
use App\Models\User;

/**
 * The interview prep checklist template: the built-in default, the user's own copy, and the
 * checklist a new interview of a given type starts with.
 */
class InterviewPrepService
{
    /**
     * The user's own template, or the built-in default (Interview::DEFAULT_PREP_TEMPLATE).
     *
     * @return list<array{text: string, type: ?string}>
     */
    public function templateFor(User $user): array
    {
        return $user->prep_template ?? Interview::DEFAULT_PREP_TEMPLATE;
    }

    /**
     * @return list<array{text: string, done: bool}>
     */
    public function checklistFor(User $user, InterviewType $type): array
    {
        return collect($this->templateFor($user))
            ->filter(fn (array $item) => $item['type'] === null || $item['type'] === $type->value)
            ->map(fn (array $item) => ['text' => $item['text'], 'done' => false])
            ->values()
            ->all();
    }
}
