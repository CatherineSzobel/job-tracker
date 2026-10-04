<?php

namespace App\Http\Requests\BankQuestion;

use App\Enums\BankQuestionCategory;
use Illuminate\Validation\Rule;

class BankQuestionUpdateRequest extends BankQuestionStoreRequest
{
    /**
     * Same fields as creating, each optional.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'question' => ['sometimes', 'required', 'string', 'max:500'],
            'answer' => ['sometimes', 'nullable', 'string', 'max:10000'],
            'category' => ['sometimes', 'required', Rule::enum(BankQuestionCategory::class)],
        ];
    }
}
