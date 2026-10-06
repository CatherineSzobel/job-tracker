<?php

namespace App\Http\Requests\Tag;

use App\Enums\TagColor;
use App\Models\Tag;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TagStoreRequest extends FormRequest
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
            // bail: the uniqueness check casts the value to a string, so it must not run after "string" fails
            'name' => ['bail', 'required', 'string', 'max:30', $this->uniqueNameRule()],
            'color' => ['sometimes', Rule::enum(TagColor::class)],
        ];
    }

    /**
     * Tag names are unique per user, ignoring case. SQLite's unique index is case-sensitive,
     * so this is checked here. When renaming, the tag itself doesn't count.
     */
    protected function uniqueNameRule(): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail): void {
            $tag = $this->route('tag');

            $isTaken = $this->user()->tags()
                ->whereRaw('LOWER(name) = ?', [mb_strtolower((string) $value)])
                ->when($tag instanceof Tag, fn ($query) => $query->whereKeyNot($tag->id))
                ->exists();

            if ($isTaken) {
                $fail('You already have a tag with this name.');
            }
        };
    }
}
