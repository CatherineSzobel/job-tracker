<?php

namespace App\Http\Controllers;

use App\Http\Requests\Interview\InterviewPrepTemplateRequest;
use App\Models\User;
use App\Services\InterviewPrepService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * The user's interview prep checklist template (Settings). No custom template means the default.
 */
class InterviewPrepTemplateController extends Controller
{
    public function __construct(private InterviewPrepService $interviewPrep) {}

    public function show(Request $request): JsonResponse
    {
        return $this->templateResponse($request->user());
    }

    public function update(InterviewPrepTemplateRequest $request): JsonResponse
    {
        $request->user()->update(['prep_template' => $request->items()]);

        return $this->templateResponse($request->user());
    }

    public function destroy(Request $request): JsonResponse
    {
        $request->user()->update(['prep_template' => null]);

        return $this->templateResponse($request->user());
    }

    private function templateResponse(User $user): JsonResponse
    {
        return response()->json(['data' => [
            'items' => $this->interviewPrep->templateFor($user),
            'is_default' => $user->prep_template === null,
        ]]);
    }
}
