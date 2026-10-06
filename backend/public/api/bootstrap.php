<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../src/autoload.php';

use DoaAqui\Http\Auth;
use DoaAqui\Http\Response;

// CORS: só libera a origem exata configurada no .env (nunca "*" — a API usa cookie
// de sessão, e "*" junto com credenciais é bloqueado pelo navegador mesmo, mas também
// seria um erro de configuração grave se não fosse).
$origemPermitida = env('CORS_ALLOWED_ORIGIN', '');
$origemRecebida = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origemPermitida !== '' && $origemRecebida === $origemPermitida) {
    header('Access-Control-Allow-Origin: ' . $origemPermitida);
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Vary: Origin');
}

// Requisição de pre-flight do navegador — responde vazio, sem tocar em sessão/banco.
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

Response::cabecalhosSeguranca();
Auth::iniciarSessao();

// Handler global: qualquer exceção não tratada vira log interno + resposta genérica.
// O cliente NUNCA recebe mensagem de exceção, caminho de arquivo ou query SQL.
set_exception_handler(static function (\Throwable $e): void {
    error_log('[ERRO NÃO TRATADO] ' . $e->getMessage() . ' em ' . $e->getFile() . ':' . $e->getLine());
    Response::erro('Erro interno no servidor.', 500);
});
