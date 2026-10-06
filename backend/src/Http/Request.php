<?php

declare(strict_types=1);

namespace DoaAqui\Http;

class Request
{
    private static ?array $corpo = null;

    /**
     * Lê o corpo da requisição como JSON uma única vez por request.
     * Nunca confia no tipo declarado: se não for um array/objeto JSON válido,
     * devolve array vazio em vez de deixar o chamador lidar com null/erro.
     */
    public static function corpoJson(): array
    {
        if (self::$corpo === null) {
            $bruto = file_get_contents('php://input');
            $decodificado = json_decode((string) $bruto, true);
            self::$corpo = is_array($decodificado) ? $decodificado : [];
        }

        return self::$corpo;
    }

    public static function texto(string $chave, string $padrao = ''): string
    {
        $dados = self::corpoJson();
        $valor = $dados[$chave] ?? $padrao;
        return is_string($valor) ? trim($valor) : $padrao;
    }

    public static function inteiro(string $chave, ?int $padrao = null): ?int
    {
        $dados = self::corpoJson();
        if (!isset($dados[$chave]) || !is_numeric($dados[$chave])) {
            return $padrao;
        }
        return (int) $dados[$chave];
    }

    public static function metodo(): string
    {
        return $_SERVER['REQUEST_METHOD'] ?? 'GET';
    }

    public static function exigirMetodo(string $metodo): void
    {
        if (self::metodo() !== $metodo) {
            Response::erro('Método não permitido.', 405);
        }
    }

    public static function queryInteiro(string $chave, ?int $padrao = null): ?int
    {
        if (!isset($_GET[$chave]) || !is_numeric($_GET[$chave])) {
            return $padrao;
        }
        return (int) $_GET[$chave];
    }
}
