<?php

namespace App\Http\Requests\JobApplication;

use App\Enums\JobStatus;
use App\Enums\Priority;
use App\Models\JobApplication;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

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
            ...ApplicationDetailRules::rules(partial: true),
            'delete_open_todos' => 'sometimes|boolean',
        ];
    }

    /**
     * When only one end of the salary range is sent, it's checked against the stored other end
     * (both ends sent are checked by the rules). Only for the user's own application: anyone else's is a 404 later.
     *
     * @return list<\Closure(Validator): void>
     */
    public function after(): array
    {
        return [function (Validator $validator) {
            $job = $this->route('job_application');
            if (! $job instanceof JobApplication || $job->user_id !== $this->user()->id
                || $this->has('salary_min') === $this->has('salary_max') || $validator->errors()->hasAny(['salary_min', 'salary_max'])) {
                return;
            }

            $min = $this->has('salary_min') ? $this->input('salary_min') : $job->salary_min;
            $max = $this->has('salary_max') ? $this->input('salary_max') : $job->salary_max;
            if ($min !== null && $max !== null && (int) $min > (int) $max) {
                $validator->errors()->add(
                    $this->has('salary_min') ? 'salary_min' : 'salary_max',
                    'The minimum salary can\'t be above the maximum.'
                );
            }
        }];
    }
}
