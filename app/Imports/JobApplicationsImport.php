<?php

namespace App\Imports;

use App\Models\JobApplication;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Concerns\{
    ToModel,
    WithHeadingRow,
    WithUpserts,
    WithValidation,
    SkipsOnFailure,
    SkipsFailures
};

class JobApplicationsImport implements ToModel, WithHeadingRow, WithUpserts, WithValidation, SkipsOnFailure
{
    use SkipsFailures;

    public function model(array $row)
    {

        $companyName = $row['company'] ?? $row['company_name'];
        $position = trim($row['position'] ?? '');

        return new JobApplication([
            'user_id'      => Auth::id(),
            'company_name' => $companyName,
            'position'     => $position,
            'status'       => strtolower($row['status'] ?? 'applied'), // default to applied
            'priority'     => strtolower($row['priority'] ?? 'medium'), // default to medium
            'applied_date' => $row['applied_date'] ?? now()->format('Y-m-d'), // default today
            'location'     => $row['location'] ?? null,
            'notes'        => $this->sanitizeText($row['notes'] ?? null),
            'job_link'     => $this->sanitizeUrl($row['job_link'] ?? null),
            'is_archived'  => false,
        ]);
    }

    public function rules(): array
    {
        return [
            'company_name' => 'required_without:company|string',
            'company'      => 'required_without:company_name|string',
            'position'     => 'required|string',
            'status'       => 'nullable|in:applied,interview,offer,rejected',
            'priority'     => 'nullable|in:low,medium,high',
            'applied_date' => 'nullable|date',
            'location'     => 'nullable|string|max:255',
            'notes'        => 'nullable|string|max:2000',
            'job_link'     => 'nullable|url|max:2048',
        ];
    }

    public function prepareForValidation($data, $index)
    {
        return [
            ...$data,
            'status'   => isset($data['status']) ? strtolower(trim($data['status'])) : 'applied',
            'priority' => isset($data['priority']) ? strtolower(trim($data['priority'])) : 'medium',
            'applied_date' => $data['applied_date'] ?? now()->format('Y-m-d'),
            'notes'    => $this->nullIfEmpty($data['notes'] ?? null),
            'location' => $this->nullIfEmpty($data['location'] ?? null),
            'job_link' => $this->nullIfEmpty($data['job_link'] ?? null),
        ];
    }

    public function uniqueBy()
    {
        return ['user_id', 'company_name', 'position'];
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
