<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\JobApplication;
use App\Models\Note;
use App\Models\Interview;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class JobApplicationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([], 200);
        }

        $query = $request->user()->jobApplications()
            ->where('is_archived', false)
            ->where('user_id', $user->id);

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
        ]);

        $job->update($data);

        return response()->json($job);
    }

    public function destroy($id)
    {
        $job = JobApplication::findOrFail($id);
        $job->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function show($id)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $job = $user
            ->jobApplications()
            ->with(['notes', 'interviews'])
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

    public function addNote(Request $request, $id)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $job = $user
            ->jobApplications()
            ->find($id);

        if (!$job) {
            return response()->json([
                'success' => false,
                'message' => 'JobApplication not found'
            ], 404);
        }

        $validated = $request->validate([
            'content' => 'required|string'
        ]);

        $note = $job->notes()->create([
            'user_id' => Auth::id(),
            'content' => $validated['content']
        ]);

        return response()->json([
            'success' => true,
            'data' => $note
        ], 201);
    }

    public function scheduleInterview(Request $request, $id)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $job = $user->jobApplications()->find($id);

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
}
