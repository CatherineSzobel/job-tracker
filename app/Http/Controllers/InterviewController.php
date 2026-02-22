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
    public function index(Request $request): JsonResponse
    {
        $interview = Interview::with([
            'job:id,company_name,position'
        ])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json(
            $interview->load('job:id,company_name,position')
        );
    }

    public function update(InterviewUpdateRequest $request, Interview $interview): JsonResponse
    {
        if ($interview->user_id !== $request->user()->id) {
            abort(403);
        }

        $interview->update($request->validated());

        return response()->json($interview->load('job:id,company_name,position'));
    }


    public function destroy(Request $request, int $id): JsonResponse
    {
        $interview = Interview::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $interview->delete();

        return response()->json(['message' => 'Interview deleted successfully']);
    }
}
