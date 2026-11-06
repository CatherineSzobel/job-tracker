<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * A few notes for the demo account's dashboard, one of them pinned.
 */
class NoteSeeder extends Seeder
{
    /**
     * @var list<array{title: string, content: string, is_pinned: bool}>
     */
    private const NOTES = [
        [
            'title' => 'Stories to have ready',
            'content' => "Booking system rebuild: page loads halved.\nRefactor vs rewrite: the one-week spike.\nThe reporting tool nobody used, and what I changed after.",
            'is_pinned' => true,
        ],
        [
            'title' => 'Salary research',
            'content' => "Laravel developer, Ghent / Antwerp: 50–65k.\nSenior, Brussels: 65–80k.\nAsk about the hybrid policy and the training budget.",
            'is_pinned' => false,
        ],
        [
            'title' => 'Questions I always ask',
            'content' => "What does a normal week look like?\nHow is success measured in the first 90 days?\nWhat is the next step, and when?",
            'is_pinned' => false,
        ],
    ];

    public function run(): void
    {
        // The demo user is created in DatabaseSeeder
        $user = User::where('email', config('app.demo_email'))->firstOrFail();

        foreach (self::NOTES as $note) {
            $user->notes()->create($note);
        }
    }
}
