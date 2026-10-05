<?php

namespace App\Http\Requests\JobApplication;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SyncJobApplicationTagsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * The full list of the application's tags; every id must be one of the user's tags.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'tag_ids' => ['present', 'array'],
            'tag_ids.*' => ['integer', 'distinct', Rule::exists('tags', 'id')->where('user_id', $this->user()->id)],
        ];
    }
}
