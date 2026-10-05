<?php

namespace App\Http\Controllers;

use App\Enums\DocumentCategory;
use App\Http\Requests\Document\DocumentStoreRequest;
use App\Http\Requests\Document\DocumentUpdateRequest;
use App\Http\Requests\Document\SyncJobApplicationDocumentsRequest;
use App\Http\Resources\DocumentResource;
use App\Models\Document;
use App\Models\JobApplication;
use App\Services\DocumentService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentController extends Controller
{
    public function __construct(private DocumentService $documentService) {}

    // Query: category (ignored unless a valid category), include_archived (bool, default false)
    public function index(Request $request): AnonymousResourceCollection
    {
        $documents = $request->user()->documents()
            ->withCount('jobApplications')
            ->when(! $request->boolean('include_archived'), fn ($query) => $query->whereNull('archived_at'))
            ->when($request->enum('category', DocumentCategory::class), fn ($query, DocumentCategory $category) => $query->where('category', $category))
            ->latest()
            ->latest('id')
            ->get();

        return DocumentResource::collection($documents);
    }

    public function store(DocumentStoreRequest $request): DocumentResource
    {
        $document = $this->documentService->create($request->user(), $request->validated());

        return new DocumentResource($document->loadCount('jobApplications'));
    }

    public function update(DocumentUpdateRequest $request, Document $document): DocumentResource
    {
        Gate::authorize('update', $document);

        $document->update($request->validated());

        return new DocumentResource($document->loadCount('jobApplications'));
    }

    public function download(Document $document): StreamedResponse
    {
        Gate::authorize('view', $document);

        return $this->documentService->download($document);
    }

    // Attached documents are archived (200 + resource), unattached ones deleted (204)
    public function destroy(Document $document): DocumentResource|Response
    {
        Gate::authorize('delete', $document);

        return $this->documentService->archiveOrDelete($document)
            ? new DocumentResource($document->loadCount('jobApplications'))
            : response()->noContent();
    }

    public function restore(Document $document): DocumentResource
    {
        Gate::authorize('restore', $document);

        return new DocumentResource($this->documentService->restore($document)->loadCount('jobApplications'));
    }

    // Ownership of the application is checked in SyncJobApplicationDocumentsRequest::authorize()
    public function syncForApplication(SyncJobApplicationDocumentsRequest $request, JobApplication $jobApplication): AnonymousResourceCollection
    {
        $documents = $this->documentService->syncForApplication(
            $jobApplication,
            $request->user(),
            $request->validated('document_ids')
        );

        return DocumentResource::collection($documents);
    }
}
