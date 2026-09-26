<?php

namespace App\Http\Requests\JobApplication;

use App\Enums\JobStatus;
use App\Enums\Priority;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            'status' => ['sometimes', Rule::enum(JobStatus::class)],
            'is_archived' => 'sometimes|boolean',
            'priority' => ['sometimes', Rule::enum(Priority::class)],
            'notes' => 'sometimes|nullable|string',
            'location' => 'sometimes|nullable|string|max:255',
            'job_link' => 'sometimes|nullable|url:http,https|max:255',
            'company_name' => 'sometimes|string|max:255',
            'position' => 'sometimes|string|max:255',
        ];
    }
}
