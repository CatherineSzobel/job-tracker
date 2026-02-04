<?php

namespace App\Http\Requests\JobApplication;
use App\Enums\JobStatus;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Foundation\Http\FormRequest;

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
            'status' => 'sometimes|in:applied,interviewing,offered,rejected',
            'priority' => 'nullable|string|max:50',
            'job_link' => 'nullable|url',
            'description' => 'nullable|string',
            'notes' => 'nullable|string',
        ];
    }

    protected function prepareForValidation()
    {
        $this->merge([
            'applied_date' => now()->toDateString(),
        ]);
    }
}
