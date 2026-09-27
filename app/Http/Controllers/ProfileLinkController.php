<?php

namespace App\Http\Controllers;

use App\Http\Requests\Profile\ProfileLinkStoreRequest;
use App\Http\Requests\Profile\ProfileLinkUpdateRequest;
use App\Models\ProfileLink;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ProfileLinkController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $request->user()->profile?->links ?? [],
        ]);
    }

    public function store(ProfileLinkStoreRequest $request): JsonResponse
    {
        $profile = $request->user()->profile;

        if (! $profile) {
            return response()->json(['message' => 'Profile not found'], 404);
        }

        $link = $profile->links()->create($request->validated());

        return response()->json(['data' => $link], 201);
    }

    public function update(ProfileLinkUpdateRequest $request, ProfileLink $link): JsonResponse
    {
        Gate::authorize('update', $link);

        $link->update($request->validated());

        return response()->json(['data' => $link]);
    }

    public function destroy(ProfileLink $link): JsonResponse
    {
        Gate::authorize('delete', $link);

        $link->delete();

        return response()->json(['message' => 'Link deleted successfully']);
    }
}
