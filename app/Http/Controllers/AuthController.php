<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\ChangeEmailRequest;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\DeleteAccountRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\UpdateGoalsRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

// Session (cookie) auth for the SPA, so the 'web' guard is named explicitly throughout
class AuthController extends Controller
{
    public function register(RegisterRequest $request): UserResource
    {
        // User and profile are created together or not at all
        $user = DB::transaction(function () use ($request) {
            $user = User::create($request->validated()); // password hashed by the model's 'hashed' cast

            $user->profile()->create([
                'name' => $user->name,
                'title' => '',
                'bio' => '',
                'location' => '',
            ]);

            return $user;
        });

        Auth::guard('web')->login($user);

        return new UserResource($user); // 201, as the user was just created
    }

    // Credentials check and failed-attempt rate limiting happen in LoginRequest::authenticate()
    public function login(LoginRequest $request): UserResource
    {
        $request->authenticate();
        $request->session()->regenerate();

        return new UserResource(Auth::guard('web')->user());
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    // Demo-account and current-password checks happen in ChangePasswordRequest
    public function updatePassword(ChangePasswordRequest $request): JsonResponse
    {
        $request->user()->update([
            'password' => $request->validated('password'), // hashed by the model's 'hashed' cast
        ]);

        return response()->json([
            'message' => 'Password updated successfully',
        ]);
    }

    // Demo-account, current-password and unique-email checks happen in ChangeEmailRequest
    public function updateEmail(ChangeEmailRequest $request): UserResource
    {
        $request->user()->update(['email' => $request->validated('email')]);

        return new UserResource($request->user());
    }

    public function updateGoals(UpdateGoalsRequest $request): UserResource
    {
        $request->user()->update($request->validated());

        return new UserResource($request->user());
    }

    // Demo-account and password checks happen in DeleteAccountRequest
    public function deleteAccount(DeleteAccountRequest $request): JsonResponse
    {
        $user = $request->user();

        // Log out first: logout() saves a new remember token, which would re-insert a deleted user
        Auth::guard('web')->logout();
        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Account deleted successfully',
        ]);
    }
}
