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
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('reminders_in_app')->default(false);
            $table->boolean('reminders_email')->default(false);
            $table->unsignedTinyInteger('reminder_days')->default(7);
            $table->string('reminder_dismiss_mode')->default('today');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['reminders_in_app', 'reminders_email', 'reminder_days', 'reminder_dismiss_mode']);
        });
    }
};
