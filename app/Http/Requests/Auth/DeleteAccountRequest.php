<?php

namespace App\Http\Requests\Auth;

use Illuminate\Auth\Access\Response;
use Illuminate\Foundation\Http\FormRequest;

class DeleteAccountRequest extends FormRequest
{
    // Runs before validation, so the demo account is refused whatever it sends
    public function authorize(): Response
    {
        return $this->user()->isDemo()
            ? Response::deny('The demo account cannot be deleted.')
            : Response::allow();
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'password' => ['required', 'string', 'current_password'],
        ];
    }
}
