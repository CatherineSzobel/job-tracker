<?php

namespace App\Http\Controllers;

use App\Http\Requests\Todo\TodoStoreRequest;
use App\Http\Requests\Todo\TodoUpdateRequest;
use App\Http\Resources\TodoResource;
use App\Models\JobApplication;
use App\Models\Todo;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class TodoController extends Controller
{
    /**
     * Just what the to-do lists show about the linked application.
     */
    private const APPLICATION = 'jobApplication:'.JobApplication::SUMMARY_COLUMNS;

    /**
     * Open before done, then due date (undated last), then newest. ?job_application_id= limits to one application.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $todos = $request->user()->todos()
            ->with(self::APPLICATION)
            ->when($request->filled('job_application_id'), fn ($query) => $query->where('job_application_id', $request->integer('job_application_id')))
            ->orderBy('done')
            ->orderByRaw('due_date is null')
            ->orderBy('due_date')
            ->latest()
            ->latest('id')
            ->get();

        return TodoResource::collection($todos);
    }

    public function store(TodoStoreRequest $request): TodoResource
    {
        $todo = $request->user()->todos()->create($request->validated());

        return new TodoResource($todo->load(self::APPLICATION));
    }

    public function update(TodoUpdateRequest $request, Todo $todo): TodoResource
    {
        Gate::authorize('update', $todo);

        $todo->update($request->validated());

        return new TodoResource($todo->load(self::APPLICATION));
    }

    public function destroy(Todo $todo): Response
    {
        Gate::authorize('delete', $todo);

        $todo->delete();

        return response()->noContent();
    }
}
