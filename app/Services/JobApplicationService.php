<?php

namespace App\Services;

use App\Enums\ArchiveTodosAction;
use App\Enums\JobStatus;
use App\Exports\JobApplicationsExport;
use App\Imports\JobApplicationsImport;
use App\Models\Interview;
use App\Models\JobApplication;
use App\Models\Todo;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Validators\Failure;
use RuntimeException;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class JobApplicationService
{
    /**
     * Create a new job application for a user
     */
    public function create(array $data, User $user): JobApplication
    {
        $data['applied_date'] = now()->toDateString();

        return $user->jobApplications()->create($data);
    }

    /**
     * Update an existing job application. Archiving it also deletes its open to-dos when
     * $deleteOpenTodos is true, or when it's null and the owner's setting is "delete".
     */
    public function update(JobApplication $job, array $data, ?bool $deleteOpenTodos = null): JobApplication
    {
        return DB::transaction(function () use ($job, $data, $deleteOpenTodos) {
            // Only active → archived counts: the job page re-sends is_archived: true on every save
            $isBeingArchived = ! $job->is_archived && (bool) ($data['is_archived'] ?? false);

            $job->update($data);

            if ($isBeingArchived && ($deleteOpenTodos ?? $job->user->archive_todos === ArchiveTodosAction::Delete)) {
                $job->todos()->where('done', false)->delete();
            }

            return $job;
        });
    }

    /**
     * Apply one set of changes to several of the user's applications, all or nothing.
     * Any id that isn't one of theirs answers 404 before anything changes. Archiving follows the same
     * open to-dos rule as update(): only applications going from active to archived.
     *
     * @param  list<int>  $ids
     * @param  array{status?: string, is_archived?: bool, add_tag_ids?: list<int>, remove_tag_ids?: list<int>}  $changes
     * @return EloquentCollection<int, JobApplication>
     */
    public function batchUpdate(User $user, array $ids, array $changes, ?bool $deleteOpenTodos = null): EloquentCollection
    {
        return DB::transaction(function () use ($user, $ids, $changes, $deleteOpenTodos) {
            $jobs = $user->jobApplications()->whereKey($ids)->get();
            abort_if($jobs->count() !== count($ids), 404);

            $attributes = Arr::only($changes, ['status', 'is_archived']);
            if ($attributes !== []) {
                $newlyArchivedIds = ($attributes['is_archived'] ?? false)
                    ? $jobs->where('is_archived', false)->modelKeys()
                    : [];

                // A query update, so updated_at moves too (a batch status change counts as an update)
                $user->jobApplications()->whereKey($ids)->update($attributes);

                if ($newlyArchivedIds !== [] && ($deleteOpenTodos ?? $user->archive_todos === ArchiveTodosAction::Delete)) {
                    Todo::whereIn('job_application_id', $newlyArchivedIds)->where('done', false)->delete();
                }
            }

            foreach ($jobs as $job) {
                if (! empty($changes['add_tag_ids'])) {
                    $job->tags()->syncWithoutDetaching($changes['add_tag_ids']);
                }
                if (! empty($changes['remove_tag_ids'])) {
                    $job->tags()->detach($changes['remove_tag_ids']);
                }
            }

            return $user->jobApplications()->whereKey($ids)
                ->with(['interviews', 'tags'])
                ->withCount(JobApplication::openTodosCount())
                ->get();
        });
    }

    /**
     * Delete a job application
     */
    public function delete(JobApplication $job): void
    {
        $job->delete();
    }

    /**
     * Schedule an interview for a job application
     */
    public function scheduleInterview(JobApplication $job, array $data, User $user): Interview
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
        if (in_array($ext, ['xlsx', 'xls']) && ! class_exists('ZipArchive')) {
            throw new RuntimeException(
                'PHP zip extension is required to import Excel files. Please enable ext-zip.'
            );
        }

        $import = new JobApplicationsImport;
        Excel::import($import, $file);

        // Invalid rows are skipped (SkipsOnFailure) and collected on the import, not thrown
        $failures = $import->failures()->map(fn (Failure $f) => [
            'row' => $f->row(),
            'attribute' => $f->attribute(),
            'errors' => $f->errors(),
            'values' => $f->values(),
        ])->values()->all();

        return ['failures' => $failures];
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
    public function filter(User $user, array $filters = []): Collection
    {
        $query = $user->jobApplications()->with(['interviews', 'tags'])->withCount(JobApplication::openTodosCount());

        if (! array_key_exists('archived', $filters)) {
            $query->where('is_archived', false);
        } else {
            $archived = filter_var($filters['archived'], FILTER_VALIDATE_BOOLEAN);
            $query->where('is_archived', $archived);
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }

        if (! empty($filters['applied_date'])) {
            $query->whereDate('applied_date', $filters['applied_date']);
        }

        return $query->get();
    }

    /**
     * Dashboard counts for a user's jobs (archived included), counted in the database.
     *
     * @return array{total: int, archived: int, applied: int, interview: int, offer: int, rejected: int, todayApplications: int, weekApplications: int, upcomingInterviews: int}
     */
    public function getStatsForUser(User $user): array
    {
        $today = Carbon::today();
        $jobs = $user->jobApplications();

        // One count per status: applied, interview, offer, rejected
        $statusCounts = collect(JobStatus::cases())
            ->mapWithKeys(fn (JobStatus $status) => [$status->value => $jobs->clone()->where('status', $status)->count()]);

        return [
            'total' => $jobs->count(),
            'archived' => $jobs->clone()->where('is_archived', true)->count(),
            ...$statusCounts,
            'todayApplications' => $jobs->clone()->whereDate('applied_date', '>=', $today)->count(),
            'weekApplications' => $jobs->clone()->whereDate('applied_date', '>=', $today->copy()->startOfWeek())->count(),
            'upcomingInterviews' => Interview::whereHas('job', fn ($query) => $query->whereBelongsTo($user))
                ->where('interview_date', '>=', $today)
                ->count(),
        ];
    }
}
