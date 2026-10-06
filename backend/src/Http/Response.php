<?php

declare(strict_types=1);

namespace DoaAqui\Http;

class Response
{
    /**
     * Cabeçalhos aplicados em toda resposta da API, independente do endpoint.
     * Cada um bloqueia uma classe de ataque específica — nenhum é "boilerplate".
     */
    public static function cabecalhosSeguranca(): void
    {
        // Não expõe a versão do PHP rodando no servidor (informação útil pra quem for
        // procurar uma vulnerabilidade conhecida daquela versão específica).
        header_remove('X-Powered-By');
        // Impede o navegador de tentar "adivinhar" o tipo do conteúdo (MIME sniffing).
        header('X-Content-Type-Options: nosniff');
        // A API nunca deve ser embutida em <iframe> de outro site (clickjacking).
        header('X-Frame-Options: DENY');
        header('Referrer-Policy: no-referrer-strict-when-cross-origin');
        // Resposta é sempre JSON puro — não faz sentido carregar script/estilo/imagem aqui.
        header("Content-Security-Policy: default-src 'none'; frame-ancestors 'none'");
        header('Content-Type: application/json; charset=utf-8');
    }

    public static function json($dados, int $status = 200): void
    {
        http_response_code($status);
        echo json_encode($dados, JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function erro(string $mensagem, int $status = 400, array $extra = []): void
    {
        self::json(array_merge(['erro' => $mensagem], $extra), $status);
    }
}
