<?php

namespace App\Http\Requests\JobApplication;

use App\Enums\JobStatus;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class SaveJobApplicationChangesRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * One entry per application. Tag ids have no `distinct` rule: with nested wildcards it would compare
     * across entries and refuse the same tag added to two applications.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $usersTag = Rule::exists('tags', 'id')->where('user_id', $this->user()->id);

        return [
            'changes' => ['required', 'array', 'min:1', 'max:200'],
            'changes.*' => ['array'],
            'changes.*.id' => ['required', 'integer', 'distinct'],
            'changes.*.status' => ['sometimes', Rule::enum(JobStatus::class)],
            'changes.*.add_tag_ids' => ['sometimes', 'array'],
            'changes.*.add_tag_ids.*' => ['integer', $usersTag],
            'changes.*.remove_tag_ids' => ['sometimes', 'array'],
            'changes.*.remove_tag_ids.*' => ['integer', $usersTag],
        ];
    }

    /**
     * Each entry changes something, and no entry both adds and removes a tag.
     *
     * @return array<int, Closure(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                foreach ((array) $this->input('changes', []) as $index => $change) {
                    if (! is_array($change)) {
                        continue;
                    }

                    $hasChange = array_key_exists('status', $change)
                        || filled($change['add_tag_ids'] ?? null)
                        || filled($change['remove_tag_ids'] ?? null);

                    if (! $hasChange) {
                        $validator->errors()->add("changes.{$index}", 'Choose at least one change for this application.');
                    }

                    // Only compare well-formed id lists: array_intersect on nested arrays would throw (500)
                    $tagIdsAreValid = ! $validator->errors()->hasAny([
                        "changes.{$index}.add_tag_ids", "changes.{$index}.add_tag_ids.*",
                        "changes.{$index}.remove_tag_ids", "changes.{$index}.remove_tag_ids.*",
                    ]);
                    if ($tagIdsAreValid && array_intersect((array) ($change['add_tag_ids'] ?? []), (array) ($change['remove_tag_ids'] ?? [])) !== []) {
                        $validator->errors()->add("changes.{$index}.remove_tag_ids", 'A tag cannot be added and removed at the same time.');
                    }
                }
            },
        ];
    }
}
