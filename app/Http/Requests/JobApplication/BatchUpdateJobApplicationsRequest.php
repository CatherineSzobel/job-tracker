<?php

namespace App\Http\Requests\JobApplication;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Archive or restore several applications at once. Status and tag changes go through
 * SaveJobApplicationChangesRequest (PATCH /job-applications/batch-changes).
 */
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
        return [
            'ids' => ['required', 'array', 'min:1', 'max:200'],
            'ids.*' => ['integer', 'distinct'],
            'is_archived' => ['required', 'boolean'],
            'delete_open_todos' => ['sometimes', 'boolean'],
        ];
    }
}
