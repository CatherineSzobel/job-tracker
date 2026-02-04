<?php

namespace App\Http\Controllers;

use App\Http\Requests\JobApplication\JobApplicationImportRequest;
use App\Models\JobApplication;
use App\Services\JobApplicationService;

use Illuminate\Http\Request;
use App\Http\Requests\JobApplication\ScheduleInterviewRequest;
use App\Http\Requests\JobApplication\StoreJobApplicationRequest;
use App\Http\Requests\JobApplication\UpdateJobApplicationRequest;


use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\JsonResponse;

class JobApplicationController extends Controller
{
    public function __construct(private JobApplicationService $jobApplicationService) {}
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['archived', 'status', 'priority', 'applied_date']);
        $jobs = $this->jobApplicationService->filter($request->user(), $filters);
        return response()->json($jobs);
    }

    public function store(StoreJobApplicationRequest $request)
    {
        $job = $this->jobApplicationService->create(
            $request->validated(),
            $request->user()
        );

        return response()->json(['success' => true, 'data' => $job], 201);
    }

    public function update(UpdateJobApplicationRequest $request, int $id): JsonResponse
    {
        $job = JobApplication::findOrFail($id);
        $updatedJob = $this->jobApplicationService->update($job, $request->validated());

        return response()->json(['data' => $updatedJob]);
    }

    public function destroy(int $id): JsonResponse
    {
        $job = JobApplication::findOrFail($id);
        $this->jobApplicationService->delete($job);

        return response()->json(['message' => 'Deleted']);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $job = $request->user()
            ->jobApplications()
            ->with(['interviews'])
            ->find($id);

        if (!$job) {
            return response()->json([
                'success' => false,
                'message' => 'JobApplication not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $job
        ]);
    }

    public function scheduleInterview(ScheduleInterviewRequest $request, int $id)
    {
        $job = $request->user()->jobApplications()->find($id);

        if (!$job) {
            return response()->json([
                'success' => false,
                'message' => 'JobApplication not found'
            ], 404);
        }
        $interview = $this->jobApplicationService->scheduleInterview(
            $job,
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
        $validated = $request->validated();
        $file = $validated['file'];

        $result = $this->jobApplicationService->importExcel($file);

        if (!empty($result['failures'])) {
            return response()->json([
                'success' => true,
                'failures' => $result['failures'],
                'message' => 'Import completed with some rows skipped due to validation errors.'
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Import successful'
        ]);
    }
}
