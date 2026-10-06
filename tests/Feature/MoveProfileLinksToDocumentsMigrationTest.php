<?php

namespace Tests\Feature;

use App\Enums\DocumentCategory;
use App\Enums\DocumentKind;
use App\Models\Document;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class MoveProfileLinksToDocumentsMigrationTest extends TestCase
{
    use RefreshDatabase;

    private function migration(): Migration
    {
        return require collect(glob(database_path('migrations/*_move_profile_links_to_documents.php')))->sole();
    }

    public function test_up_moves_each_profile_link_into_its_owners_library_and_drops_the_table(): void
    {
        $migration = $this->migration();
        $migration->down();
        $user = User::factory()->create();
        $profile = $user->profile()->create(['name' => $user->name]);
        DB::table('profile_links')->insert([
            ['profile_id' => $profile->id, 'type' => 'LinkedIn', 'url' => 'https://linkedin.com/in/jane', 'created_at' => '2026-02-01 10:00:00', 'updated_at' => '2026-02-02 10:00:00'],
            ['profile_id' => $profile->id, 'type' => 'Blog', 'url' => 'https://jane.dev', 'created_at' => '2026-02-03 10:00:00', 'updated_at' => '2026-02-03 10:00:00'],
        ]);

        $migration->up();

        $this->assertFalse(Schema::hasTable('profile_links'));
        $documents = $user->documents()->orderBy('id')->get();
        $this->assertCount(2, $documents);
        $this->assertSame(DocumentKind::Link, $documents[0]->kind);
        $this->assertSame(DocumentCategory::LinkedIn, $documents[0]->category);
        $this->assertSame('LinkedIn', $documents[0]->name);
        $this->assertSame('https://linkedin.com/in/jane', $documents[0]->url);
        $this->assertSame('2026-02-01 10:00:00', $documents[0]->created_at->toDateTimeString());
        $this->assertSame('2026-02-02 10:00:00', $documents[0]->updated_at->toDateTimeString());
        $this->assertSame(DocumentCategory::Website, $documents[1]->category);
    }

    public function test_down_copies_link_documents_back_to_the_owners_profile(): void
    {
        $user = User::factory()->create();
        $profile = $user->profile()->create(['name' => $user->name]);
        Document::factory()->for($user)->create(['name' => 'GitHub', 'url' => 'https://github.com/jane']);
        Document::factory()->for($user)->file()->create();

        $this->migration()->down();

        $this->assertDatabaseCount('profile_links', 1);
        $this->assertDatabaseHas('profile_links', [
            'profile_id' => $profile->id,
            'type' => 'GitHub',
            'url' => 'https://github.com/jane',
        ]);
    }
}
