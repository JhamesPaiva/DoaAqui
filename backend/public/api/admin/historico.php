<?php

declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

use DoaAqui\Http\Auth;
use DoaAqui\Http\Request;
use DoaAqui\Http\Response;
use DoaAqui\Services\ModeracaoService;

Auth::exigirAdmin();

$idItem = Request::queryInteiro('item_id');
if (!$idItem) {
    Response::erro('Informe item_id na query string.', 422);
}

Response::json(['historico' => (new ModeracaoService())->historicoDoItem($idItem)]);
