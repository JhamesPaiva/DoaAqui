<?php

declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

use DoaAqui\Http\Auth;
use DoaAqui\Http\Request;
use DoaAqui\Http\Response;
use DoaAqui\Services\ItemService;

Request::exigirMetodo('POST');
$admin = Auth::exigirAdmin();
Auth::exigirCsrf();

$idItem = Request::inteiro('id');
$status = Request::texto('status');

if (!$idItem || $status === '') {
    Response::erro('Informe o id do item e o novo status.', 422);
}

$resultado = (new ItemService())->mudarStatus($idItem, $status, $admin, true);

if (!$resultado['ok']) {
    Response::erro($resultado['erro'], $resultado['status'] ?? 422);
}

Response::json(['ok' => true, 'alterado' => $resultado['alterado'] ?? false]);
