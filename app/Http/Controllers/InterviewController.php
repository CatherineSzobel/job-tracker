<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Interview;
use App\Models\JobApplication;
use Illuminate\Http\Request;

class InterviewController extends Controller
{
    public function index(Request $request)
    {
        return Interview::with('jobApplication:id,company_name,position')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get()
            ->map(fn($i) => [
                'id' => $i->id,
                'job_id' => $i->job_application_id,
                'type' => $i->type,
                'interview_date' => $i->interview_date,
                'location' => $i->location,
                'notes' => $i->notes,
                'job_title' => "{$i->jobApplication->company_name} - {$i->jobApplication->position}",
            ]);
    }

    public function update(Request $request, Interview $interview)
    {
        $data = $request->validate([
            'interview_date' => 'sometimes|date',
            'type' => 'sometimes|string',
            'location' => 'sometimes|string',
            'notes' => 'sometimes|string|nullable',
        ]);

        $interview->update($data);

        return response()->json($interview);
    }


    public function destroy(Interview $interview)
    {
        $interview->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
