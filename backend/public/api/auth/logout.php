<?php

declare(strict_types=1);

require __DIR__ . '/../bootstrap.php';

use DoaAqui\Http\Auth;
use DoaAqui\Http\Request;
use DoaAqui\Http\Response;

Request::exigirMetodo('POST');
Auth::exigirLogin();
Auth::exigirCsrf();

Auth::deslogar();

Response::json(['ok' => true]);
