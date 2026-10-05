<?php

namespace App\Http\Requests\Tag;

use App\Enums\TagColor;
use Illuminate\Validation\Rule;

/**
 * Same rules as creating a tag, but each field is optional.
 */
class TagUpdateRequest extends TagStoreRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['bail', 'sometimes', 'required', 'string', 'max:30', $this->uniqueNameRule()],
            'color' => ['sometimes', Rule::enum(TagColor::class)],
        ];
    }
}
