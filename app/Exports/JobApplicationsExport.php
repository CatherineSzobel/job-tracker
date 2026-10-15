<?php

namespace App\Exports;

use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class JobApplicationsExport implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping
{
    public function collection()
    {
        return Auth::user()
            ->jobApplications()
            ->select([
                'id', // needed to load the tags
                'company_name',
                'position',
                'status',
                'priority',
                'applied_date',
                'location',
                'notes',
                'job_link',
                'salary_min',
                'salary_max',
                'salary_currency',
                'source',
                'contact_name',
                'contact_details',
                'deadline',
            ])
            ->with('tags')
            ->orderBy('applied_date', 'desc')
            ->get();
    }

    public function headings(): array
    {
        return [
            'company_name',
            'position',
            'status',
            'priority',
            'applied_date',
            'location',
            'notes',
            'job_link',
            'tags',
            // Added later, so they come after tags and older files keep their column positions
            'salary_min',
            'salary_max',
            'salary_currency',
            'source',
            'contact_name',
            'contact_details',
            'deadline',
        ];
    }

    public function map($job): array
    {
        return [
            $job->company_name,
            $job->position,
            $job->status?->value,
            $job->priority?->value,
            $job->applied_date?->format('Y-m-d'),
            $job->location,
            $this->cleanText($job->notes),
            $job->job_link,
            $job->tags->pluck('name')->implode(', ') ?: null,
            $job->salary_min,
            $job->salary_max,
            $job->salary_currency?->value,
            $job->source?->value,
            $job->contact_name,
            $job->contact_details,
            $job->deadline?->format('Y-m-d'),
        ];
    }

    private function cleanText(?string $value): ?string
    {
        if (! $value) {
            return null;
        }

        return trim(strip_tags($value));
    }
}
