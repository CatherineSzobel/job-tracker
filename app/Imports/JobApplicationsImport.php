<?php

namespace App\Imports;

use App\Enums\ApplicationSource;
use App\Enums\Currency;
use App\Enums\JobStatus;
use App\Enums\Priority;
use App\Models\JobApplication;
use App\Rules\EmailOrUrl;
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

    /**
     * Columns added after the first exports. A file without one leaves that field as it is, so re-importing
     * an older export doesn't clear it.
     */
    private const DETAIL_COLUMNS = ['salary_min', 'salary_max', 'salary_currency', 'source', 'contact_name', 'contact_details', 'deadline'];

    public function model(array $row)
    {
        // Rows are saved one at a time, so re-importing (or a repeated row) updates the
        // user's existing job with the same company + position instead of duplicating it
        $job = JobApplication::firstOrNew([
            'user_id' => Auth::id(),
            'company_name' => $row['company'] ?? $row['company_name'],
            'position' => trim($row['position'] ?? ''),
        ]);

        // status and applied_date come normalised from prepareForValidation()
        return $job->fill([
            'status' => $row['status'],
            'priority' => strtolower($row['priority'] ?? Priority::Medium->value),
            'applied_date' => $row['applied_date'],
            'location' => $row['location'] ?? null,
            'notes' => $this->sanitizeText($row['notes'] ?? null),
            'job_link' => $this->sanitizeUrl($row['job_link'] ?? null),
            ...array_intersect_key($row, array_flip(self::DETAIL_COLUMNS)),
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
            'notes' => 'nullable|string|max:2000',
            'job_link' => 'nullable|url:http,https|max:255',
            // Each on its own: unlike the API, a file isn't checked for max below min
            'salary_min' => 'nullable|integer|min:0|max:100000000',
            'salary_max' => 'nullable|integer|min:0|max:100000000',
            'salary_currency' => ['nullable', Rule::enum(Currency::class)],
            'source' => ['nullable', Rule::enum(ApplicationSource::class)],
            'contact_name' => 'nullable|string|max:255',
            'contact_details' => ['nullable', 'string', 'max:255', new EmailOrUrl],
            'deadline' => 'nullable|date',
        ];
    }

    /**
     * The status as a JobStatus value ("No response" or "no-response" → no_response, Applied when empty), and
     * applied today when the date is empty, unless it's only Saved (not applied yet). Of the later columns,
     * only those in the file: empty cells become null, the currency EUR when empty, and the source a value
     * ("Company website" → company_website).
     */
    public function prepareForValidation($data, $index)
    {
        $status = isset($data['status']) ? str_replace([' ', '-'], '_', strtolower(trim($data['status']))) : JobStatus::Applied->value;

        foreach (self::DETAIL_COLUMNS as $column) {
            if (array_key_exists($column, $data)) {
                $data[$column] = $this->nullIfEmpty($data[$column]);
            }
        }
        if (array_key_exists('salary_currency', $data)) {
            $data['salary_currency'] = strtoupper($data['salary_currency'] ?? Currency::Eur->value);
        }
        if (isset($data['source'])) {
            $data['source'] = str_replace([' ', '-'], '_', strtolower($data['source']));
        }

        return [
            ...$data,
            'status' => $status,
            'priority' => isset($data['priority']) ? strtolower(trim($data['priority'])) : Priority::Medium->value,
            'applied_date' => $data['applied_date'] ?? ($status === JobStatus::Saved->value ? null : now()->format('Y-m-d')),
            'notes' => $this->nullIfEmpty($data['notes'] ?? null),
            'location' => $this->nullIfEmpty($data['location'] ?? null),
            'job_link' => $this->nullIfEmpty($data['job_link'] ?? null),
        ];
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
