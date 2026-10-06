<?php

namespace App\Http\Controllers;

use App\Http\Requests\Interview\BatchDeleteInterviewsRequest;
use App\Http\Requests\Interview\InterviewBankQuestionsSyncRequest;
use App\Http\Requests\Interview\InterviewPrepUpdateRequest;
use App\Http\Requests\Interview\InterviewUpdateRequest;
use App\Http\Resources\InterviewDetailResource;
use App\Http\Resources\InterviewResource;
use App\Models\Interview;
use App\Models\JobApplication;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class InterviewController extends Controller
{
    /**
     * Only the job fields the interview pages show.
     */
    private const JOB = 'job:'.JobApplication::SUMMARY_COLUMNS;

    public function index(Request $request): AnonymousResourceCollection
    {
        $interviews = $request->user()->interviews()
            ->with(self::JOB)
            ->latest()
            ->get();

        return InterviewResource::collection($interviews);
    }

    public function show(Interview $interview): InterviewDetailResource
    {
        Gate::authorize('view', $interview);

        return new InterviewDetailResource($interview->load([self::JOB, 'bankQuestions']));
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

        return new InterviewDetailResource($interview->load(self::JOB));
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

        return new InterviewDetailResource($interview->load([self::JOB, 'bankQuestions']));
    }

    public function update(InterviewUpdateRequest $request, Interview $interview): InterviewResource
    {
        Gate::authorize('update', $interview);

        $interview->update($request->validated());

        return new InterviewResource($interview->load(self::JOB));
    }

    public function destroy(Interview $interview): Response
    {
        Gate::authorize('delete', $interview);

        $interview->delete();

        return response()->noContent();
    }

    /**
     * Deletes several of the user's interviews: all of them, or none (404) when any id isn't the
     * user's, like the applications batch. Prep, debrief and bank-question links go with them.
     */
    public function batchDestroy(BatchDeleteInterviewsRequest $request): Response
    {
        $ids = $request->validated('ids');

        DB::transaction(function () use ($request, $ids) {
            $interviews = $request->user()->interviews()->whereKey($ids);
            abort_if($interviews->count() !== count($ids), 404);

            $interviews->delete();
        });

        return response()->noContent();
    }
}
