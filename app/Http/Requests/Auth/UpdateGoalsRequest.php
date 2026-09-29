<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGoalsRequest extends FormRequest
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
            'daily_goal' => ['required', 'integer', 'between:1,100'],
            'weekly_goal' => ['required', 'integer', 'between:1,500', 'gte:daily_goal'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'weekly_goal.gte' => 'The weekly goal cannot be lower than the daily goal.',
        ];
    }
}
