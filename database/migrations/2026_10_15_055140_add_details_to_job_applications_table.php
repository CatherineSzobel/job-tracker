<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations. The salary range, where the job was found, a contact person and the
     * application deadline; all optional.
     */
    public function up(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            $table->unsignedInteger('salary_min')->nullable();
            $table->unsignedInteger('salary_max')->nullable();
            $table->string('salary_currency', 3)->default('EUR');
            $table->string('source')->nullable();
            $table->string('contact_name')->nullable();
            // An email address or a link (e.g. their LinkedIn profile)
            $table->string('contact_details')->nullable();
            $table->date('deadline')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            $table->dropColumn(['salary_min', 'salary_max', 'salary_currency', 'source', 'contact_name', 'contact_details', 'deadline']);
        });
    }
};
