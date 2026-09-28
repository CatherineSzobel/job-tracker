<?php

namespace App\Http\Controllers;

use App\Http\Requests\Profile\ProfileLinkStoreRequest;
use App\Http\Requests\Profile\ProfileLinkUpdateRequest;
use App\Http\Resources\ProfileLinkResource;
use App\Models\ProfileLink;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class ProfileLinkController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return ProfileLinkResource::collection($request->user()->profile?->links ?? collect());
    }

    public function store(ProfileLinkStoreRequest $request): ProfileLinkResource|JsonResponse
    {
        $profile = $request->user()->profile;

        if (! $profile) {
            return response()->json(['message' => 'Profile not found'], 404);
        }

        return new ProfileLinkResource($profile->links()->create($request->validated()));
    }

    public function update(ProfileLinkUpdateRequest $request, ProfileLink $link): ProfileLinkResource
    {
        Gate::authorize('update', $link);

        $link->update($request->validated());

        return new ProfileLinkResource($link);
    }

    public function destroy(ProfileLink $link): Response
    {
        Gate::authorize('delete', $link);

        $link->delete();

        return response()->noContent();
    }
}
