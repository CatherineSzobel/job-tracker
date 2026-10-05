<?php

namespace App\Http\Requests\BankQuestion;

class BankQuestionUpdateRequest extends BankQuestionStoreRequest
{
    /**
     * Same fields and limits as creating, each optional.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return array_map(fn (array $rules) => ['sometimes', ...$rules], parent::rules());
    }
}
