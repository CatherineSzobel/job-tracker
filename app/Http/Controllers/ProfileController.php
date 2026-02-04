<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\ProfileUpdateRequest;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $profile = $request->user()
            ->profile()
            ->with('links')
            ->first();

        return response()->json(['data' => $profile]);
    }

    public function update(ProfileUpdateRequest $request): JsonResponse
    {
        $profile = $request->user()->profile;

        $data = $request->validated();
        $profile->update($data);

        return response()->json(['data' => $profile->load('links')]);
    }
}
