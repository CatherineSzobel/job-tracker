<?php

namespace App\Http\Controllers;

use App\Models\JobApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Exports\JobApplicationsExport;
use App\Imports\JobApplicationsImport;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Validators\ValidationException;

class JobApplicationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([], 200);
        }

        $query = $user->jobApplications();

        $request->has('archived') && $request->boolean('archived')
            ? $query->where('is_archived', true) : $query->where('is_archived', false);


        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->has('applied_date')) {
            $query->whereDate('applied_date', $request->applied_date);
        }

        return $query->with('interviews')->get();
    }

    public function store(Request $request)
    {

        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'status' => 'sometimes|string|in:applied,interviewing,offered,rejected',
            'priority' => 'nullable|string|max:50',
            'job_link' => 'nullable|url',
            'description' => 'nullable|string',
            'notes' => 'nullable|string'
        ]);
        $validated['applied_date'] = now()->toDateString();
        $job = $request->user()->jobApplications()->create($validated);

        return response()->json([
            'success' => true,
            'data' => $job
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $job = JobApplication::findOrFail($id);

        $data = $request->validate([
            'status' => 'sometimes|string|in:applied,interview,offer,rejected',
            'is_archived' => 'sometimes|boolean',
            'priority' => 'sometimes|string|max:50',
            'notes' => 'sometimes|string|nullable',
            'location' => 'sometimes|string|max:255',
            'job_link' => 'sometimes|url|nullable',
            'company_name' => 'sometimes|string|max:255',
            'position' => 'sometimes|string|max:255',
        ]);

        $job->update($data);

        return response()->json([
            'data' => $job
        ]);
    }

    public function destroy($id)
    {
        JobApplication::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function show($id)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $job = $user
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

    public function scheduleInterview(Request $request, $id)
    {
        $job = $request->user()->jobApplications()->find($id);

        if (!$job) {
            return response()->json([
                'success' => false,
                'message' => 'JobApplication not found'
            ], 404);
        }

        $validated = $request->validate([
            'interview_date' => 'required|date',
            'type' => 'sometimes|in:phone,online,onsite',
            'location' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $interview = $job->interviews()->create(array_merge($validated, [
            'user_id' => Auth::id()
        ]));

        return response()->json([
            'success' => true,
            'data' => $interview
        ], 201);
    }

    public function export(Request $request)
    {
        return Excel::download(new JobApplicationsExport, 'job-applications.xlsx');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls',
        ]);

        $uploaded = $request->file('file');

        // Check ZIP extension for Excel
        $ext = strtolower($uploaded->getClientOriginalExtension());
        if (in_array($ext, ['xlsx', 'xls']) 
            && !class_exists('ZipArchive')) {

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
