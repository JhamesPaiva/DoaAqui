<?php

declare(strict_types=1);

namespace DoaAqui\Http;

class Validador
{
    public static function emailValido(string $email): bool
    {
        return (bool) filter_var($email, FILTER_VALIDATE_EMAIL);
    }

    public static function tamanho(string $valor, int $min, int $max): bool
    {
        $tamanho = mb_strlen($valor);
        return $tamanho >= $min && $tamanho <= $max;
    }

    /** Valida contra uma lista fechada de valores — usado nos ENUMs (status, tipo, ação). */
    public static function dentroDe(string $valor, array $permitidos): bool
    {
        return in_array($valor, $permitidos, true);
    }
}
