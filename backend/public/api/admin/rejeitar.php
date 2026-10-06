<?php

declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

use DoaAqui\Http\Auth;
use DoaAqui\Http\Request;
use DoaAqui\Http\Response;
use DoaAqui\Services\ModeracaoService;

Request::exigirMetodo('POST');
$admin = Auth::exigirAdmin();
Auth::exigirCsrf();

$idItem = Request::inteiro('id');
if (!$idItem) {
    Response::erro('Informe o id do item.', 422);
}

$observacao = Request::texto('observacao');

$resultado = (new ModeracaoService())->rejeitar($admin['id'], $idItem, $observacao);

if (!$resultado['ok']) {
    Response::erro($resultado['erro'], 404);
}

Response::json(['ok' => true]);
