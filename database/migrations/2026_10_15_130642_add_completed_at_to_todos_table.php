<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations. To-dos already done get their last update as the completion time: ticking one off
     * was an update, so it's the closest known time.
     */
    public function up(): void
    {
        Schema::table('todos', function (Blueprint $table) {
            $table->timestamp('completed_at')->nullable()->after('done');
        });

        DB::table('todos')
            ->where('done', true)
            ->update(['completed_at' => DB::raw('updated_at')]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('todos', function (Blueprint $table) {
            $table->dropColumn('completed_at');
        });
    }
};
