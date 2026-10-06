<?php

namespace Database\Seeders;

use App\Enums\DocumentCategory;
use App\Enums\DocumentKind;
use App\Models\Document;
use App\Models\JobApplication;
use App\Models\User;
use App\Services\DocumentService;
use Illuminate\Database\Seeder;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Str;

/**
 * Demo library: a few real (small) PDFs and links, some attached to applications.
 * Stays under the demo account's 10-document limit so visitors can still add their own.
 */
class DocumentSeeder extends Seeder
{
    public function run(DocumentService $documentService): void
    {
        // The demo user is created in DatabaseSeeder, its applications in JobApplicationSeeder
        $user = User::where('email', config('app.demo_email'))->firstOrFail();
        $disk = $documentService->disk();

        // Re-seeding replaces the demo library (rows and files) instead of piling up
        $user->documents()->delete();
        $documentService->deleteFilesFor($user);

        $cv = $this->storePdf($user, $disk, DocumentCategory::Cv, 'CV – Software Engineer 2026', 'Test_User_CV_2026.pdf', 'Test User - Software Engineer', [
            'San Francisco, CA  |  test@example.com',
            '',
            'Experience',
            '2023 - now   Backend Developer, Acme Corp (Laravel, MySQL, AWS)',
            '2020 - 2023  Full-stack Developer, Globex (PHP, React)',
            '',
            'Skills: PHP, Laravel, React, SQL, Docker, CI/CD',
        ]);
        $oldCv = $this->storePdf($user, $disk, DocumentCategory::Cv, 'CV – 2025 (old)', 'Test_User_CV_2025.pdf', 'Test User - Developer', [
            'San Francisco, CA  |  test@example.com',
            '',
            '2020 - now   Full-stack Developer, Globex (PHP, React)',
        ]);
        $coverLetter = $this->storePdf($user, $disk, DocumentCategory::CoverLetter, 'Cover letter – general', 'Cover_letter.pdf', 'Cover letter', [
            'Dear hiring manager,',
            '',
            'I am excited to apply for this role. With five years of experience',
            'building web applications, I would love to bring my skills to your team.',
            '',
            'Kind regards,',
            'Test User',
        ]);
        $this->storePdf($user, $disk, DocumentCategory::Certificate, 'AWS Certified Cloud Practitioner', 'aws-cloud-practitioner.pdf', 'Certificate of completion', [
            'This certifies that Test User has earned',
            'AWS Certified Cloud Practitioner',
        ]);

        $linkedIn = $this->link($user, DocumentCategory::LinkedIn, 'LinkedIn', 'https://www.linkedin.com');
        $this->link($user, DocumentCategory::GitHub, 'GitHub', 'https://github.com');
        // Points back at the app's own library, so the demo never links to a site someone could own
        $this->link($user, DocumentCategory::Portfolio, 'Portfolio site', rtrim(config('app.frontend_url'), '/').'/documents');

        // What was "sent": the oldest application got the old CV (since archived), the next few the current set
        $applications = $user->jobApplications()->oldest('applied_date')->take(5)->get();
        $applications->first()?->documents()->attach($oldCv, ['attached_at' => $applications->first()->applied_date]);
        $applications->skip(1)->each(fn (JobApplication $application) => $application->documents()->attach(
            [$cv->id, $coverLetter->id, $linkedIn->id],
            ['attached_at' => $application->applied_date],
        ));
        $oldCv->update(['archived_at' => now()]);
    }

    /**
     * @param  list<string>  $lines
     */
    private function storePdf(User $user, FilesystemAdapter $disk, DocumentCategory $category, string $name, string $filename, string $title, array $lines): Document
    {
        $contents = $this->pdf($title, $lines);
        $path = "documents/{$user->id}/".Str::random(40).'.pdf';
        $disk->put($path, $contents);

        return $user->documents()->create([
            'kind' => DocumentKind::File,
            'category' => $category,
            'name' => $name,
            'path' => $path,
            'original_filename' => $filename,
            'mime_type' => 'application/pdf',
            'size' => strlen($contents),
        ]);
    }

    private function link(User $user, DocumentCategory $category, string $name, string $url): Document
    {
        return $user->documents()->create([
            'kind' => DocumentKind::Link,
            'category' => $category,
            'name' => $name,
            'url' => $url,
        ]);
    }

    /**
     * A minimal one-page PDF (Helvetica, ASCII text only) with a correct xref table.
     *
     * @param  list<string>  $lines
     */
    private function pdf(string $title, array $lines): string
    {
        $escape = fn (string $text) => str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $text);

        $content = "BT /F1 20 Tf 72 740 Td ({$escape($title)}) Tj ET\n";
        foreach ($lines as $index => $line) {
            $y = 700 - $index * 18;
            $content .= "BT /F1 11 Tf 72 {$y} Td ({$escape($line)}) Tj ET\n";
        }

        $objects = [
            '<< /Type /Catalog /Pages 2 0 R >>',
            '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
            '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
            '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
            '<< /Length '.strlen($content)." >>\nstream\n{$content}endstream",
        ];

        $pdf = "%PDF-1.4\n";
        $offsets = [];
        foreach ($objects as $index => $object) {
            $offsets[] = strlen($pdf);
            $pdf .= ($index + 1)." 0 obj\n{$object}\nendobj\n";
        }

        $xrefOffset = strlen($pdf);
        $pdf .= "xref\n0 ".(count($objects) + 1)."\n0000000000 65535 f \n";
        foreach ($offsets as $offset) {
            $pdf .= sprintf("%010d 00000 n \n", $offset);
        }

        return $pdf.'trailer << /Size '.(count($objects) + 1)." /Root 1 0 R >>\nstartxref\n{$xrefOffset}\n%%EOF\n";
    }
}
