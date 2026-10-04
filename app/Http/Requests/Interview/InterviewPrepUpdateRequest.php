<?php

namespace App\Http\Requests\Interview;

use Illuminate\Foundation\Http\FormRequest;

class InterviewPrepUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * The whole prep document, rating and debrief notes: every key must be sent (lists may be empty).
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'checklist' => ['present', 'array', 'max:50'],
            'checklist.*.text' => ['required', 'string', 'max:200'],
            'checklist.*.done' => ['required', 'boolean'],
            'people' => ['present', 'array', 'max:20'],
            'people.*.name' => ['required', 'string', 'max:100'],
            'people.*.role' => ['nullable', 'string', 'max:100'],
            'people.*.url' => ['nullable', 'url:http,https', 'max:255'],
            'questions_to_ask' => ['present', 'array', 'max:30'],
            'questions_to_ask.*' => ['required', 'string', 'max:500'],
            'questions_asked' => ['present', 'array', 'max:50'],
            'questions_asked.*' => ['required', 'string', 'max:500'],
            'rating' => ['present', 'nullable', 'integer', 'between:1,5'],
            'debrief_notes' => ['present', 'nullable', 'string', 'max:10000'],
        ];
    }
}
