<?php

namespace App\Http\Controllers;

use App\Enums\TagColor;
use App\Http\Requests\Tag\TagStoreRequest;
use App\Http\Requests\Tag\TagUpdateRequest;
use App\Http\Resources\TagResource;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class TagController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return TagResource::collection(
            $request->user()->tags()->withCount('jobApplications as applications_count')->orderBy('name')->get()
        );
    }

    public function store(TagStoreRequest $request): TagResource
    {
        $tag = $request->user()->tags()->create([
            'name' => $request->validated('name'),
            'color' => $request->validated('color')
                ?? TagColor::nextAfter($request->user()->tags()->toBase()->pluck('color')->all()),
        ]);

        return new TagResource($tag);
    }

    public function update(TagUpdateRequest $request, Tag $tag): TagResource
    {
        Gate::authorize('update', $tag);

        $tag->update($request->validated());

        return new TagResource($tag);
    }

    public function destroy(Tag $tag): Response
    {
        Gate::authorize('delete', $tag);

        $tag->delete();

        return response()->noContent();
    }
}
