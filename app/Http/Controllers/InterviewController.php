<?php

namespace App\Http\Controllers;

use App\Http\Requests\Interview\InterviewUpdateRequest;
use App\Models\Interview;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class InterviewController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $interviews = Interview::with('job:id,company_name,position')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json($interviews);
    }

    public function update(InterviewUpdateRequest $request, Interview $interview): JsonResponse
    {
        Gate::authorize('update', $interview);

        $interview->update($request->validated());

        return response()->json($interview->load('job:id,company_name,position'));
    }

    public function destroy(Interview $interview): JsonResponse
    {
        Gate::authorize('delete', $interview);

        $interview->delete();

        return response()->json(['message' => 'Interview deleted successfully']);
    }
}
