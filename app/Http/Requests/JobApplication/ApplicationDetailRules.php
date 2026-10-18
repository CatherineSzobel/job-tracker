<?php

namespace App\Http\Requests\JobApplication;

use App\Enums\ApplicationSource;
use App\Enums\Currency;
use App\Rules\EmailOrUrl;
use Illuminate\Support\Fluent;
use Illuminate\Validation\Rule;

/**
 * The rules for an application's optional details (salary range, source, contact, deadline), shared by
 * adding, editing and importing applications.
 */
class ApplicationDetailRules
{
    /**
     * As for adding one (the import loosens a couple). $partial (editing): each field only when it's sent.
     *
     * @return array<string, list<mixed>>
     */
    public static function rules(bool $partial = false): array
    {
        $rules = [
            'salary_min' => ['nullable', 'integer', 'min:0', 'max:100000000'],
            // Not below the minimum, when there is one
            'salary_max' => ['nullable', 'integer', 'min:0', 'max:100000000', Rule::when(fn (Fluent $input) => $input->salary_min !== null, 'gte:salary_min')],
            // Always optional: the column defaults to EUR
            'salary_currency' => ['sometimes', Rule::enum(Currency::class)],
            'source' => ['nullable', Rule::enum(ApplicationSource::class)],
            'contact_name' => ['nullable', 'string', 'max:255'],
            'contact_details' => ['nullable', 'string', 'max:255', new EmailOrUrl],
            'deadline' => ['nullable', 'date_format:Y-m-d'],
        ];

        return $partial
            ? array_map(fn (array $fieldRules) => $fieldRules[0] === 'sometimes' ? $fieldRules : ['sometimes', ...$fieldRules], $rules)
            : $rules;
    }
}
