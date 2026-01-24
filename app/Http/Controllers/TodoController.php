<?php
// app/Http/Controllers/TodoController.php
namespace App\Http\Controllers;

use App\Models\Todo;
use Illuminate\Http\Request;

class TodoController extends Controller
{
    public function index()
    {
        return auth()->user()->todos;
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'text' => 'required|string|max:255',
        ]);

        return Todo::create([
            'user_id' => auth()->id(),
            'text' => $data['text'],
        ]);
    }

    public function update(Request $request, Todo $todo)
    {

        $data = $request->validate([
            'text' => 'sometimes|string|max:255',
            'done' => 'sometimes|boolean',
        ]);

        $todo->update($data);
        return $todo;
    }

    public function destroy(Todo $todo)
    {
        $todo->delete();
        return response()->noContent();
    }
}
