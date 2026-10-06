<?php

namespace App\Services;

use App\Enums\ArchiveTodosAction;
use App\Enums\InterviewType;
use App\Enums\JobStatus;
use App\Enums\Priority;
use App\Exports\JobApplicationsExport;
use App\Imports\JobApplicationsImport;
use App\Models\Interview;
use App\Models\JobApplication;
use App\Models\Todo;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Validators\Failure;
use RuntimeException;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class JobApplicationService
{
    public function __construct(private InterviewPrepService $interviewPrep) {}

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
     * Archive or restore several of the user's applications, all or nothing.
     * Any id that isn't one of theirs answers 404 before anything changes. Archiving follows the same
     * open to-dos rule as update(): only applications going from active to archived.
     *
     * @param  list<int>  $ids
     * @return EloquentCollection<int, JobApplication>
     */
    public function batchUpdate(User $user, array $ids, bool $isArchived, ?bool $deleteOpenTodos = null): EloquentCollection
    {
        return DB::transaction(function () use ($user, $ids, $isArchived, $deleteOpenTodos) {
            $jobs = $user->jobApplications()->whereKey($ids)->get();
            abort_if($jobs->count() !== count($ids), 404);

            $newlyArchivedIds = $isArchived ? $jobs->where('is_archived', false)->modelKeys() : [];

            // A query update, so updated_at moves too (archiving counts as an update)
            $user->jobApplications()->whereKey($ids)->update(['is_archived' => $isArchived]);

            if ($newlyArchivedIds !== [] && ($deleteOpenTodos ?? $user->archive_todos === ArchiveTodosAction::Delete)) {
                Todo::whereIn('job_application_id', $newlyArchivedIds)->where('done', false)->delete();
            }

            return $this->withListDetails($user, $ids);
        });
    }

    /**
     * Save a different change for each of the user's applications, all or nothing.
     * Any id that isn't one of theirs answers 404 before anything changes.
     *
     * @param  list<array{id: int, status?: string, add_tag_ids?: list<int>, remove_tag_ids?: list<int>}>  $changes
     * @return EloquentCollection<int, JobApplication>
     */
    public function saveChanges(User $user, array $changes): EloquentCollection
    {
        // Validated as integers, which still lets through strings like "+4"; cast so they match the keys below
        $changes = array_map(fn (array $change) => ['id' => (int) $change['id']] + $change, $changes);
        $ids = array_column($changes, 'id');

        return DB::transaction(function () use ($user, $changes, $ids) {
            $jobs = $user->jobApplications()->whereKey($ids)->get()->keyBy('id');
            abort_if($jobs->count() !== count($ids), 404);

            // One query per status, not per application. A query update, so updated_at moves too
            // (a status change counts as an update)
            collect($changes)->whereNotNull('status')->groupBy('status')
                ->each(fn (Collection $group, string $status) => $user->jobApplications()
                    ->whereKey($group->pluck('id'))
                    ->update(['status' => $status]));

            foreach ($changes as $change) {
                $job = $jobs[$change['id']];
                if (! empty($change['add_tag_ids'])) {
                    $job->tags()->syncWithoutDetaching($change['add_tag_ids']);
                }
                if (! empty($change['remove_tag_ids'])) {
                    $job->tags()->detach($change['remove_tag_ids']);
                }
            }

            return $this->withListDetails($user, $ids);
        });
    }

    /**
     * The user's applications with these ids, in the list shape (interviews, tags, open_todos_count).
     *
     * @param  list<int>  $ids
     * @return EloquentCollection<int, JobApplication>
     */
    private function withListDetails(User $user, array $ids): EloquentCollection
    {
        return $user->jobApplications()->whereKey($ids)
            ->with(['interviews', 'tags'])
            ->withCount(JobApplication::openTodosCount())
            ->get();
    }

    /**
     * Delete a job application
     */
    public function delete(JobApplication $job): void
    {
        $job->delete();
    }

    /**
     * Schedule an interview. Its checklist is copied from the user's template, filtered by the
     * interview's type (online when none is given, like the column's default).
     */
    public function scheduleInterview(JobApplication $job, array $data, User $user): Interview
    {
        $type = InterviewType::from($data['type'] ?? InterviewType::Online->value);

        return $job->interviews()->create([
            ...$data,
            'user_id' => $user->id,
            'prep' => [...Interview::EMPTY_PREP, 'checklist' => $this->interviewPrep->checklistFor($user, $type)],
        ]);
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

        // Unknown values are ignored, like the question bank's ?category=
        if ($status = JobStatus::tryFrom((string) ($filters['status'] ?? ''))) {
            $query->where('status', $status);
        }

        if ($priority = Priority::tryFrom((string) ($filters['priority'] ?? ''))) {
            $query->where('priority', $priority);
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
