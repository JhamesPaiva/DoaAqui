<?php

declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

use DoaAqui\Http\Auth;
use DoaAqui\Http\Request;
use DoaAqui\Http\Response;
use DoaAqui\Services\AuthService;

Request::exigirMetodo('POST');

$nome = Request::texto('nome');
$email = Request::texto('email');
$senha = Request::texto('senha');
$telefone = Request::texto('telefone');

$resultado = (new AuthService())->cadastrar($nome, $email, $senha, $telefone);

if (!$resultado['ok']) {
    Response::erro($resultado['erro'], 422);
}

Response::json([
    'usuario' => $resultado['usuario'],
    'csrfToken' => Auth::tokenCsrf(),
], 201);
