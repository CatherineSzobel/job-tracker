<?php

namespace App\Services;

use App\Models\JobApplication;
use App\Imports\JobApplicationsImport;
use App\Exports\JobApplicationsExport;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Http\UploadedFile;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Validators\ValidationException;
use RuntimeException;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class JobApplicationService
{
    /**
     * Create a new job application for a user
     */
    public function create(array $data, $user): JobApplication
    {
        $data['applied_date'] = now()->toDateString();

        return $user->jobApplications()->create($data);
    }

    /**
     * Update an existing job application
     */
    public function update(JobApplication $job, array $data): JobApplication
    {
        $job->update($data);
        return $job;
    }

    /**
     * Delete a job application
     */
    public function delete(int $id): void
    {
        JobApplication::findOrFail($id)->delete();
    }

    /**
     * Schedule an interview for a job application
     */
    public function scheduleInterview(JobApplication $job, array $data, $user)
    {
        return $job->interviews()->create(array_merge($data, [
            'user_id' => $user->id,
        ]));
    }

    /**
     * Import job applications from an Excel file
     */
    public function importExcel(UploadedFile $file): array
    {
        $ext = strtolower($file->getClientOriginalExtension());
        if (in_array($ext, ['xlsx', 'xls']) && !class_exists('ZipArchive')) {
            throw new RuntimeException(
                'PHP zip extension is required to import Excel files. Please enable ext-zip.'
            );
        }

        $import = new JobApplicationsImport;

        try {
            Excel::import($import, $file);
        } catch (ValidationException $e) {
            $failures = array_map(fn($f) => [
                'row' => $f->row(),
                'attribute' => $f->attribute(),
                'errors' => $f->errors(),
                'values' => $f->values(),
            ], $e->failures());

            return ['failures' => $failures];
        }

        return ['failures' => []];
    }

    /**
     * Export job applications to Excel
     */
    public function exportExcel(): BinaryFileResponse
    {
        return Excel::download(new JobApplicationsExport, 'job-applications.xlsx');
    }

    /**
     * Filter job applications for a user
     */
    public function filter($user, array $filters = []): Collection
    {
        $query = $user->jobApplications()->with('interviews');

        if (!array_key_exists('archived', $filters)) {
            $query->where('is_archived', false);
        } else {
            $archived = filter_var($filters['archived'], FILTER_VALIDATE_BOOLEAN);
            $query->where('is_archived', $archived);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }

        if (!empty($filters['applied_date'])) {
            $query->whereDate('applied_date', $filters['applied_date']);
        }

        return $query->get();
    }

    public function getStatsForUser($user): array
    {
        $jobs = $user->jobApplications()->with('interviews')->get();

        $today = Carbon::today();
        $startOfWeek = Carbon::now()->startOfWeek();

        $todayApplications = $jobs->filter(fn($job) => $job->applied_date && $job->applied_date->gte($today))->count();
        $weekApplications = $jobs->filter(fn($job) => $job->applied_date && $job->applied_date->gte($startOfWeek))->count();
        $upcomingInterviews = $jobs->flatMap(fn($job) => $job->interviews)
            ->filter(fn($interview) => $interview->scheduled_at->gte($today))
            ->count();


        return [
            'total' => $jobs->count(),
            'archived' => $jobs->where('is_archived', true)->count(),
            'applied' => $jobs->where('status', 'applied')->count(),
            'interview' => $jobs->where('status', 'interview')->count(),
            'offer' => $jobs->where('status', 'offer')->count(),
            'rejected' => $jobs->where('status', 'rejected')->count(),
            'todayApplications' => $todayApplications,
            'weekApplications' => $weekApplications,
            'upcomingInterviews' => $upcomingInterviews,
        ];
    }
}
