<?php

namespace App\Http\Controllers;

use App\Enums\TagColor;
use App\Http\Requests\Tag\TagStoreRequest;
use App\Http\Requests\Tag\TagUpdateRequest;
use App\Http\Resources\TagResource;
use App\Models\Tag;
use App\Models\User;
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
            'color' => $request->validated('color') ?? $this->nextColor($request->user()),
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

    /**
     * The first palette colour the user doesn't use yet; once all are used, cycle through them by tag count.
     */
    private function nextColor(User $user): TagColor
    {
        $usedColors = $user->tags()->toBase()->pluck('color')->all();

        foreach (TagColor::cases() as $color) {
            if (! in_array($color->value, $usedColors, true)) {
                return $color;
            }
        }

        return TagColor::cases()[count($usedColors) % count(TagColor::cases())];
    }
}
