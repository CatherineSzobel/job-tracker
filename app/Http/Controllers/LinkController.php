<?php

// app/Http/Controllers/LinkController.php
namespace App\Http\Controllers;

use App\Models\Link;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LinkController extends Controller
{
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        return $user->links;
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'url' => 'required|url|max:255',
        ]);
        return Link::create([
            'user_id' => $request->user()->id,
            'name' => $data['name'],
            'url' => $data['url'],
        ]);
    }

    public function destroy(Link $link)
    {
        $link->delete();
        return response()->noContent();
    }
}
