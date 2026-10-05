<?php

namespace Tests\Unit;

use App\Enums\DocumentCategory;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class DocumentCategoryTest extends TestCase
{
    /**
     * @return array<string, array{string, DocumentCategory}>
     */
    public static function labels(): array
    {
        return [
            'exact brand name' => ['LinkedIn', DocumentCategory::LinkedIn],
            'lowercase inside a phrase' => ['my github', DocumentCategory::GitHub],
            'portfolio with suffix' => ['Portfolio site', DocumentCategory::Portfolio],
            'anything else' => ['Blog', DocumentCategory::Website],
        ];
    }

    #[DataProvider('labels')]
    public function test_from_label_maps_profile_link_types_to_categories(string $label, DocumentCategory $expected): void
    {
        $this->assertSame($expected, DocumentCategory::fromLabel($label));
    }
}
