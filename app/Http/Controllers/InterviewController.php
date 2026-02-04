<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\Interview\InterviewUpdateRequest;
use App\Models\Interview;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Symfony\Component\HttpFoundation\JsonResponse;

class InterviewController extends Controller
{
    public function index(Request $request):Collection
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

    public function update(InterviewUpdateRequest $request, Interview $interview): JsonResponse
    {
        $data = $request->validated();
        $interview->update($data);

        return response()->json($interview);
    }


    public function destroy(Interview $interview): JsonResponse
    {

        $interview->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
