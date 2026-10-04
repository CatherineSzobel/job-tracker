<?php

namespace App\Http\Controllers;

use App\Http\Requests\Interview\InterviewBankQuestionsSyncRequest;
use App\Http\Requests\Interview\InterviewPrepUpdateRequest;
use App\Http\Requests\Interview\InterviewUpdateRequest;
use App\Http\Resources\InterviewDetailResource;
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

    public function show(Interview $interview): InterviewDetailResource
    {
        Gate::authorize('view', $interview);

        return new InterviewDetailResource($interview->load(['job:id,company_name,position', 'bankQuestions']));
    }

    /**
     * Replaces the prep document, rating and debrief notes (the page autosaves the whole document).
     */
    public function updatePrep(InterviewPrepUpdateRequest $request, Interview $interview): InterviewDetailResource
    {
        Gate::authorize('update', $interview);

        $interview->update([
            'prep' => $request->safe()->only(array_keys(Interview::EMPTY_PREP)),
            'rating' => $request->validated('rating'),
            'debrief_notes' => $request->validated('debrief_notes'),
        ]);

        return new InterviewDetailResource($interview->load('job:id,company_name,position'));
    }

    /**
     * Replaces the interview's linked bank questions; their order is the order sent.
     */
    public function syncBankQuestions(InterviewBankQuestionsSyncRequest $request, Interview $interview): InterviewDetailResource
    {
        Gate::authorize('update', $interview);

        $interview->bankQuestions()->sync(
            collect($request->validated('questions'))
                ->mapWithKeys(fn (array $question, int $position) => [
                    $question['id'] => ['note' => $question['note'] ?? null, 'position' => $position],
                ])
                ->all()
        );

        return new InterviewDetailResource($interview->load(['job:id,company_name,position', 'bankQuestions']));
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
