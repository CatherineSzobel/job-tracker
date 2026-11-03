<?php

namespace App\Imports;

use App\Enums\Currency;
use App\Enums\JobStatus;
use App\Enums\Priority;
use App\Http\Requests\JobApplication\ApplicationDetailRules;
use App\Models\JobApplication;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class JobApplicationsImport implements SkipsOnFailure, ToModel, WithHeadingRow, WithValidation
{
    use SkipsFailures;

    public function model(array $row)
    {
        // Rows are saved one at a time, so re-importing (or a repeated row) updates the
        // user's existing job with the same company + position instead of duplicating it
        $job = JobApplication::firstOrNew([
            'user_id' => Auth::id(),
            'company_name' => trim($row['company'] ?? $row['company_name']),
            'position' => trim($row['position'] ?? ''),
        ]);

        // status and priority come normalised from prepareForValidation(). An empty applied date keeps the existing
        // job's, so re-importing doesn't clear it or move it to today; a new one is applied today unless only Saved.
        return $job->fill([
            'status' => $row['status'],
            'priority' => $row['priority'],
            'applied_date' => $row['applied_date']
                ?? $job->applied_date
                ?? ($row['status'] === JobStatus::Saved->value ? null : now()->format('Y-m-d')),
            'location' => $row['location'] ?? null,
            'notes' => $this->sanitizeText($row['notes'] ?? null),
            'job_link' => $this->sanitizeUrl($row['job_link'] ?? null),
            // The detail columns came after the first exports: a file without one leaves that field as it is,
            // so re-importing an older export doesn't clear it
            ...array_intersect_key($row, array_flip(ApplicationDetailRules::fields())),
        ]);
    }

    public function rules(): array
    {
        return [
            'company_name' => 'required_without:company|string|max:255',
            'company' => 'required_without:company_name|string|max:255',
            'position' => 'required|string|max:255',
            'status' => ['nullable', Rule::enum(JobStatus::class)],
            'priority' => ['nullable', Rule::enum(Priority::class)],
            'applied_date' => 'nullable|date',
            'location' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:10000',
            'job_link' => 'nullable|url:http,https|max:255',
            ...ApplicationDetailRules::rules(),
            // Unlike the API, a file isn't checked for max below min, and any date format a spreadsheet uses goes
            'salary_max' => 'nullable|integer|min:0|max:100000000',
            'deadline' => 'nullable|date',
        ];
    }

    /**
     * The status as a JobStatus value ("No response" or "no-response" → no_response, Applied when empty)
     * (an empty applied date is filled in by model()). Of the later columns,
     * only those in the file: empty cells become null, the currency EUR when empty, and the source a value
     * ("Company website" → company_website).
     */
    public function prepareForValidation($data, $index)
    {
        $status = isset($data['status']) ? $this->toEnumValue($data['status']) : JobStatus::Applied->value;

        foreach (ApplicationDetailRules::fields() as $column) {
            if (array_key_exists($column, $data)) {
                $data[$column] = $this->nullIfEmpty($data[$column]);
            }
        }
        if (array_key_exists('salary_currency', $data)) {
            $data['salary_currency'] = strtoupper($data['salary_currency'] ?? Currency::Eur->value);
        }
        if (isset($data['source'])) {
            $data['source'] = $this->toEnumValue($data['source']);
        }

        return [
            ...$data,
            'status' => $status,
            'priority' => isset($data['priority']) ? $this->toEnumValue($data['priority']) : Priority::Medium->value,
            'notes' => $this->nullIfEmpty($data['notes'] ?? null),
            'location' => $this->nullIfEmpty($data['location'] ?? null),
            'job_link' => $this->nullIfEmpty($data['job_link'] ?? null),
        ];
    }

    /**
     * A label as an enum value: "No response" or "no-response" → no_response
     */
    private function toEnumValue(string $label): string
    {
        return str_replace([' ', '-'], '_', strtolower(trim($label)));
    }

    private function nullIfEmpty($value)
    {
        if (! is_string($value)) {
            return $value;
        }
        $value = trim($value);

        return $value === '' || strtolower($value) === 'n/a' ? null : $value;
    }

    private function sanitizeText($value)
    {
        if (! is_string($value)) {
            return null;
        }

        return trim(strip_tags($value));
    }

    private function sanitizeUrl($value)
    {
        if (! is_string($value)) {
            return null;
        }
        $value = trim($value);

        return ($value === '' || strtolower($value) === 'n/a') ? null : (filter_var($value, FILTER_VALIDATE_URL) ? $value : null);
    }
}
