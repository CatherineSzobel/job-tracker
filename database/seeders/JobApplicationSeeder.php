<?php

namespace Database\Seeders;

use App\Enums\InterviewType;
use App\Enums\TagColor;
use App\Models\Interview;
use App\Models\JobApplication;
use App\Models\User;
use App\Services\InterviewPrepService;
use Carbon\CarbonInterface;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * The demo account's job search, written out by hand so the app (and its screenshots) look like a real one:
 * every status, salaries, sources, contacts, deadlines, tags, a status history, past interviews with
 * debriefs and upcoming ones with prep. All dates are relative to the day it runs, so the demo stays current.
 * Companies are made up; links use the reserved .example domain.
 */
class JobApplicationSeeder extends Seeder
{
    /**
     * Tag name → colour
     */
    private const TAGS = [
        'laravel' => TagColor::Red,
        'react' => TagColor::Blue,
        'remote' => TagColor::Teal,
        'fintech' => TagColor::Amber,
        'dream job' => TagColor::Violet,
    ];

    /**
     * applied: days ago (null while Saved); history: [from, to, days ago] in order; archived: days ago;
     * interviews: in (days from today, negative for past), at (HH:MM), type, and for past ones rating and
     * debrief, for upcoming ones prep_done (checklist items ticked), people and questions.
     *
     * @var list<array<string, mixed>>
     */
    private const APPLICATIONS = [
        [
            'company' => 'Northwind Labs', 'position' => 'Full-stack Developer (Laravel & React)', 'location' => 'Ghent',
            'status' => 'interview', 'priority' => 'high', 'source' => 'referral', 'salary' => [55000, 65000, 'EUR'],
            'applied' => 12, 'history' => [['applied', 'interview', 5]],
            'contact' => ['Sofie Peeters', 'sofie.peeters@northwind.example'], 'tags' => ['laravel', 'react', 'dream job'],
            'notes' => 'Referred by Jonas. Small product team, ships weekly; they asked about my booking system rebuild.',
            'interviews' => [
                ['in' => -4, 'at' => '14:00', 'type' => 'phone', 'rating' => 4, 'debrief' => 'Friendly screen with Sofie. Next: a technical round with two developers.'],
                [
                    'in' => 1, 'at' => '10:30', 'type' => 'online', 'meeting' => 'https://meet.example/nwl-tech-round', 'prep_done' => 3,
                    'notes' => 'Technical round: live coding in Laravel, then questions about testing.',
                    'people' => [['Sofie Peeters', 'Engineering Manager'], ['Ruben Maes', 'Senior Developer']],
                    'ask' => ['How do you decide what goes into a release?', 'What does onboarding look like in the first month?'],
                ],
            ],
        ],
        [
            'company' => 'Lumen Analytics', 'position' => 'Backend Engineer (PHP)', 'location' => 'Antwerp (hybrid)',
            'status' => 'interview', 'priority' => 'high', 'source' => 'linkedin', 'salary' => [60000, 70000, 'EUR'],
            'applied' => 15, 'history' => [['applied', 'interview', 8]], 'tags' => ['laravel'],
            'interviews' => [
                ['in' => -6, 'at' => '11:00', 'type' => 'online', 'rating' => 5, 'debrief' => 'Great conversation about their data pipeline. They liked the testing examples.'],
                [
                    'in' => 3, 'at' => '14:00', 'type' => 'onsite', 'location' => 'Lumen office, Meir 12, Antwerp', 'prep_done' => 1,
                    'notes' => 'Final round on site: system design and meeting the team.',
                    'people' => [['Ines Wouters', 'CTO']],
                    'ask' => ['What would success look like after 90 days?'],
                ],
            ],
        ],
        [
            'company' => 'Brightline Health', 'position' => 'Frontend Developer (React)', 'location' => 'Remote',
            'status' => 'interview', 'priority' => 'medium', 'source' => 'job_board', 'salary' => [50000, 58000, 'EUR'],
            'applied' => 9, 'history' => [['applied', 'interview', 2]], 'tags' => ['react', 'remote'],
            'interviews' => [
                ['in' => 6, 'at' => '09:00', 'type' => 'phone', 'prep_done' => 0, 'notes' => 'Intro call with the recruiter.'],
            ],
        ],
        [
            'company' => 'Kestrel Payments', 'position' => 'Senior Laravel Developer', 'location' => 'Brussels',
            'status' => 'offer', 'priority' => 'high', 'source' => 'recruiter', 'salary' => [68000, 78000, 'EUR'],
            'applied' => 28, 'history' => [['applied', 'interview', 20], ['interview', 'offer', 3]],
            'contact' => ['Tom Claes (recruiter)', 'https://www.linkedin.example/in/tom-claes'], 'tags' => ['laravel', 'fintech'],
            'notes' => 'Offer: 74k plus 20 days of holiday. Answer by Friday.',
            'interviews' => [
                ['in' => -18, 'at' => '10:00', 'type' => 'online', 'rating' => 4, 'debrief' => 'Solid technical interview; they use Laravel queues heavily.'],
                ['in' => -10, 'at' => '15:30', 'type' => 'onsite', 'location' => 'Kestrel HQ, Brussels', 'rating' => 5, 'debrief' => 'Met the whole team. Clear growth path to tech lead.'],
            ],
        ],
        [
            'company' => 'Fjord Mobility', 'position' => 'Software Engineer', 'location' => 'Rotterdam',
            'status' => 'offer', 'priority' => 'medium', 'source' => 'company_website', 'salary' => [62000, 70000, 'EUR'],
            'applied' => 35, 'history' => [['applied', 'interview', 25], ['interview', 'offer', 7]],
            'interviews' => [
                ['in' => -22, 'at' => '13:00', 'type' => 'phone', 'rating' => 3, 'debrief' => 'Short call; the role is more DevOps than I expected.'],
                ['in' => -14, 'at' => '11:30', 'type' => 'online', 'rating' => 4, 'debrief' => 'Good pairing exercise. Relocation would be needed.'],
            ],
        ],
        [
            'company' => 'Tidewater Studio', 'position' => 'Full-stack Developer', 'location' => 'Utrecht',
            'status' => 'applied', 'priority' => 'medium', 'source' => 'linkedin', 'salary' => [52000, 60000, 'EUR'], 'applied' => 2,
        ],
        [
            'company' => 'Cobalt Cloud', 'position' => 'Platform Engineer', 'location' => 'Amsterdam',
            'status' => 'applied', 'priority' => 'low', 'source' => 'job_board', 'salary' => [65000, 75000, 'EUR'], 'applied' => 10,
        ],
        [
            'company' => 'Quillstack', 'position' => 'PHP Developer', 'location' => 'Remote',
            'status' => 'applied', 'priority' => 'medium', 'source' => 'job_board', 'salary' => [45000, 52000, 'EUR'], 'applied' => 0, 'tags' => ['remote'],
        ],
        [
            'company' => 'Harbourline Logistics', 'position' => 'Backend Developer', 'location' => 'Ghent',
            'status' => 'applied', 'priority' => 'medium', 'source' => 'company_website', 'applied' => 0,
        ],
        [
            'company' => 'Pebble & Pine', 'position' => 'Web Developer (Laravel)', 'location' => 'Leuven',
            'status' => 'applied', 'priority' => 'low', 'source' => 'other', 'salary' => [42000, 48000, 'EUR'], 'applied' => 1, 'tags' => ['laravel'],
        ],
        [
            'company' => 'Orbital Data', 'position' => 'Software Engineer, Data Platform', 'location' => 'Berlin (remote)',
            'status' => 'applied', 'priority' => 'medium', 'source' => 'linkedin', 'salary' => [70000, 80000, 'EUR'], 'applied' => 9, 'tags' => ['remote'],
        ],
        [
            'company' => 'Nimbus HR', 'position' => 'Laravel Developer', 'location' => 'Remote',
            'status' => 'applied', 'priority' => 'medium', 'source' => 'referral', 'salary' => [50000, 56000, 'EUR'], 'applied' => 4, 'tags' => ['laravel', 'remote'],
        ],
        [
            'company' => 'Copperleaf Games', 'position' => 'Web Developer', 'location' => 'Ghent',
            'status' => 'applied', 'priority' => 'low', 'source' => 'job_board', 'applied' => 6,
        ],
        [
            'company' => 'Verdant Energy', 'position' => 'Laravel Developer', 'location' => 'Ghent',
            'status' => 'saved', 'priority' => 'high', 'source' => 'company_website', 'salary' => [55000, 62000, 'EUR'],
            'deadline' => 2, 'tags' => ['laravel'], 'notes' => 'Tailor the cover letter to their energy dashboard.',
        ],
        [
            'company' => 'Mosaic Learning', 'position' => 'React Developer', 'location' => 'Remote',
            'status' => 'saved', 'priority' => 'medium', 'source' => 'linkedin', 'deadline' => 9, 'tags' => ['react', 'remote'],
        ],
        [
            'company' => 'Alpine Fintech', 'position' => 'Full-stack Engineer', 'location' => 'Zürich',
            'status' => 'saved', 'priority' => 'low', 'source' => 'recruiter', 'salary' => [95000, 110000, 'CHF'], 'tags' => ['fintech'],
        ],
        [
            'company' => 'Granite Systems', 'position' => 'Backend Engineer', 'location' => 'Amsterdam',
            'status' => 'rejected', 'priority' => 'medium', 'source' => 'linkedin', 'salary' => [60000, 68000, 'EUR'],
            'applied' => 30, 'history' => [['applied', 'rejected', 21]],
        ],
        [
            'company' => 'Sunline Media', 'position' => 'Frontend Developer', 'location' => 'Antwerp',
            'status' => 'rejected', 'priority' => 'low', 'source' => 'job_board', 'applied' => 25,
            'history' => [['applied', 'interview', 18], ['interview', 'rejected', 11]],
            'interviews' => [
                ['in' => -15, 'at' => '16:00', 'type' => 'online', 'rating' => 2, 'debrief' => 'Struggled with the CSS layout task. Practise grid layouts.'],
            ],
        ],
        [
            'company' => 'Lattice Works', 'position' => 'Software Developer', 'location' => 'Brussels',
            'status' => 'no_response', 'priority' => 'low', 'source' => 'job_board', 'applied' => 40, 'history' => [['applied', 'no_response', 10]],
        ],
        [
            'company' => 'Riverbend Retail', 'position' => 'PHP Developer', 'location' => 'Mechelen',
            'status' => 'withdrawn', 'priority' => 'low', 'source' => 'recruiter', 'salary' => [45000, 50000, 'EUR'], 'applied' => 20,
            'history' => [['applied', 'interview', 15], ['interview', 'withdrawn', 12]],
            'notes' => 'Withdrew: mostly maintenance of an old WordPress setup.',
            'interviews' => [
                ['in' => -13, 'at' => '10:00', 'type' => 'phone', 'rating' => 3, 'debrief' => 'Nice people, but not the work I am looking for.'],
            ],
        ],
        // Archived: closed ones, out of the main list
        [
            'company' => 'Driftwood Agency', 'position' => 'PHP Developer', 'location' => 'Bruges',
            'status' => 'rejected', 'priority' => 'low', 'source' => 'job_board', 'applied' => 50, 'history' => [['applied', 'rejected', 40]], 'archived' => 38,
        ],
        [
            'company' => 'Summit Insurance', 'position' => 'Software Engineer', 'location' => 'Brussels',
            'status' => 'no_response', 'priority' => 'medium', 'source' => 'company_website', 'applied' => 60, 'history' => [['applied', 'no_response', 30]], 'archived' => 29,
        ],
        [
            'company' => 'Polar Bytes', 'position' => 'Junior Laravel Developer', 'location' => 'Ghent',
            'status' => 'rejected', 'priority' => 'medium', 'source' => 'linkedin', 'applied' => 45,
            'history' => [['applied', 'interview', 38], ['interview', 'rejected', 33]], 'archived' => 32, 'tags' => ['laravel'],
            'interviews' => [
                ['in' => -35, 'at' => '13:30', 'type' => 'onsite', 'location' => 'Polar Bytes, Ghent', 'rating' => 3, 'debrief' => 'They went with someone more senior.'],
            ],
        ],
    ];

    public function run(InterviewPrepService $prep): void
    {
        // The demo user and profile are created in DatabaseSeeder
        $user = User::where('email', config('app.demo_email'))->firstOrFail();
        $tags = collect(self::TAGS)->map(fn (TagColor $color, string $name) => $user->tags()->create(['name' => $name, 'color' => $color]));

        foreach (self::APPLICATIONS as $application) {
            $job = $this->createApplication($user, $application);

            $job->tags()->attach(collect($application['tags'] ?? [])->map(fn (string $name) => $tags[$name]->id));

            foreach ($application['interviews'] ?? [] as $interview) {
                $this->createInterview($user, $job, $interview, $prep);
            }
        }
    }

    /**
     * The application with its history, and created_at / updated_at / archived_at set to when those things happened
     *
     * @param  array<string, mixed>  $application
     */
    private function createApplication(User $user, array $application): JobApplication
    {
        $appliedOn = isset($application['applied']) ? Carbon::today()->subDays($application['applied']) : null;
        [$salaryMin, $salaryMax, $currency] = $application['salary'] ?? [null, null, 'EUR'];

        $job = $user->jobApplications()->create([
            'company_name' => $application['company'],
            'position' => $application['position'],
            'location' => $application['location'],
            'status' => $application['status'],
            'priority' => $application['priority'],
            'applied_date' => $appliedOn,
            'job_link' => 'https://jobs.example/'.Str::slug($application['company']).'/'.Str::slug($application['position']),
            'notes' => $application['notes'] ?? null,
            'salary_min' => $salaryMin,
            'salary_max' => $salaryMax,
            'salary_currency' => $currency,
            'source' => $application['source'],
            'contact_name' => $application['contact'][0] ?? null,
            'contact_details' => $application['contact'][1] ?? null,
            'deadline' => isset($application['deadline']) ? Carbon::today()->addDays($application['deadline']) : null,
            'is_archived' => isset($application['archived']),
        ]);

        $createdAt = $this->moment($application['applied'] ?? 3, '09:00');
        $lastChange = $createdAt;
        foreach ($application['history'] ?? [] as [$from, $to, $daysAgo]) {
            $lastChange = $this->moment($daysAgo, '11:15');
            $job->statusChanges()->create(['from_status' => $from, 'to_status' => $to, 'changed_at' => $lastChange]);
        }

        $archivedAt = isset($application['archived']) ? $this->moment($application['archived'], '17:00') : null;
        DB::table('job_applications')->where('id', $job->id)->update([
            'created_at' => $createdAt,
            'updated_at' => $archivedAt ?? $lastChange,
            'archived_at' => $archivedAt,
        ]);

        return $job;
    }

    /**
     * @param  array<string, mixed>  $interview
     */
    private function createInterview(User $user, JobApplication $job, array $interview, InterviewPrepService $prep): void
    {
        $type = InterviewType::from($interview['type']);
        $date = $this->moment(-$interview['in'], $interview['at']);
        $isPast = $interview['in'] < 0;

        $checklist = $prep->checklistFor($user, $type);
        $ticked = $isPast ? count($checklist) : ($interview['prep_done'] ?? 0);
        $checklist = array_map(fn (array $item, int $index) => [...$item, 'done' => $index < $ticked], $checklist, array_keys($checklist));

        $job->interviews()->create([
            'user_id' => $user->id,
            'interview_date' => $date,
            'type' => $type,
            'location' => $interview['location'] ?? ($type === InterviewType::Phone ? 'Phone call' : 'Video call'),
            'meeting_url' => $interview['meeting'] ?? null,
            'notes' => $interview['notes'] ?? null,
            'prep' => [
                ...Interview::EMPTY_PREP,
                'checklist' => $checklist,
                'people' => array_map(fn (array $person) => ['name' => $person[0], 'role' => $person[1], 'url' => null], $interview['people'] ?? []),
                'questions_to_ask' => $interview['ask'] ?? [],
            ],
            'rating' => $interview['rating'] ?? null,
            'debrief_notes' => $interview['debrief'] ?? null,
        ]);
    }

    /**
     * A time of day, some days ago
     */
    private function moment(int $daysAgo, string $time): CarbonInterface
    {
        [$hour, $minute] = explode(':', $time);

        return Carbon::today()->subDays($daysAgo)->setTime((int) $hour, (int) $minute);
    }
}
