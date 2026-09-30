<?php

namespace App\Http\Requests\Document;

use App\Enums\DocumentCategory;
use App\Enums\DocumentKind;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

// kind=file needs an uploaded file, kind=link a URL; the other field is excluded from validated()
class DocumentStoreRequest extends FormRequest
{
    private const DEMO_DOCUMENT_LIMIT = 10;

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
            'kind' => ['required', Rule::enum(DocumentKind::class)],
            'name' => 'required|string|max:255',
            'category' => ['required', Rule::enum(DocumentCategory::class)],
            'file' => 'exclude_unless:kind,file|required|file|max:10240|mimes:pdf,doc,docx,odt,txt,png,jpg,jpeg',
            'url' => 'exclude_unless:kind,link|required|url:http,https|max:255',
        ];
    }

    /**
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                // Archived documents count too: they still take up storage
                if ($this->user()->isDemo() && $this->user()->documents()->count() >= self::DEMO_DOCUMENT_LIMIT) {
                    $validator->errors()->add('document', 'The demo account can keep up to '.self::DEMO_DOCUMENT_LIMIT.' documents.');
                }
            },
        ];
    }
}
