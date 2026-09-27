<?php

namespace App\Http\Requests\Auth;

use Illuminate\Auth\Access\Response;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class ChangePasswordRequest extends FormRequest
{
    // Runs before validation, so the demo account is refused whatever it sends
    public function authorize(): Response
    {
        return $this->user()->isDemo()
            ? Response::deny('The demo account password cannot be changed.')
            : Response::allow();
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'current_password' => ['required', 'string', 'current_password'],
            'password' => ['required', 'string', Password::defaults(), 'confirmed'],
        ];
    }
}
