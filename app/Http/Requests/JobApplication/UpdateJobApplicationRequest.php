<?php

namespace App\Http\Requests\JobApplication;

use Illuminate\Foundation\Http\FormRequest;

class UpdateJobApplicationRequest extends FormRequest
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
    public function rules()
    {
        return [
            'status' => 'sometimes|in:applied,interview,offer,rejected',
            'is_archived' => 'sometimes|boolean',
            'priority' => 'sometimes|string|max:50',
            'notes' => 'sometimes|nullable|string',
            'location' => 'sometimes|string|max:255',
            'job_link' => 'sometimes|nullable|url',
            'company_name' => 'sometimes|string|max:255',
            'position' => 'sometimes|string|max:255',
        ];
    }
}
