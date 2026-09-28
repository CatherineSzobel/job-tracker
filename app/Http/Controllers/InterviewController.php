<?php

namespace App\Http\Controllers;

use App\Http\Requests\Interview\InterviewUpdateRequest;
use App\Http\Resources\InterviewResource;
use App\Models\Interview;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class InterviewController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $interviews = Interview::with('job:id,company_name,position')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return InterviewResource::collection($interviews);
    }

    public function update(InterviewUpdateRequest $request, Interview $interview): InterviewResource
    {
        Gate::authorize('update', $interview);

        $interview->update($request->validated());

        return new InterviewResource($interview->load('job:id,company_name,position'));
    }

    public function destroy(Interview $interview): Response
    {
        Gate::authorize('delete', $interview);

        $interview->delete();

        return response()->noContent();
    }
}
