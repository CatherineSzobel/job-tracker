<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $profile = $request->user()
            ->profile()
            ->with('links')
            ->first();

        return response()->json(['data' => $profile]);
    }

    public function update(Request $request)
    {
        $profile = $request->user()->profile;

        $data = $request->validate([
            'name' => 'nullable|string',
            'title' => 'nullable|string',
            'bio' => 'nullable|string',
            'location' => 'nullable|string',
        ]);

        $profile->update($data);

        return response()->json(['data' => $profile->load('links')]);
    }
}
