<?php

declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

use DoaAqui\Http\Auth;
use DoaAqui\Http\Response;
use DoaAqui\Services\ItemService;

$usuario = Auth::exigirLogin();

Response::json((new ItemService())->listarMeusAnuncios($usuario['id']));
