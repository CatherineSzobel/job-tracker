<?php

namespace App\Http\Requests\Interview;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InterviewBankQuestionsSyncRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * The full list of linked bank questions in order; every id must be one of the user's questions.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'questions' => ['present', 'array', 'max:50'],
            'questions.*.id' => ['required', 'integer', 'distinct', Rule::exists('bank_questions', 'id')->where('user_id', $this->user()->id)],
            'questions.*.note' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
