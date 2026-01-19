<?php
// DB
define('DB_HOST', 'localhost');
define('DB_NAME', 'usuario_montilla_leads');
define('DB_USER', 'usuario_montilla_user');
define('DB_PASS', 'montillasholding2708');

// Email destino
define('LEADS_TO_EMAIL', 'montillasholding@gmail.com');

// Admin (login simple por sesión)
define('ADMIN_USER', 'admin');
define('ADMIN_PASS', 'montillasholdingJM'); // mínimo 16 chars

// Rate limit básico (segundos)
define('RATE_LIMIT_SECONDS', 20);

// Dominio / origen esperado (opcional)
define('ALLOWED_ORIGIN', 'https://montillasholding.com');