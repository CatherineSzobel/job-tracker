<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use Illuminate\Http\Request;
use App\Models\Note;
use Illuminate\Support\Facades\Auth;

class NoteController extends Controller
{
    public function index(JobApplication $jobApplication)
    {
        return $jobApplication->notes()->get();
    }

    public function store(Request $request, JobApplication $jobApplication)
    {
        $data = $request->validate([
            'content' => 'required|string'
        ]);

        $note = $jobApplication->notes()->create([
            'user_id' => $request->user()->id,
            'content' => $data['content']
        ]);

        return response()->json($note, 201);
    }

    public function update(Request $request, Note $note)
    {
        $note->update($request->all());
        return response()->json($note);
    }

    public function destroy(Note $note)
    {
        $note->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
