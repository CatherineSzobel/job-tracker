<?php

namespace App\Http\Requests\JobApplication;

use App\Enums\ApplicationSource;
use App\Enums\Currency;
use App\Enums\JobStatus;
use App\Enums\Priority;
use App\Rules\EmailOrUrl;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Fluent;
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
            'salary_min' => 'sometimes|nullable|integer|min:0|max:100000000',
            // Not below the minimum, when both are sent
            'salary_max' => ['sometimes', 'nullable', 'integer', 'min:0', 'max:100000000', Rule::when(fn (Fluent $input) => $input->salary_min !== null, 'gte:salary_min')],
            'salary_currency' => ['sometimes', Rule::enum(Currency::class)],
            'source' => ['sometimes', 'nullable', Rule::enum(ApplicationSource::class)],
            'contact_name' => 'sometimes|nullable|string|max:255',
            'contact_details' => ['sometimes', 'nullable', 'string', 'max:255', new EmailOrUrl],
            'deadline' => 'sometimes|nullable|date_format:Y-m-d',
            'delete_open_todos' => 'sometimes|boolean',
        ];
    }
}
