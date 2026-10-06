<?php

namespace App\Http\Requests\Todo;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TodoUpdateRequest extends FormRequest
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
            'text' => 'sometimes|required|string|max:255',
            'done' => 'sometimes|boolean',
            'due_date' => 'sometimes|nullable|date_format:Y-m-d',
            'job_application_id' => [
                'sometimes',
                'nullable',
                'integer',
                Rule::exists('job_applications', 'id')->where('user_id', $this->user()->id),
            ],
        ];
    }
}
