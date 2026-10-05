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

    /**
     * The validated items, each with a type (an item sent without one is for every interview).
     *
     * @return list<array{text: string, type: ?string}>
     */
    public function items(): array
    {
        return array_map(
            fn (array $item) => ['text' => $item['text'], 'type' => $item['type'] ?? null],
            $this->validated('items')
        );
    }
}
