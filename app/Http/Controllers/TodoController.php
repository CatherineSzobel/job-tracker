<?php
// app/Http/Controllers/TodoController.php
namespace App\Http\Controllers;

use App\Models\Todo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TodoController extends Controller
{
    public function index(Request $request)
    {

        return response()->json(
            $request->user()->todos()->latest()->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'text' => 'required|string|max:255',
        ]);

        return Todo::create([
            'user_id' => request()->user()->id(),
            'text' => $data['text'],
        ]);
    }

    public function update(Request $request, Todo $todo)
    {
        abort_if($todo->user_id !== $request->user()->id(), 403);

        $data = $request->validate([
            'text' => 'sometimes|string|max:255',
            'done' => 'sometimes|boolean',
        ]);

        $todo->update($data);
        return $todo;
    }

    public function destroy(Request $request, Todo $todo)
    {
        abort_if($todo->user_id !== $request->user()->id(), 403);

        $todo->delete();
        return response()->noContent();
    }
}
