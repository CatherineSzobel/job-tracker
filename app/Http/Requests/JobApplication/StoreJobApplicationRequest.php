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
            'salary_min' => 'nullable|integer|min:0|max:100000000',
            // Not below the minimum, when there is one
            'salary_max' => ['nullable', 'integer', 'min:0', 'max:100000000', Rule::when(fn (Fluent $input) => $input->salary_min !== null, 'gte:salary_min')],
            'salary_currency' => ['sometimes', Rule::enum(Currency::class)],
            'source' => ['nullable', Rule::enum(ApplicationSource::class)],
            'contact_name' => 'nullable|string|max:255',
            'contact_details' => ['nullable', 'string', 'max:255', new EmailOrUrl],
            'deadline' => 'nullable|date_format:Y-m-d',
        ];
    }
}
