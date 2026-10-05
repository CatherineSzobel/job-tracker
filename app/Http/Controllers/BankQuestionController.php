<?php

namespace App\Http\Controllers;

use App\Enums\BankQuestionCategory;
use App\Http\Requests\BankQuestion\BankQuestionStoreRequest;
use App\Http\Requests\BankQuestion\BankQuestionUpdateRequest;
use App\Http\Resources\BankQuestionResource;
use App\Models\BankQuestion;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class BankQuestionController extends Controller
{
    /**
     * The user's bank, newest first. ?category= narrows it; an unknown category is ignored.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $category = BankQuestionCategory::tryFrom((string) $request->query('category'));

        return BankQuestionResource::collection(
            $request->user()->bankQuestions()
                ->withCount('interviews')
                ->when($category, fn ($query) => $query->where('category', $category))
                ->latest()
                ->latest('id')
                ->get()
        );
    }

    public function store(BankQuestionStoreRequest $request): BankQuestionResource
    {
        return new BankQuestionResource($request->user()->bankQuestions()->create($request->validated()));
    }

    public function update(BankQuestionUpdateRequest $request, BankQuestion $bankQuestion): BankQuestionResource
    {
        Gate::authorize('update', $bankQuestion);

        $bankQuestion->update($request->validated());

        return new BankQuestionResource($bankQuestion);
    }

    /**
     * Its links to interviews go with it (cascade).
     */
    public function destroy(BankQuestion $bankQuestion): Response
    {
        Gate::authorize('delete', $bankQuestion);

        $bankQuestion->delete();

        return response()->noContent();
    }
}
