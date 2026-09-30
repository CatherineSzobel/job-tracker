<?php

namespace App\Http\Requests\Document;

use Illuminate\Auth\Access\Response;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Validator;

/**
 * Replaces the documents attached to one application. Ids that aren't the user's are
 * answered 404 by DocumentService; archived documents may stay attached but not be added.
 */
class SyncJobApplicationDocumentsRequest extends FormRequest
{
    // Checked before validation, so someone else's application is 404 whatever is sent
    public function authorize(): Response
    {
        return Gate::inspect('update', $this->route('job_application'));
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'document_ids' => 'present|array',
            'document_ids.*' => 'integer|distinct',
        ];
    }

    /**
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $jobApplication = $this->route('job_application');
                $addsArchivedDocument = $this->user()->documents()
                    ->whereIn('id', $this->input('document_ids'))
                    ->whereNotNull('archived_at')
                    ->whereDoesntHave('jobApplications', fn ($query) => $query->whereKey($jobApplication->id))
                    ->exists();

                if ($addsArchivedDocument) {
                    $validator->errors()->add('document_ids', 'Archived documents can’t be attached. Restore them first.');
                }
            },
        ];
    }
}
