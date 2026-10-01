<?php

namespace App\Http\Requests\JobApplication;

use App\Enums\JobStatus;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class BatchUpdateJobApplicationsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $usersTag = Rule::exists('tags', 'id')->where('user_id', $this->user()->id);

        return [
            'ids' => ['required', 'array', 'min:1', 'max:200'],
            'ids.*' => ['integer', 'distinct'],
            'status' => ['sometimes', Rule::enum(JobStatus::class)],
            'is_archived' => ['sometimes', 'boolean'],
            'add_tag_ids' => ['sometimes', 'array'],
            'add_tag_ids.*' => ['integer', 'distinct', $usersTag],
            'remove_tag_ids' => ['sometimes', 'array'],
            'remove_tag_ids.*' => ['integer', 'distinct', $usersTag],
            'delete_open_todos' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * At least one change, and no tag both added and removed.
     *
     * @return array<int, Closure(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $hasChange = $this->has('status')
                    || $this->has('is_archived')
                    || filled($this->input('add_tag_ids'))
                    || filled($this->input('remove_tag_ids'));

                if (! $hasChange) {
                    $validator->errors()->add('changes', 'Choose at least one change to apply.');
                }

                // Only compare well-formed id lists: array_intersect on nested arrays would throw (500)
                $tagIdsAreValid = ! $validator->errors()->hasAny(['add_tag_ids', 'add_tag_ids.*', 'remove_tag_ids', 'remove_tag_ids.*']);
                if ($tagIdsAreValid && array_intersect((array) $this->input('add_tag_ids', []), (array) $this->input('remove_tag_ids', [])) !== []) {
                    $validator->errors()->add('remove_tag_ids', 'A tag cannot be added and removed at the same time.');
                }
            },
        ];
    }
}
