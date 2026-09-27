<?php

namespace App\Http\Controllers;

use App\Http\Requests\Todo\TodoStoreRequest;
use App\Http\Requests\Todo\TodoUpdateRequest;
use App\Models\Todo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class TodoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(
            $request->user()->todos()->latest()->get()
        );
    }

    public function store(TodoStoreRequest $request): JsonResponse
    {
        return response()->json(
            $request->user()->todos()->create($request->validated())
        );
    }

    public function update(TodoUpdateRequest $request, Todo $todo): JsonResponse
    {
        Gate::authorize('update', $todo);

        $todo->update($request->validated());

        return response()->json($todo);
    }

    public function destroy(Todo $todo): JsonResponse
    {
        Gate::authorize('delete', $todo);

        $todo->delete();

        return response()->json(['message' => 'Todo deleted successfully']);
    }
}
