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

$corpo = Request::corpoJson();
$dados = [
    'titulo' => Request::texto('titulo'),
    'categoria' => Request::texto('categoria'),
    'bairro' => Request::texto('bairro'),
    'descricao' => Request::texto('descricao'),
    'contato' => Request::texto('contato'),
    'fotoUrl' => Request::texto('fotoUrl'),
    'contatoPublico' => ($corpo['contatoPublico'] ?? false) === true,
];

$resultado = (new ModeracaoService())->editar($admin['id'], $idItem, $dados);

if (!$resultado['ok']) {
    Response::erro($resultado['erro'], 422);
}

Response::json(['ok' => true]);
