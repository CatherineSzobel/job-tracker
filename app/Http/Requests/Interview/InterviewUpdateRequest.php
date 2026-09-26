<?php

namespace App\Http\Requests\Interview;

use App\Enums\InterviewType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InterviewUpdateRequest extends FormRequest
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
            'interview_date' => 'sometimes|date',
            'type' => ['sometimes', Rule::enum(InterviewType::class)],
            'location' => 'sometimes|nullable|string|max:255',
            'notes' => 'sometimes|string|nullable',
        ];
    }
}
