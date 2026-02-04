<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\JsonResponse;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $user->profile()->create([
            'user_id' => $user->id,
            'name' => $user->name,
            'title' => '',
            'bio' => '',
            'location' => '',
        ]);
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email
            ],
            'token' => $token
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid credentials',
            ], 401);
        }
        $user = $request->user();

        return response()->json([
            'user' => $user->only('id', 'name', 'email'),
            'token' => $user->createToken('auth_token')->plainTextToken,
        ]);
    }

    public function logout(LoginRequest $request): JsonResponse
    {
        $request->user()->currentAccessToken->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }
}
