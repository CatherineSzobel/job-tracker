<?php
// app/Http/Controllers/TodoController.php
namespace App\Http\Controllers;

use App\Http\Requests\Todo\TodoStoreRequest;
use App\Http\Requests\Todo\TodoUpdateRequest;
use App\Models\Todo;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

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
        $data = $request->validated();

        return response()->json(Todo::create([
            'user_id' => $request->user()->id,
            'text' => $data['text'],
        ]));
    }

    public function update(TodoUpdateRequest $request, Todo $todo): JsonResponse
    {
        if ($todo->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $todo->update($request->validated());
        return response()->json($todo);
    }

    public function destroy(int $id): JsonResponse
    {
        Todo::findOrFail($id)->delete();
        return response()->json(['message' => 'Todo deleted successfully']);
    }
}
