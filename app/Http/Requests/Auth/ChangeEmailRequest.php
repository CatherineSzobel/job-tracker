<?php

namespace App\Http\Requests\Auth;

use Illuminate\Auth\Access\Response;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ChangeEmailRequest extends FormRequest
{
    // Runs before validation, so the demo account is refused whatever it sends
    public function authorize(): Response
    {
        return $this->user()->isDemo()
            ? Response::deny('The demo account email cannot be changed.')
            : Response::allow();
    }

    /**
     * Emails are compared in lower case, so "Jane@Example.com" can't sneak past an existing "jane@example.com".
     */
    protected function prepareForValidation(): void
    {
        if (is_string($this->input('email'))) {
            $this->merge(['email' => Str::lower($this->input('email'))]);
        }
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($this->user()->id)],
            'current_password' => ['required', 'string', 'current_password'],
        ];
    }
}
