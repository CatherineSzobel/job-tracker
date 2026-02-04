<?php

namespace App\Http\Controllers;

use App\Models\JobApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Exports\JobApplicationsExport;
use App\Http\Requests\JobApplication\ScheduleInterviewRequest;
use App\Http\Requests\JobApplication\StoreJobApplicationRequest;
use App\Http\Requests\JobApplication\UpdateJobApplicationRequest;
use App\Imports\JobApplicationsImport;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Validators\ValidationException;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\JsonResponse;

class JobApplicationController extends Controller
{
    public function index(Request $request): Collection
    {
        $query = $request->user()
            ->jobApplications()
            ->with('interviews');

        $query->where(
            'is_archived',
            $request->boolean('archived')
        );

        if ($request->filled('status')) {
            $query->where('status', $request['status']);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request['priority']);
        }

        if ($request->filled('applied_date')) {
            $query->whereDate('applied_date', $request['applied_date']);
        }

        return $query->get();
    }

    public function store(StoreJobApplicationRequest $request): JsonResponse
    {

        $validated = $request->validated();
        $validated['applied_date'] = now()->toDateString();
        $job = $request->user()->jobApplications()->create($validated);

        return response()->json([
            'success' => true,
            'data' => $job
        ], 201);
    }

    public function update(UpdateJobApplicationRequest $request, int $id): JsonResponse
    {
        $job = JobApplication::findOrFail($id);
        $job->update($request->validated());

        return response()->json([
            'data' => $job
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        JobApplication::findOrFail($id)->delete();
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

    public function scheduleInterview(ScheduleInterviewRequest $request, $id): JsonResponse
    {
        $job = $request->user()->jobApplications()->find($id);

        if (!$job) {
            return response()->json([
                'success' => false,
                'message' => 'JobApplication not found'
            ], 404);
        }

        $interview = $job->interviews()->create(array_merge($request->validated(), [
            'user_id' => $request->user()->id
        ]));

        return response()->json([
            'success' => true,
            'data' => $interview
        ], 201);
    }

    public function export(): BinaryFileResponse
    {
        return Excel::download(new JobApplicationsExport, 'job-applications.xlsx');
    }

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls',
        ]);

        $uploaded = $request->file('file');

        // Check ZIP extension for Excel
        $ext = strtolower($uploaded->getClientOriginalExtension());
        if (
            in_array($ext, ['xlsx', 'xls'])
            && !class_exists('ZipArchive')
        ) {

            return response()->json([
                'success' => false,
                'message' => 'PHP zip extension is required to import Excel files. Please enable ext-zip.',
            ], 500);
        }

        $import = new JobApplicationsImport;

        try {
            Excel::import($import, $uploaded);
        } catch (ValidationException $e) {
            // Catch skipped/failed rows
            $failures = $e->failures();
            return response()->json([
                'success' => true,
                'failures' => array_map(function ($f) {
                    return [
                        'row' => $f->row(),
                        'attribute' => $f->attribute(),
                        'errors' => $f->errors(),
                        'values' => $f->values(),
                    ];
                }, $failures),
                'message' => 'Import completed with some rows skipped due to validation errors.'
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Import successful',
        ]);
    }
}
