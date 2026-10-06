<?php

declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

use DoaAqui\Http\Response;
use DoaAqui\Repositories\BairroRepository;

Response::json(['bairros' => (new BairroRepository())->listarAtivos()]);
