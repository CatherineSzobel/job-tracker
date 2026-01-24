<?php

use App\Http\Controllers\InterviewController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\JobApplicationController;
use App\Http\Controllers\LinkController;
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
    Route::post('/job-applications', [JobApplicationController::class, 'store']);
    Route::get('/job-applications/{id}', [JobApplicationController::class, 'show']);
    Route::put('/job-applications/{id}', [JobApplicationController::class, 'update']);
    Route::delete('/job-applications/{id}', [JobApplicationController::class, 'destroy']);
    Route::post('/job-applications/{id}/notes', [JobApplicationController::class, 'addNote']);
    Route::post('/job-applications/{id}/interviews', [JobApplicationController::class, 'scheduleInterview']);

    Route::get('/interviews', [InterviewController::class, 'index']);
    Route::put('/interviews/{id}', [InterviewController::class, 'update']);
    Route::delete('/interviews/{id}', [InterviewController::class, 'destroy']);

});
