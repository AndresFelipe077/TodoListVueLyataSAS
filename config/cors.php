<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => [
        'api/*',
        'sanctum/*',
        'login',
        'logout',
        'register',
        'forgot-password',
        'reset-password',
        'email/verify/*',
        'email/verification-notification',
        'sanctum/csrf-cookie',
        'refresh-token',
        'api/refresh-token',
        'api/login',
        'api/logout',
        'api/register',
        'api/forgot-password',
        'api/reset-password',
        'api/email/verify/*',
        'api/email/verification-notification',
        'api/user',
    ],

    /*
    |--------------------------------------------------------------------------
    | Allowed HTTP Methods
    |--------------------------------------------------------------------------
    |
    | This array contains the HTTP methods that are allowed when making cross-
    | origin requests. You can use ['*'] to allow all methods.
    |
    */
    'allowed_methods' => ['*'],

    /*
    |--------------------------------------------------------------------------
    | Allowed Request Origins
    |--------------------------------------------------------------------------
    |
    | This array contains the origins that are allowed to make cross-origin
    | requests. You can use ['*'] to allow all origins.
    |
    */
    'allowed_origins' => ['*'],

    /*
    |--------------------------------------------------------------------------
    | Allowed Origins Patterns
    |--------------------------------------------------------------------------
    |
    | Here you may specify regular expression patterns for origins that should
    | be allowed, including wildcard subdomains.
    |
    */
    'allowed_origins_patterns' => [],

    /*
    |--------------------------------------------------------------------------
    | Allowed Headers
    |--------------------------------------------------------------------------
    |
    | This array contains the headers that are allowed when making cross-origin
    | requests. You can use ['*'] to allow all headers.
    |
    */
    'allowed_headers' => [
        'Origin',
        'Content-Type',
        'X-Auth-Token',
        'Authorization',
        'X-Requested-With',
        'X-CSRF-TOKEN',
        'X-Socket-Id',
        'X-Socket-Auth',
        'X-XSRF-TOKEN',
        'Accept',
        'X-Requested-With',
        'X-Custom-Header',
        'X-Forwarded-For',
        'X-Forwarded-Host',
        'X-Forwarded-Proto',
    ],

    /*
    |--------------------------------------------------------------------------
    | Exposed Headers
    |--------------------------------------------------------------------------
    |
    | This array contains the headers that are exposed to the browser when making
    | a cross-origin request.
    |
    */
    'exposed_headers' => [
        'Authorization',
        'X-CSRF-TOKEN',
        'X-XSRF-TOKEN',
        'X-Auth-Status',
        'X-User-Id',
    ],

    /*
    |--------------------------------------------------------------------------
    | Max Age
    |--------------------------------------------------------------------------
    |
    | This value sets the Access-Control-Max-Age header which specifies how long
    | the results of a preflight request can be cached.
    |
    */
    'max_age' => 60 * 60 * 24, // 24 horas

    /*
    |--------------------------------------------------------------------------
    | Supports Credentials
    |--------------------------------------------------------------------------
    |
    | This value determines whether the browser should include credentials like
    | cookies, authorization headers or TLS client certificates in cross-origin
    | requests. Set to true to allow credentials.
    |
    */
    'supports_credentials' => true,

];
