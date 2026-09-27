<?php

namespace App\Http\Requests\Note;

use Illuminate\Foundation\Http\FormRequest;

// Shared by store and update: same rules for both
class NoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'is_pinned' => 'boolean',
        ];
    }

    // Cleared content arrives as null (ConvertEmptyStringsToNull), but the column is NOT NULL
    protected function prepareForValidation(): void
    {
        if ($this->exists('content') && $this->input('content') === null) {
            $this->merge(['content' => '']);
        }
    }
}
