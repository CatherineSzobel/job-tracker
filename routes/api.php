<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BankQuestionController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\InterviewController;
use App\Http\Controllers\InterviewPrepTemplateController;
use App\Http\Controllers\JobApplicationController;
use App\Http\Controllers\NotesController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReminderController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\TagController;
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
    Route::patch('/job-applications/batch', [JobApplicationController::class, 'batchUpdate']);
    Route::apiResource('job-applications', JobApplicationController::class);
    Route::post('/job-applications/{job_application}/interviews', [JobApplicationController::class, 'scheduleInterview']);
    Route::put('/job-applications/{job_application}/tags', [JobApplicationController::class, 'syncTags']);
    Route::put('/job-applications/{job_application}/documents', [DocumentController::class, 'syncForApplication']);
    Route::post('/job-applications/{job_application}/dismiss-reminder', [ReminderController::class, 'dismiss']);

    // Registered before the resource so "batch" isn't read as an {interview} id
    Route::delete('/interviews/batch', [InterviewController::class, 'batchDestroy']);
    Route::apiResource('interviews', InterviewController::class)->only(['index', 'show', 'update', 'destroy']);
    Route::put('/interviews/{interview}/prep', [InterviewController::class, 'updatePrep']);
    Route::put('/interviews/{interview}/bank-questions', [InterviewController::class, 'syncBankQuestions']);
    Route::apiResource('bank-questions', BankQuestionController::class)->except('show');
    Route::apiResource('todos', TodoController::class)->except('show');
    Route::apiResource('notes', NotesController::class)->except('show');
    Route::apiResource('tags', TagController::class)->except('show');
    Route::get('/documents/{document}/download', [DocumentController::class, 'download']);
    Route::post('/documents/{document}/restore', [DocumentController::class, 'restore']);
    Route::apiResource('documents', DocumentController::class)->except('show');

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);

    Route::get('/settings', [SettingsController::class, 'show']);
    Route::put('/settings', [SettingsController::class, 'update']);
    Route::get('/reminders', [ReminderController::class, 'index']);

    Route::get('/interview-prep-template', [InterviewPrepTemplateController::class, 'show']);
    Route::put('/interview-prep-template', [InterviewPrepTemplateController::class, 'update']);
    Route::delete('/interview-prep-template', [InterviewPrepTemplateController::class, 'destroy']);

    Route::put('/account/password', [AuthController::class, 'updatePassword']);
    Route::put('/account/email', [AuthController::class, 'updateEmail']);
    Route::put('/account/goals', [AuthController::class, 'updateGoals']);
    Route::delete('/account', [AuthController::class, 'deleteAccount']);
});
