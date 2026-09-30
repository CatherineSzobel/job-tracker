<?php

namespace App\Http\Controllers;

use App\Http\Requests\Profile\ProfileUpdateRequest;
use App\Http\Resources\ProfileResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request): ProfileResource|JsonResponse
    {
        $profile = $request->user()->profile;

        return $profile
            ? new ProfileResource($profile)
            : response()->json(['data' => null]);
    }

    public function update(ProfileUpdateRequest $request): ProfileResource
    {
        $profile = $request->user()->profile;
        $profile->update($request->validated());

        return new ProfileResource($profile);
    }
}
