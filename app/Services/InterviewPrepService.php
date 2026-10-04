<?php

namespace App\Services;

use App\Enums\InterviewType;
use App\Models\User;

/**
 * The interview prep checklist template: the built-in default, the user's own copy, and the
 * checklist a new interview of a given type starts with.
 */
class InterviewPrepService
{
    /**
     * Items with type null apply to every interview; the others only to that type.
     *
     * @return list<array{text: string, type: ?string}>
     */
    public function defaultTemplate(): array
    {
        return [
            ['text' => 'Research the company', 'type' => null],
            ['text' => 'Re-read the job ad', 'type' => null],
            ['text' => 'Prepare answers to likely questions', 'type' => null],
            ['text' => 'Prepare questions to ask', 'type' => null],
            ['text' => 'Have CV and job ad to hand', 'type' => null],
            ['text' => 'Test camera, mic and the video link', 'type' => InterviewType::Online->value],
            ['text' => 'Plan route and arrival time', 'type' => InterviewType::Onsite->value],
            ['text' => 'Find a quiet spot and charge phone', 'type' => InterviewType::Phone->value],
        ];
    }

    /**
     * @return list<array{text: string, type: ?string}>
     */
    public function templateFor(User $user): array
    {
        return $user->prep_template ?? $this->defaultTemplate();
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
