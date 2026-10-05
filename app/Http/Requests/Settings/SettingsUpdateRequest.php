<?php

namespace App\Http\Requests\Settings;

use App\Enums\ArchiveTodosAction;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Each setting is optional, so the Settings page can save one control at a time.
 */
class SettingsUpdateRequest extends FormRequest
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
            'archive_todos' => ['sometimes', Rule::enum(ArchiveTodosAction::class)],
        ];
    }
}
