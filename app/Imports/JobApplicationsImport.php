<?php

namespace App\Imports;

use App\Enums\JobStatus;
use App\Enums\Priority;
use App\Models\JobApplication;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Concerns\{
    ToModel,
    WithHeadingRow,
    WithValidation,
    SkipsOnFailure,
    SkipsFailures
};

class JobApplicationsImport implements ToModel, WithHeadingRow, WithValidation, SkipsOnFailure
{
    use SkipsFailures;

    public function model(array $row)
    {
        // Rows are saved one at a time, so re-importing (or a repeated row) updates the
        // user's existing job with the same company + position instead of duplicating it
        $job = JobApplication::firstOrNew([
            'user_id'      => Auth::id(),
            'company_name' => $row['company'] ?? $row['company_name'],
            'position'     => trim($row['position'] ?? ''),
        ]);

        return $job->fill([
            'status'       => strtolower($row['status'] ?? JobStatus::Applied->value),
            'priority'     => strtolower($row['priority'] ?? Priority::Medium->value),
            'applied_date' => $row['applied_date'] ?? now()->format('Y-m-d'), // default today
            'location'     => $row['location'] ?? null,
            'notes'        => $this->sanitizeText($row['notes'] ?? null),
            'job_link'     => $this->sanitizeUrl($row['job_link'] ?? null),
        ]);
    }

    public function rules(): array
    {
        return [
            'company_name' => 'required_without:company|string|max:255',
            'company'      => 'required_without:company_name|string|max:255',
            'position'     => 'required|string|max:255',
            'status'       => ['nullable', Rule::enum(JobStatus::class)],
            'priority'     => ['nullable', Rule::enum(Priority::class)],
            'applied_date' => 'nullable|date',
            'location'     => 'nullable|string|max:255',
            'notes'        => 'nullable|string|max:2000',
            'job_link'     => 'nullable|url:http,https|max:255',
        ];
    }

    public function prepareForValidation($data, $index)
    {
        return [
            ...$data,
            'status'   => isset($data['status']) ? strtolower(trim($data['status'])) : JobStatus::Applied->value,
            'priority' => isset($data['priority']) ? strtolower(trim($data['priority'])) : Priority::Medium->value,
            'applied_date' => $data['applied_date'] ?? now()->format('Y-m-d'),
            'notes'    => $this->nullIfEmpty($data['notes'] ?? null),
            'location' => $this->nullIfEmpty($data['location'] ?? null),
            'job_link' => $this->nullIfEmpty($data['job_link'] ?? null),
        ];
    }

    private function nullIfEmpty($value)
    {
        if (!is_string($value)) return $value;
        $value = trim($value);
        return $value === '' || strtolower($value) === 'n/a' ? null : $value;
    }

    private function sanitizeText($value)
    {
        if (!is_string($value)) return null;
        return trim(strip_tags($value));
    }

    private function sanitizeUrl($value)
    {
        if (!is_string($value)) return null;
        $value = trim($value);
        return ($value === '' || strtolower($value) === 'n/a') ? null : (filter_var($value, FILTER_VALIDATE_URL) ? $value : null);
    }
}
