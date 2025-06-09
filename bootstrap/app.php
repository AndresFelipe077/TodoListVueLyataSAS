<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Middleware\HandleCors;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

$app = Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            // Configure rate limiting
            RateLimiter::for('api', function (Request $request) {
                return Limit::perMinute(60)->by(optional($request->user())->id ?: $request->ip());
            });
        },
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        // Configuración de CORS para todas las rutas
        $middleware->validateCsrfTokens(except: [
            'api/*',
            'login',
            'logout',
            'register',
            'password/*',
            'forgot-password',
            'reset-password',
            'email/verify/*',
            'email/verification-notification',
            'sanctum/csrf-cookie',
            'refresh-token',
        ]);

        // Configurar el middleware CORS
        $middleware->append(HandleCors::class);

        // Configurar middleware web
        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Configuración de proxies de confianza
        $middleware->trustProxies(
            headers: Request::HEADER_X_FORWARDED_FOR |
                     Request::HEADER_X_FORWARDED_HOST |
                     Request::HEADER_X_FORWARDED_PORT |
                     Request::HEADER_X_FORWARDED_PROTO |
                     Request::HEADER_X_FORWARDED_AWS_ELB
        );

        // Configurar hosts de confianza para proxies
        $middleware->trustHosts([
            '^.+\\.?localhost$',
            '^.+\\.?lyata\\.test$',
            '^.+\\.?lyata-sas\\.com$',
        ]);

        // Configurar cabeceras CORS
        $middleware->appendToGroup('api', [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
            'throttle:api',
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    });

return $app->create();
