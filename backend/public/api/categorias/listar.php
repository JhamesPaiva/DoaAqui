<?php

declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

use DoaAqui\Http\Response;
use DoaAqui\Repositories\CategoriaRepository;

Response::json(['categorias' => (new CategoriaRepository())->listarAtivas()]);
