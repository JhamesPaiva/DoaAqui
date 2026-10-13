<?php

declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

use DoaAqui\Http\Auth;
use DoaAqui\Http\Request;
use DoaAqui\Http\Response;
use DoaAqui\Services\ItemService;

Request::exigirMetodo('POST');
$usuario = Auth::exigirLogin();
Auth::exigirCsrf();

$dados = [
    'titulo' => Request::texto('titulo'),
    'categoria' => Request::texto('categoria'),
    'bairro' => Request::texto('bairro'),
    'descricao' => Request::texto('descricao'),
    'contato' => Request::texto('contato'),
    'fotoUrl' => Request::texto('fotoUrl'),
];

$resultado = (new ItemService())->publicar($usuario, $dados);

if (!$resultado['ok']) {
    Response::erro($resultado['erro'], 422);
}

Response::json(['item' => $resultado['item']], 201);
