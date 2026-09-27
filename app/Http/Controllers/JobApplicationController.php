<?php

namespace App\Http\Controllers;

use App\Http\Requests\JobApplication\JobApplicationImportRequest;
use App\Http\Requests\JobApplication\ScheduleInterviewRequest;
use App\Http\Requests\JobApplication\StoreJobApplicationRequest;
use App\Http\Requests\JobApplication\UpdateJobApplicationRequest;
use App\Models\JobApplication;
use App\Services\JobApplicationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class JobApplicationController extends Controller
{
    public function __construct(private JobApplicationService $jobApplicationService) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['archived', 'status', 'priority', 'applied_date']);
        $jobs = $this->jobApplicationService->filter($request->user(), $filters);

        return response()->json($jobs);
    }

    public function store(StoreJobApplicationRequest $request): JsonResponse
    {
        $job = $this->jobApplicationService->create(
            $request->validated(),
            $request->user()
        );

        return response()->json(['success' => true, 'data' => $job], 201);
    }

    public function show(JobApplication $jobApplication): JsonResponse
    {
        Gate::authorize('view', $jobApplication);

        return response()->json([
            'success' => true,
            'data' => $jobApplication->load('interviews'),
        ]);
    }

    public function update(UpdateJobApplicationRequest $request, JobApplication $jobApplication): JsonResponse
    {
        Gate::authorize('update', $jobApplication);

        $updatedJob = $this->jobApplicationService->update($jobApplication, $request->validated());

        return response()->json(['data' => $updatedJob]);
    }

    public function destroy(JobApplication $jobApplication): JsonResponse
    {
        Gate::authorize('delete', $jobApplication);

        $this->jobApplicationService->delete($jobApplication);

        return response()->json(['message' => 'JobApplication deleted successfully']);
    }

    public function scheduleInterview(ScheduleInterviewRequest $request, JobApplication $jobApplication): JsonResponse
    {
        Gate::authorize('update', $jobApplication);

        $interview = $this->jobApplicationService->scheduleInterview(
            $jobApplication,
            $request->validated(),
            $request->user()
        );

        return response()->json(['success' => true, 'data' => $interview], 201);
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
                'success' => true,
                'failures' => $result['failures'],
                'message' => 'Import completed with some rows skipped due to validation errors.',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Import successful',
        ]);
    }

    public function stats(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->jobApplicationService->getStatsForUser($request->user())]);
    }
}
