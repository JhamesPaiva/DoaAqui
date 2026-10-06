<?php

declare(strict_types=1);

namespace DoaAqui\Security;

/**
 * Limita tentativas de login por combinação e-mail+IP, pra dificultar força bruta
 * e credential stuffing. Implementado com arquivo em vez de tabela no banco pra não
 * mexer no schema já revisado, e sem Redis/Memcached pra não introduzir dependência
 * forte num protótipo acadêmico — em produção de verdade, isso viraria uma tabela
 * ou um cache dedicado.
 */
class LoginThrottle
{
    private const MAX_TENTATIVAS = 5;
    private const JANELA_SEGUNDOS = 900; // 15 minutos

    private static function arquivo(string $identificador): string
    {
        $dir = dirname(__DIR__, 2) . '/storage/login_throttle';
        if (!is_dir($dir)) {
            mkdir($dir, 0700, true);
        }
        return $dir . '/' . hash('sha256', $identificador) . '.json';
    }

    public static function bloqueado(string $identificador): bool
    {
        return count(self::lerTentativasValidas($identificador)) >= self::MAX_TENTATIVAS;
    }

    public static function registrarFalha(string $identificador): void
    {
        $tentativas = self::lerTentativasValidas($identificador);
        $tentativas[] = time();
        file_put_contents(self::arquivo($identificador), json_encode($tentativas), LOCK_EX);
    }

    public static function limpar(string $identificador): void
    {
        $arquivo = self::arquivo($identificador);
        if (file_exists($arquivo)) {
            unlink($arquivo);
        }
    }

    private static function lerTentativasValidas(string $identificador): array
    {
        $arquivo = self::arquivo($identificador);
        if (!file_exists($arquivo)) {
            return [];
        }

        $tentativas = json_decode((string) file_get_contents($arquivo), true) ?: [];
        $agora = time();

        // Descarta tentativas fora da janela de tempo (não bloqueia pra sempre).
        return array_values(array_filter(
            $tentativas,
            fn ($momento) => ($agora - $momento) < self::JANELA_SEGUNDOS
        ));
    }
}
