<?php

use App\Enums\DocumentCategory;
use App\Enums\DocumentKind;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Profile links become link documents in their owner's library, then the table goes.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('profile_links')
            ->join('profiles', 'profiles.id', '=', 'profile_links.profile_id')
            ->select('profile_links.*', 'profiles.user_id')
            ->orderBy('profile_links.id')
            ->chunk(100, function (Collection $links) {
                DB::table('documents')->insert($links->map(fn (object $link) => [
                    'user_id' => $link->user_id,
                    'kind' => DocumentKind::Link->value,
                    'category' => DocumentCategory::fromLabel($link->type)->value,
                    'name' => $link->type,
                    'url' => $link->url,
                    'created_at' => $link->created_at,
                    'updated_at' => $link->updated_at,
                ])->all());
            });

        Schema::drop('profile_links');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('profile_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('profile_id')->constrained()->cascadeOnDelete();
            $table->string('type');
            $table->string('url');
            $table->timestamps();
        });

        DB::table('documents')
            ->join('profiles', 'profiles.user_id', '=', 'documents.user_id')
            ->where('documents.kind', DocumentKind::Link->value)
            ->select('documents.*', 'profiles.id as profile_id')
            ->orderBy('documents.id')
            ->chunk(100, function (Collection $documents) {
                DB::table('profile_links')->insert($documents->map(fn (object $document) => [
                    'profile_id' => $document->profile_id,
                    'type' => $document->name,
                    'url' => $document->url,
                    'created_at' => $document->created_at,
                    'updated_at' => $document->updated_at,
                ])->all());
            });
    }
};
