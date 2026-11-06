<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Str;

/**
 * An email address or an http(s) link, e.g. how to reach an application's contact person.
 */
class EmailOrUrl implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $isEmail = is_string($value) && filter_var($value, FILTER_VALIDATE_EMAIL) !== false;
        $isUrl = is_string($value) && Str::isUrl($value, ['http', 'https']);

        if (! $isEmail && ! $isUrl) {
            $fail('The :attribute must be an email address or a link starting with http:// or https://.');
        }
    }
}
