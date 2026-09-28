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
                'company_name',
                'position',
                'status',
                'priority',
                'applied_date',
                'location',
                'notes',
                'job_link',
            ])
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
        ];
    }

    public function map($job): array
    {
        return [
            $job->company_name,
            $job->position,
            $job->status,
            $job->priority,
            $job->applied_date?->format('Y-m-d'),
            $job->location,
            $this->cleanText($job->notes),
            $job->job_link,
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
