<?php

namespace App\Http\Controllers;

use App\Http\Requests\Note\NoteRequest;
use App\Http\Resources\NoteResource;
use App\Models\Note;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class NotesController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return NoteResource::collection($request->user()->notes()->latest()->get());
    }

    public function store(NoteRequest $request): NoteResource
    {
        $note = $request->user()->notes()->create([
            'content' => '',
            'is_pinned' => false,
            ...$request->validated(),
        ]);

        return new NoteResource($note);
    }

    public function update(NoteRequest $request, Note $note): NoteResource
    {
        Gate::authorize('update', $note);

        $note->update($request->validated());

        return new NoteResource($note);
    }

    public function destroy(Note $note): Response
    {
        Gate::authorize('delete', $note);

        $note->delete();

        return response()->noContent();
    }
}
