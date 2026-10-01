<?php

namespace App\Http\Controllers;

use App\Http\Requests\JobApplication\BatchUpdateJobApplicationsRequest;
use App\Http\Requests\JobApplication\JobApplicationImportRequest;
use App\Http\Requests\JobApplication\ScheduleInterviewRequest;
use App\Http\Requests\JobApplication\StoreJobApplicationRequest;
use App\Http\Requests\JobApplication\SyncJobApplicationTagsRequest;
use App\Http\Requests\JobApplication\UpdateJobApplicationRequest;
use App\Http\Resources\InterviewResource;
use App\Http\Resources\JobApplicationResource;
use App\Models\JobApplication;
use App\Services\JobApplicationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class JobApplicationController extends Controller
{
    public function __construct(private JobApplicationService $jobApplicationService) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->only(['archived', 'status', 'priority', 'applied_date']);

        return JobApplicationResource::collection(
            $this->jobApplicationService->filter($request->user(), $filters)
        );
    }

    public function store(StoreJobApplicationRequest $request): JobApplicationResource
    {
        $job = $this->jobApplicationService->create(
            $request->validated(),
            $request->user()
        );

        return new JobApplicationResource($job);
    }

    public function show(JobApplication $jobApplication): JobApplicationResource
    {
        Gate::authorize('view', $jobApplication);

        return $this->detailed($jobApplication);
    }

    public function update(UpdateJobApplicationRequest $request, JobApplication $jobApplication): JobApplicationResource
    {
        Gate::authorize('update', $jobApplication);

        $updatedJob = $this->jobApplicationService->update(
            $jobApplication,
            $request->safe()->except('delete_open_todos'),
            $request->has('delete_open_todos') ? $request->boolean('delete_open_todos') : null,
        );

        return $this->detailed($updatedJob);
    }

    public function batchUpdate(BatchUpdateJobApplicationsRequest $request): AnonymousResourceCollection
    {
        $jobs = $this->jobApplicationService->batchUpdate(
            $request->user(),
            $request->validated('ids'),
            $request->safe()->only(['status', 'is_archived', 'add_tag_ids', 'remove_tag_ids']),
            $request->has('delete_open_todos') ? $request->boolean('delete_open_todos') : null,
        );

        return JobApplicationResource::collection($jobs);
    }

    public function syncTags(SyncJobApplicationTagsRequest $request, JobApplication $jobApplication): JobApplicationResource
    {
        Gate::authorize('update', $jobApplication);

        $jobApplication->tags()->sync($request->validated('tag_ids'));

        return $this->detailed($jobApplication);
    }

    /**
     * The job page's shape: interviews, tags and open_todos_count, so it can replace its copy after a save.
     */
    private function detailed(JobApplication $jobApplication): JobApplicationResource
    {
        return new JobApplicationResource(
            $jobApplication->load(['interviews', 'tags'])->loadCount(JobApplication::openTodosCount())
        );
    }

    public function destroy(JobApplication $jobApplication): Response
    {
        Gate::authorize('delete', $jobApplication);

        $this->jobApplicationService->delete($jobApplication);

        return response()->noContent();
    }

    public function scheduleInterview(ScheduleInterviewRequest $request, JobApplication $jobApplication): InterviewResource
    {
        Gate::authorize('update', $jobApplication);

        $interview = $this->jobApplicationService->scheduleInterview(
            $jobApplication,
            $request->validated(),
            $request->user()
        );

        return new InterviewResource($interview);
    }

    public function export(): BinaryFileResponse
    {
        return $this->jobApplicationService->exportExcel();
    }

    public function import(JobApplicationImportRequest $request): JsonResponse
    {
        $result = $this->jobApplicationService->importExcel($request->validated('file'));

        if (! empty($result['failures'])) {
            return response()->json([
                'message' => 'Import completed with some rows skipped due to validation errors.',
                'failures' => $result['failures'],
            ]);
        }

        return response()->json(['message' => 'Import successful']);
    }

    public function stats(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->jobApplicationService->getStatsForUser($request->user())]);
    }
}
