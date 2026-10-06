<?php

declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

use DoaAqui\Http\Auth;
use DoaAqui\Http\Response;
use DoaAqui\Services\ModeracaoService;

Auth::exigirAdmin();

Response::json(['log' => (new ModeracaoService())->logModeracao(20)]);
