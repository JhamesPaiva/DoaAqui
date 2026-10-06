<?php

declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

use DoaAqui\Http\Auth;
use DoaAqui\Http\Response;

$usuario = Auth::usuarioLogado();

if (!$usuario) {
    Response::json(['usuario' => null]);
}

Response::json([
    'usuario' => $usuario,
    'csrfToken' => Auth::tokenCsrf(),
]);
