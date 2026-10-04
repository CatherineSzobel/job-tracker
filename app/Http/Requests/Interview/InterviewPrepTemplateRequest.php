<?php

namespace App\Http\Requests\Interview;

use App\Enums\InterviewType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InterviewPrepTemplateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * The full template; an item's type is null (every interview) or an interview type.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'items' => ['present', 'array', 'max:30'],
            'items.*.text' => ['required', 'string', 'max:200'],
            'items.*.type' => ['nullable', Rule::enum(InterviewType::class)],
        ];
    }
}
