<?php

declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

use DoaAqui\Http\Response;
use DoaAqui\Services\ItemService;

Response::json(['itens' => (new ItemService())->listarPublicos()]);
