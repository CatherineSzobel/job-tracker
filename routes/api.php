<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\InterviewController;
use App\Http\Controllers\JobApplicationController;
use App\Http\Controllers\NotesController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProfileLinkController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\TodoController;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:register');
Route::post('/login', [AuthController::class, 'login']); // failed attempts are limited in LoginRequest
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);
Route::middleware('auth:sanctum')->get('/user', fn (Request $request) => new UserResource($request->user()));

// Protected routes. Single-record routes use route model binding;
// ownership is checked by the model's policy (app/Policies), which answers 404.
Route::middleware('auth:sanctum')->group(function () {
    // Registered before the resource so they aren't read as a {job_application} id
    Route::get('/job-applications/stats', [JobApplicationController::class, 'stats']);
    Route::get('/job-applications/export', [JobApplicationController::class, 'export']);
    Route::post('/job-applications/import', [JobApplicationController::class, 'import']);
    Route::apiResource('job-applications', JobApplicationController::class);
    Route::post('/job-applications/{job_application}/interviews', [JobApplicationController::class, 'scheduleInterview']);

    Route::apiResource('interviews', InterviewController::class)->only(['index', 'update', 'destroy']);
    Route::apiResource('todos', TodoController::class)->except('show');
    Route::apiResource('notes', NotesController::class)->except('show');

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::apiResource('profile/links', ProfileLinkController::class)
        ->except('show')
        ->parameters(['links' => 'link']);

    Route::get('/settings', [SettingsController::class, 'show']);
    Route::put('/settings', [SettingsController::class, 'update']);

    Route::put('/account/password', [AuthController::class, 'updatePassword']);
    Route::put('/account/goals', [AuthController::class, 'updateGoals']);
    Route::delete('/account', [AuthController::class, 'deleteAccount']);
});
