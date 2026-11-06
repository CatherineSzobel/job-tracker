<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/**
 * Salary range, source, contact person and deadline on an application.
 */
class ApplicationDetailsTest extends TestCase
{
    use RefreshDatabase;

    private const NEW_JOB = ['company_name' => 'Acme', 'position' => 'Developer'];

    public function test_a_new_application_keeps_its_details_and_the_salary_is_in_euros_unless_chosen(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/api/job-applications', [
            ...self::NEW_JOB,
            'salary_min' => 50000,
            'salary_max' => 60000,
            'source' => 'referral',
            'contact_name' => 'Jane Doe',
            'contact_details' => 'jane@acme.test',
            'deadline' => '2026-10-31',
        ])
            ->assertCreated()
            ->assertJsonPath('data.salary_min', 50000)
            ->assertJsonPath('data.salary_max', 60000)
            ->assertJsonPath('data.salary_currency', 'EUR')
            ->assertJsonPath('data.source', 'referral')
            ->assertJsonPath('data.contact_name', 'Jane Doe')
            ->assertJsonPath('data.contact_details', 'jane@acme.test')
            ->assertJsonPath('data.deadline', '2026-10-31');

        $this->postJson('/api/job-applications', [...self::NEW_JOB, 'salary_currency' => 'GBP'])
            ->assertCreated()
            ->assertJsonPath('data.salary_currency', 'GBP');
    }

    public function test_one_end_of_the_salary_range_is_checked_against_the_stored_other_end(): void
    {
        $user = User::factory()->create();
        $job = $user->jobApplications()->create([...self::NEW_JOB, 'salary_min' => 50000, 'salary_max' => 60000]);

        $this->actingAs($user)->patchJson("/api/job-applications/{$job->id}", ['salary_min' => 90000])
            ->assertJsonValidationErrors('salary_min');
        $this->actingAs($user)->patchJson("/api/job-applications/{$job->id}", ['salary_max' => 40000])
            ->assertJsonValidationErrors('salary_max');
        $this->actingAs($user)->patchJson("/api/job-applications/{$job->id}", ['salary_min' => 55000])
            ->assertOk()
            ->assertJsonPath('data.salary_min', 55000);
    }

    public function test_another_users_salary_range_is_not_revealed_by_validation(): void
    {
        $job = User::factory()->create()->jobApplications()->create([...self::NEW_JOB, 'salary_min' => 50000, 'salary_max' => 60000]);

        $this->actingAs(User::factory()->create())
            ->patchJson("/api/job-applications/{$job->id}", ['salary_min' => 90000])
            ->assertNotFound()
            ->assertJsonMissingValidationErrors('salary_min');
    }

    public function test_details_can_be_changed_and_cleared(): void
    {
        $user = User::factory()->create();
        $job = $user->jobApplications()->create([...self::NEW_JOB, 'salary_min' => 40000, 'source' => 'linkedin', 'deadline' => '2026-10-31']);

        $this->actingAs($user)->putJson("/api/job-applications/{$job->id}", [
            'salary_min' => null,
            'salary_max' => 70000,
            'contact_details' => 'https://linkedin.com/in/jane',
        ])
            ->assertOk()
            ->assertJsonPath('data.salary_min', null)
            ->assertJsonPath('data.salary_max', 70000)
            ->assertJsonPath('data.contact_details', 'https://linkedin.com/in/jane');

        $this->putJson("/api/job-applications/{$job->id}", ['source' => null, 'deadline' => null])
            ->assertOk()
            ->assertJsonPath('data.source', null)
            ->assertJsonPath('data.deadline', null);
    }

    /**
     * @return array<string, array{array<string, mixed>, string}>
     */
    public static function invalidDetails(): array
    {
        return [
            'maximum below the minimum' => [['salary_min' => 60000, 'salary_max' => 50000], 'salary_max'],
            'negative salary' => [['salary_min' => -1], 'salary_min'],
            'unknown currency' => [['salary_currency' => 'XYZ'], 'salary_currency'],
            'source outside the list' => [['source' => 'newspaper'], 'source'],
            'contact that is neither email nor link' => [['contact_details' => 'call Jane'], 'contact_details'],
            'contact link that is not http(s)' => [['contact_details' => 'javascript:alert(1)'], 'contact_details'],
            'deadline that is not a date' => [['deadline' => '31/10/2026'], 'deadline'],
        ];
    }

    /**
     * @param  array<string, mixed>  $details
     */
    #[DataProvider('invalidDetails')]
    public function test_invalid_details_are_rejected_on_create_and_update(array $details, string $errorKey): void
    {
        $user = User::factory()->create();
        $job = $user->jobApplications()->create(self::NEW_JOB);

        $this->actingAs($user)->postJson('/api/job-applications', [...self::NEW_JOB, ...$details])
            ->assertUnprocessable()
            ->assertJsonValidationErrors($errorKey);
        $this->putJson("/api/job-applications/{$job->id}", $details)
            ->assertUnprocessable()
            ->assertJsonValidationErrors($errorKey);
    }
}
