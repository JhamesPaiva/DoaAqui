<?php

declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

use DoaAqui\Http\Auth;
use DoaAqui\Http\Request;
use DoaAqui\Http\Response;
use DoaAqui\Services\UploadService;

Request::exigirMetodo('POST');
Auth::exigirLogin();
Auth::exigirCsrf();

if (empty($_FILES['foto'])) {
    Response::erro('Envie o arquivo no campo "foto".', 422);
}

$resultado = (new UploadService())->salvar($_FILES['foto']);

if (!$resultado['ok']) {
    Response::erro($resultado['erro'], 422);
}

Response::json(['url' => $resultado['url']], 201);
