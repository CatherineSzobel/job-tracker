<?php

namespace App\Http\Controllers;

use App\Http\Resources\ReminderApplicationResource;
use App\Http\Resources\TodoResource;
use App\Models\JobApplication;
use App\Services\ReminderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class ReminderController extends Controller
{
    public function __construct(private ReminderService $reminderService) {}

    /**
     * Due applications and to-dos; both empty when in-app reminders are off.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->reminders_in_app) {
            return response()->json(['data' => ['applications' => [], 'todos' => []]]);
        }

        $due = $this->reminderService->dueFor($user);

        return response()->json(['data' => [
            'applications' => ReminderApplicationResource::collection($due['applications']),
            'todos' => TodoResource::collection($due['todos']),
        ]]);
    }

    public function dismiss(JobApplication $jobApplication): Response
    {
        Gate::authorize('update', $jobApplication);

        $this->reminderService->dismiss($jobApplication);

        return response()->noContent();
    }
}
