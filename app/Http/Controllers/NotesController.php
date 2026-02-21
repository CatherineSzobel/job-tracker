<?php
// app/Http/Controllers/NotesController.php
namespace App\Http\Controllers;

use App\Models\Note;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NotesController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notes = $request->user()->notes()->latest()->get();
        return response()->json($notes);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'is_pinned' => 'boolean',
        ]);

        $note = Note::create([
            'user_id' => $request->user()->id,
            'title' => $data['title'],
            'content' => $data['content'] ?? '',
            'is_pinned' => $data['is_pinned'] ?? false,
        ]);

        return response()->json($note);
    }

    public function update(Request $request, Note $note): JsonResponse
    {
        if ($note->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $data = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'is_pinned' => 'boolean',
        ]);

        $note->update($data);

        return response()->json($note);
    }

    public function destroy(Request $request, Note $note): JsonResponse
    {
        if ($note->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $note->delete();

        return response()->json(['message' => 'Note deleted successfully']);
    }
}
