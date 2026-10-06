<?php

namespace App\Http\Requests\Document;

use App\Enums\DocumentCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

// Files are fixed: only the label and category can change, anything else sent is ignored
class DocumentUpdateRequest extends FormRequest
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
            'name' => 'sometimes|required|string|max:255',
            'category' => ['sometimes', 'required', Rule::enum(DocumentCategory::class)],
        ];
    }
}
