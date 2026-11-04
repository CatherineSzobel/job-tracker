<?php

namespace App\Exports;

use App\Http\Requests\JobApplication\ApplicationDetailRules;
use BackedEnum;
use DateTimeInterface;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithCustomValueBinder;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use PhpOffice\PhpSpreadsheet\Cell\Cell;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Cell\DefaultValueBinder;

class JobApplicationsExport extends DefaultValueBinder implements FromCollection, ShouldAutoSize, WithCustomValueBinder, WithHeadings, WithMapping
{
    /**
     * Every string as plain text, so "=HYPERLINK(...)" typed into a field isn't a live formula in the file
     */
    public function bindValue(Cell $cell, mixed $value): bool
    {
        if (is_string($value)) {
            $cell->setValueExplicit($value, DataType::TYPE_STRING);

            return true;
        }

        return parent::bindValue($cell, $value);
    }

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
                ...ApplicationDetailRules::fields(),
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
            ...ApplicationDetailRules::fields(),
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
            ...array_map(fn (string $field) => $this->cellValue($job->{$field}), ApplicationDetailRules::fields()),
        ];
    }

    /**
     * An enum as its value and a date as Y-m-d; anything else as it is
     */
    private function cellValue(mixed $value): mixed
    {
        return match (true) {
            $value instanceof BackedEnum => $value->value,
            $value instanceof DateTimeInterface => $value->format('Y-m-d'),
            default => $value,
        };
    }

    private function cleanText(?string $value): ?string
    {
        if (! $value) {
            return null;
        }

        return trim(strip_tags($value));
    }
}
