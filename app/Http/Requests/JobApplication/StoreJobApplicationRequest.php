<?php

namespace App\Http\Requests\JobApplication;

use App\Enums\JobStatus;
use App\Enums\Priority;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreJobApplicationRequest extends FormRequest
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
            'company_name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'status' => ['sometimes', Rule::enum(JobStatus::class)],
            'priority' => ['sometimes', Rule::enum(Priority::class)],
            'job_link' => 'nullable|url:http,https|max:255',
            'notes' => 'nullable|string',
        ];
    }
}
