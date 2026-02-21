<?php

use App\Http\Controllers\InterviewController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\JobApplicationController;
use App\Http\Controllers\NotesController;
use App\Http\Controllers\ProfileLinkController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TodoController;
use Illuminate\Http\Request;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return response()->json($request->user() ?? null);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/job-applications', [JobApplicationController::class, 'index']);
    Route::get('/job-applications/stats', [JobApplicationController::class, 'stats']);
    Route::post('/job-applications', [JobApplicationController::class, 'store']);
    Route::get('/job-applications/export', [JobApplicationController::class, 'export']);
    Route::post('/job-applications/import', [JobApplicationController::class, 'import']);
    Route::get('/job-applications/{id}', [JobApplicationController::class, 'show'])
        ->whereNumber('id');
    Route::put('/job-applications/{id}', [JobApplicationController::class, 'update'])
        ->whereNumber('id');
    Route::delete('/job-applications/{id}', [JobApplicationController::class, 'destroy'])
        ->whereNumber('id');
    Route::post('/job-applications/{id}/interviews', [JobApplicationController::class, 'scheduleInterview'])
        ->whereNumber('id');

    Route::get('/interviews', [InterviewController::class, 'index']);
    Route::put('/interviews/{id}', [InterviewController::class, 'update'])
        ->whereNumber('id');
    Route::delete('/interviews/{id}', [InterviewController::class, 'destroy'])
        ->whereNumber('id');

    Route::get('/todos', [TodoController::class, 'index']);
    Route::post('/todos', [TodoController::class, 'store']);
    Route::put('/todos/{todo}', [TodoController::class, 'update'])->whereNumber('todo');
    Route::delete('/todos/{id}', [TodoController::class, 'destroy'])
        ->whereNumber('id');

    Route::get('/notes', [NotesController::class, 'index']);
    Route::post('/notes', [NotesController::class, 'store']);
    Route::put('/notes/{note}', [NotesController::class, 'update'])->whereNumber('note');
    Route::delete('/notes/{note}', [NotesController::class, 'destroy'])->whereNumber('note');

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);

    Route::post('/profile/links', [ProfileLinkController::class, 'store']);
    Route::put('/profile/links/{link}', [ProfileLinkController::class, 'update']);
    Route::delete('/profile/links/{link}', [ProfileLinkController::class, 'destroy']);
});
