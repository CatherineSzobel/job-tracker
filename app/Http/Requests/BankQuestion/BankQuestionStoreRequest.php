<?php

namespace App\Http\Requests\BankQuestion;

use App\Enums\BankQuestionCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BankQuestionStoreRequest extends FormRequest
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
            'question' => ['required', 'string', 'max:500'],
            'answer' => ['nullable', 'string', 'max:10000'],
            'category' => ['required', Rule::enum(BankQuestionCategory::class)],
        ];
    }
}
