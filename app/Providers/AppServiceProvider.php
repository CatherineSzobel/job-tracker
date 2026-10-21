<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Rules for new passwords (register + change password)
        Password::defaults(fn () => Password::min(8));

        // Register: 5 attempts per minute per email + IP (login limits failed attempts in LoginRequest)
        RateLimiter::for('register', function (Request $request) {
            return Limit::perMinute(5)->by(strtolower((string) $request->input('email')).'|'.$request->ip());
        });

        // Every logged-in API route: 60 a minute per user. The shared demo account also counts per IP,
        // so one visitor can't use up the limit for the others.
        RateLimiter::for('api', function (Request $request) {
            $user = $request->user();
            $key = match (true) {
                $user === null => $request->ip(),
                $user->isDemo() => $user->id.'|'.$request->ip(),
                default => (string) $user->id,
            };

            return Limit::perMinute(60)->by($key);
        });
    }
}
