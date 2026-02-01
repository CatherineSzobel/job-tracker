<?php

namespace App\Http\Controllers;

use App\Models\ProfileLink;
use Illuminate\Http\Request;

class ProfileLinkController extends Controller
{
    public function index(Request $request)
    {
        $profile = $request->user()->profile;

        if (!$profile) {
            return response()->json(['data' => []]);
        }

        return response()->json([
            'data' => $profile->links,
        ]);
    }

    public function store(Request $request)
    {
        $profile = $request->user()->profile;

        if (!$profile) {
            return response()->json(['message' => 'Profile not found'], 404);
        }

        $data = $request->validate([
            'type' => 'required|string',
            'url' => 'required|url',
        ]);

        $link = $profile->links()->create($data);

        return response()->json([
            'data' => $link,
        ], 201);
    }

    public function update(Request $request, ProfileLink $link)
    {
        $profile = $request->user()->profile;

        if ($link->profile_id !== $profile->id) {
            abort(403);
        }

        $data = $request->validate([
            'type' => 'required|string',
            'url' => 'required|url',
        ]);

        $link->update($data);

        return response()->json([
            'data' => $link,
        ]);
    }

    public function destroy(Request $request, ProfileLink $link)
    {
        $profile = $request->user()->profile;

        if ($link->profile_id !== $profile->id) {
            abort(403);
        }

        $link->delete();

        return response()->noContent();
    }
}
