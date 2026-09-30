<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('todos', function (Blueprint $table) {
            $table->foreignId('job_application_id')->nullable()->after('user_id')->constrained()->cascadeOnDelete();
            $table->date('due_date')->nullable()->after('done');

            $table->index(['user_id', 'done', 'due_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('todos', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'done', 'due_date']);
            $table->dropConstrainedForeignId('job_application_id');
            $table->dropColumn('due_date');
        });
    }
};
