<?php

namespace Database\Factories;

use App\Enums\DocumentCategory;
use App\Enums\DocumentKind;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Document>
 */
class DocumentFactory extends Factory
{
    /**
     * A link, by default.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'kind' => DocumentKind::Link,
            'category' => DocumentCategory::Website,
            'name' => fake()->words(3, true),
            'url' => fake()->url(),
        ];
    }

    /**
     * An uploaded PDF. Only the row: tests that read the file put it on the fake disk themselves.
     */
    public function file(): static
    {
        return $this->state(fn (array $attributes) => [
            'kind' => DocumentKind::File,
            'category' => DocumentCategory::Cv,
            'url' => null,
            'path' => 'documents/'.Str::random(40).'.pdf',
            'original_filename' => 'cv.pdf',
            'mime_type' => 'application/pdf',
            'size' => 1024,
        ]);
    }

    public function archived(): static
    {
        return $this->state(fn (array $attributes) => [
            'archived_at' => now(),
        ]);
    }
}
