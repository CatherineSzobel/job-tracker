<?php

namespace App\Http\Controllers;

use App\Http\Requests\Profile\ProfileLinkStoreRequest;
use App\Http\Requests\Profile\ProfileLinkUpdateRequest;
use App\Models\ProfileLink;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

class ProfileLinkController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $profile = $request->user()->profile;

        if (!$profile) {
            return response()->json(['data' => []]);
        }

        return response()->json([
            'data' => $profile->links,
        ]);
    }

    public function store(ProfileLinkStoreRequest $request): JsonResponse
    {
        $profile = $request->user()->profile;

        if (!$profile) {
            return response()->json(['message' => 'Profile not found'], 404);
        }

        $data = $request->validated();
        $link = $profile->links()->create($data);

        return response()->json([
            'data' => $link,
        ], 201);
    }

    public function update(ProfileLinkUpdateRequest $request, ProfileLink $link): JsonResponse
    {
        $profile = $request->user()->profile;

        if ($link->profile_id !== $profile->id) {
            abort(403);
        }

        $data = $request->validated();
        $link->update($data);

        return response()->json([
            'data' => $link,
        ]);
    }

    public function destroy(Request $request, ProfileLink $link): JsonResponse
    {
        $profile = $request->user()->profile;

        if ($link->profile_id !== $profile->id) {
            abort(403);
        }

        $link->delete();

        return response()->json(['message' => 'Link deleted successfully']);
    }
}
