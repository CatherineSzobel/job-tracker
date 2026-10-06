<?php

namespace Database\Seeders;

use App\Enums\BankQuestionCategory;
use App\Models\Interview;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * A question bank for the demo account, with the first three linked to its next interview.
 */
class BankQuestionSeeder extends Seeder
{
    /**
     * @var list<array{question: string, category: BankQuestionCategory, answer: ?string}>
     */
    private const QUESTIONS = [
        [
            'question' => 'Tell me about yourself.',
            'category' => BankQuestionCategory::AboutMe,
            'answer' => "Software engineer with five years of experience, mostly building web apps with Laravel and React.\nRecently led the rebuild of a booking system that cut page load times in half.\nLooking for a team where I can own features end to end.",
        ],
        [
            'question' => 'Why do you want to work here?',
            'category' => BankQuestionCategory::Motivation,
            'answer' => 'The product solves a problem I have run into myself, and the team ships often and writes about how they work. I want to grow in a place that takes code quality seriously.',
        ],
        [
            'question' => 'Tell me about a time you disagreed with a colleague.',
            'category' => BankQuestionCategory::Behavioural,
            'answer' => "Situation: we disagreed on whether to rewrite or refactor a legacy module.\nAction: I suggested a one-week spike to measure both options.\nResult: the numbers favoured refactoring, we agreed quickly, and shipped two weeks early.",
        ],
        [
            'question' => 'What is your greatest strength?',
            'category' => BankQuestionCategory::AboutMe,
            'answer' => 'Breaking a vague problem into small, testable steps, and keeping people updated while I do it.',
        ],
        [
            'question' => 'Where do you see yourself in five years?',
            'category' => BankQuestionCategory::Motivation,
            'answer' => 'Leading a small product team, still writing code, and mentoring newer developers.',
        ],
        [
            'question' => 'Describe a project that failed and what you learned.',
            'category' => BankQuestionCategory::Behavioural,
            'answer' => 'A reporting tool we built without talking to its users enough. Adoption was low. Since then I demo early versions to real users every sprint.',
        ],
        [
            'question' => 'Tell me about a time you had a tight deadline.',
            'category' => BankQuestionCategory::Behavioural,
            'answer' => null,
        ],
        [
            'question' => 'How would you design a URL shortener?',
            'category' => BankQuestionCategory::Technical,
            'answer' => "Key-value store from short code to URL, base62 codes from an auto-increment id.\nCache hot codes, redirect with 301/302, rate-limit creation, and log clicks asynchronously.",
        ],
        [
            'question' => 'What is the difference between SQL and NoSQL databases?',
            'category' => BankQuestionCategory::Technical,
            'answer' => 'Relational databases use fixed schemas, joins and strong transactions; NoSQL stores trade some of that for flexible schemas and easier horizontal scaling. Pick based on the shape of the data and the consistency you need.',
        ],
        [
            'question' => 'How do you make sure your code is well tested?',
            'category' => BankQuestionCategory::Technical,
            'answer' => 'Feature tests for behaviour that matters to users, unit tests for tricky logic, and a failing test first for every bug fix.',
        ],
        [
            'question' => 'What are your salary expectations?',
            'category' => BankQuestionCategory::Other,
            'answer' => 'Give the researched range for the role and location, and say I am flexible depending on the full package.',
        ],
        [
            'question' => 'Do you have any questions for us?',
            'category' => BankQuestionCategory::Other,
            'answer' => 'Always yes: ask about the team, how success is measured in the first 90 days, and what the next step in the process is.',
        ],
    ];

    /**
     * Notes for the questions linked to the next interview, in the same order as QUESTIONS.
     *
     * @var list<string>
     */
    private const INTERVIEW_NOTES = [
        'Keep it under two minutes and end with why this role.',
        'Mention their engineering blog post on deployments.',
        'Use the refactor-vs-rewrite story.',
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // The demo user, their jobs and interviews are created in DatabaseSeeder and JobApplicationSeeder
        $user = User::where('email', config('app.demo_email'))->firstOrFail();

        $questions = collect(self::QUESTIONS)->map(fn (array $question) => $user->bankQuestions()->create($question));

        $nextInterview = Interview::where('user_id', $user->id)->orderBy('interview_date')->first();
        if ($nextInterview === null) {
            return;
        }

        foreach (self::INTERVIEW_NOTES as $position => $note) {
            $nextInterview->bankQuestions()->attach($questions[$position], ['note' => $note, 'position' => $position]);
        }
    }
}
