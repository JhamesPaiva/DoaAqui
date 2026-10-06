<?php

declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

use DoaAqui\Http\Auth;
use DoaAqui\Http\Request;
use DoaAqui\Http\Response;
use DoaAqui\Services\AuthService;

Request::exigirMetodo('POST');

$email = Request::texto('email');
$senha = Request::texto('senha');
$ip = $_SERVER['REMOTE_ADDR'] ?? 'desconhecido';

$resultado = (new AuthService())->logar($email, $senha, $ip);

if (!$resultado['ok']) {
    Response::erro($resultado['erro'], $resultado['status'] ?? 401);
}

Response::json([
    'usuario' => $resultado['usuario'],
    'csrfToken' => Auth::tokenCsrf(),
]);
