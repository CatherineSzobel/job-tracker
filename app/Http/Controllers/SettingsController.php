<?php

namespace App\Http\Controllers;

use App\Http\Requests\Settings\SettingsUpdateRequest;
use App\Http\Resources\SettingsResource;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function show(Request $request): SettingsResource
    {
        return new SettingsResource($request->user());
    }

    public function update(SettingsUpdateRequest $request): SettingsResource
    {
        $request->user()->update($request->validated());

        return new SettingsResource($request->user());
    }
}
