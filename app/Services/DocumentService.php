<?php

namespace App\Services;

use App\Enums\DocumentKind;
use App\Models\Document;
use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentService
{
    /**
     * Private disk the uploaded files live on (config filesystems.documents_disk)
     */
    public function disk(): FilesystemAdapter
    {
        return Storage::disk(config('filesystems.documents_disk'));
    }

    /**
     * Create a file or link document; uploaded files are stored under documents/{user_id}/
     *
     * @param  array{kind: string, name: string, category: string, file?: UploadedFile, url?: string}  $data
     */
    public function create(User $user, array $data): Document
    {
        $attributes = [
            'kind' => $data['kind'],
            'name' => $data['name'],
            'category' => $data['category'],
        ];

        if (DocumentKind::from($data['kind']) === DocumentKind::Link) {
            return $user->documents()->create([...$attributes, 'url' => $data['url']]);
        }

        $file = $data['file'];
        $path = $file->store("documents/{$user->id}", config('filesystems.documents_disk'));

        if ($path === false) {
            throw new RuntimeException('The uploaded file could not be stored.');
        }

        return $user->documents()->create([
            ...$attributes,
            'path' => $path,
            'original_filename' => Str::substr($file->getClientOriginalName(), 0, 255),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
        ]);
    }

    /**
     * Stream a file document under its original filename; links and missing files are 404
     */
    public function download(Document $document): StreamedResponse
    {
        abort_unless(
            $document->kind === DocumentKind::File && $document->path && $this->disk()->exists($document->path),
            404
        );

        return $this->disk()->download($document->path, $document->original_filename);
    }

    /**
     * Archive a document that is attached to an application (it stays visible there);
     * delete an unattached one, file included.
     *
     * @return bool true when archived, false when deleted
     */
    public function archiveOrDelete(Document $document): bool
    {
        if ($document->jobApplications()->exists()) {
            $document->archived_at ??= now();
            $document->save();

            return true;
        }

        $document->delete();

        if ($document->path) {
            $this->disk()->delete($document->path);
        }

        return false;
    }

    /**
     * Make exactly these documents the ones attached to the application.
     * Newly attached ones get attached_at = now; already attached ones keep theirs.
     *
     * @param  list<int>  $documentIds
     * @return Collection<int, Document>
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException when an id isn't one of the user's documents
     */
    public function syncForApplication(JobApplication $jobApplication, User $user, array $documentIds): Collection
    {
        $documents = $user->documents()->findOrFail($documentIds);
        $attachedIds = $jobApplication->documents()->pluck('documents.id')->all();

        $jobApplication->documents()->sync($documents->mapWithKeys(fn (Document $document) => [
            $document->id => in_array($document->id, $attachedIds, true) ? [] : ['attached_at' => now()],
        ])->all());

        return $jobApplication->documents()->get();
    }

    /**
     * Remove all of a user's uploaded files (their rows go with the user via cascade)
     */
    public function deleteFilesFor(User $user): void
    {
        $this->disk()->deleteDirectory("documents/{$user->id}");
    }

    /**
     * Bring an archived document back into the library
     */
    public function restore(Document $document): Document
    {
        $document->update(['archived_at' => null]);

        return $document;
    }
}
