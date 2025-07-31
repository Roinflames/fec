<?php

return [

    'paths' => ['api/*', 'register', 'login', '*'], // añade tus rutas aquí

    'allowed_methods' => ['*'], // o ['GET', 'POST', ...] si quieres restringir

    'allowed_origins' => [
        'https://fec-two.vercel.app',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
