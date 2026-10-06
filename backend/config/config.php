<?php

declare(strict_types=1);

/**
 * Bootstrap de configuração. Não depende de nenhuma lib externa (Composer/vendor) —
 * o .env é lido por um parser simples, propositalmente ingênuo, o suficiente pra um
 * projeto acadêmico sem introduzir uma dependência forte só por causa disso.
 */

function carregarEnv(string $caminho): void
{
    if (!file_exists($caminho)) {
        return;
    }

    $linhas = file($caminho, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($linhas as $linha) {
        $linha = trim($linha);
        if ($linha === '' || str_starts_with($linha, '#')) {
            continue;
        }

        $partes = explode('=', $linha, 2);
        if (count($partes) !== 2) {
            continue;
        }

        $chave = trim($partes[0]);
        $valor = trim($partes[1], " \t\n\r\0\x0B\"'");

        if ($chave !== '' && getenv($chave) === false) {
            putenv("{$chave}={$valor}");
            $_ENV[$chave] = $valor;
        }
    }
}

function env(string $chave, $padrao = null)
{
    $valor = getenv($chave);
    return $valor === false ? $padrao : $valor;
}

carregarEnv(__DIR__ . '/../.env');

// Erros de PHP NUNCA aparecem na resposta HTTP (evitaria vazar caminho de arquivo,
// query SQL ou stack trace pro cliente) — sempre vão só pro log do servidor.
ini_set('display_errors', '0');
ini_set('log_errors', '1');
ini_set('error_log', __DIR__ . '/../storage/logs/php-error.log');
error_reporting(E_ALL);

date_default_timezone_set('America/Sao_Paulo');
