<?php

namespace App\Http\Controllers;

use App\Http\Requests\Note\NoteRequest;
use App\Models\Note;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class NotesController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json($request->user()->notes()->latest()->get());
    }

    public function store(NoteRequest $request): JsonResponse
    {
        $note = $request->user()->notes()->create([
            'content' => '',
            'is_pinned' => false,
            ...$request->validated(),
        ]);

        return response()->json($note);
    }

    public function update(NoteRequest $request, Note $note): JsonResponse
    {
        Gate::authorize('update', $note);

        $note->update($request->validated());

        return response()->json($note);
    }

    public function destroy(Note $note): JsonResponse
    {
        Gate::authorize('delete', $note);

        $note->delete();

        return response()->json(['message' => 'Note deleted successfully']);
    }
}
