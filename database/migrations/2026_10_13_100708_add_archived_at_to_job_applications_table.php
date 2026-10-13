<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations. Applications archived before this have no archive date, so they get their
     * last update: archiving was an update, so it's the closest known time.
     */
    public function up(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            $table->timestamp('archived_at')->nullable()->after('is_archived');
        });

        DB::table('job_applications')
            ->where('is_archived', true)
            ->update(['archived_at' => DB::raw('updated_at')]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            $table->dropColumn('archived_at');
        });
    }
};
