<?php

namespace App\Http\Controllers;

use App\Http\Requests\Todo\TodoStoreRequest;
use App\Http\Requests\Todo\TodoUpdateRequest;
use App\Http\Resources\TodoResource;
use App\Models\Todo;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class TodoController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return TodoResource::collection($request->user()->todos()->latest()->get());
    }

    public function store(TodoStoreRequest $request): TodoResource
    {
        return new TodoResource($request->user()->todos()->create($request->validated()));
    }

    public function update(TodoUpdateRequest $request, Todo $todo): TodoResource
    {
        Gate::authorize('update', $todo);

        $todo->update($request->validated());

        return new TodoResource($todo);
    }

    public function destroy(Todo $todo): Response
    {
        Gate::authorize('delete', $todo);

        $todo->delete();

        return response()->noContent();
    }
}
