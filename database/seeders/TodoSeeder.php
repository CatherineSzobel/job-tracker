<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * The demo account's to-dos: follow-ups linked to applications (by company) and a few general ones, due
 * relative to today (one overdue, some today and soon), plus some already done for the activity timelines.
 */
class TodoSeeder extends Seeder
{
    /**
     * company: the linked application (null for a general to-do); due: days from today; done: days ago it was ticked off
     *
     * @var list<array{text: string, company: ?string, due?: int, done?: int}>
     */
    private const TODOS = [
        ['text' => 'Follow up on the application', 'company' => 'Orbital Data', 'due' => -1],
        ['text' => 'Email the hiring manager to check in', 'company' => 'Cobalt Cloud', 'due' => 0],
        ['text' => 'Reply to the offer', 'company' => 'Kestrel Payments', 'due' => 1],
        ['text' => 'Apply before the deadline', 'company' => 'Verdant Energy', 'due' => 1],
        ['text' => 'Prepare system design examples', 'company' => 'Lumen Analytics', 'due' => 2],
        ['text' => 'Compare the Kestrel and Fjord offers', 'company' => null, 'due' => 3],
        ['text' => 'Update portfolio screenshots', 'company' => null, 'due' => 5],
        ['text' => 'Read up on their design system', 'company' => 'Brightline Health', 'due' => 5],
        ['text' => 'Send a thank-you note to Sofie', 'company' => 'Northwind Labs', 'done' => 3],
        ['text' => 'Ask Tom for the salary band', 'company' => 'Kestrel Payments', 'done' => 9],
        ['text' => 'Send a thank-you note to the team', 'company' => 'Kestrel Payments', 'done' => 9],
        ['text' => 'Practise CSS grid layouts', 'company' => null, 'done' => 8],
    ];

    public function run(): void
    {
        // The demo user is created in DatabaseSeeder, its applications in JobApplicationSeeder
        $user = User::where('email', config('app.demo_email'))->firstOrFail();
        $applicationIds = $user->jobApplications()->pluck('id', 'company_name');

        foreach (self::TODOS as $todo) {
            $created = $user->todos()->create([
                'text' => $todo['text'],
                'job_application_id' => $todo['company'] ? $applicationIds[$todo['company']] : null,
                'due_date' => isset($todo['due']) ? Carbon::today()->addDays($todo['due']) : null,
                'done' => isset($todo['done']),
            ]);

            // Ticked off on that day, not today (the model sets completed_at to now)
            if (isset($todo['done'])) {
                $completedAt = Carbon::today()->subDays($todo['done'])->setTime(18, 30);
                DB::table('todos')->where('id', $created->id)->update([
                    'completed_at' => $completedAt,
                    'created_at' => $completedAt->copy()->subDays(2),
                    'updated_at' => $completedAt,
                ]);
            }
        }
    }
}
