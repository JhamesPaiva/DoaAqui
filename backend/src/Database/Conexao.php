<?php

declare(strict_types=1);

namespace DoaAqui\Database;

use PDO;
use PDOException;
use RuntimeException;

/**
 * Ponto único de acesso ao banco. Todo o resto do backend (repositórios) passa
 * por aqui — nenhuma outra classe abre conexão própria ou monta DSN na mão.
 */
class Conexao
{
    private static ?PDO $instancia = null;

    public static function obter(): PDO
    {
        if (self::$instancia === null) {
            $host = env('DB_HOST', '127.0.0.1');
            $porta = env('DB_PORT', '3306');
            $banco = env('DB_NAME', 'doaaqui');
            $usuario = env('DB_USER');
            $senha = env('DB_PASS');

            $dsn = "mysql:host={$host};port={$porta};dbname={$banco};charset=utf8mb4";

            try {
                self::$instancia = new PDO($dsn, $usuario, $senha, [
                    // Toda falha de banco vira exceção — nunca um "false" silencioso
                    // que alguém esquece de checar.
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    // Desliga a emulação de prepared statements: usa o suporte nativo
                    // do driver MySQL, que é a defesa real contra SQL injection.
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::ATTR_STRINGIFY_FETCHES => false,
                ]);
            } catch (PDOException $e) {
                error_log('[Conexao] Falha ao conectar ao banco: ' . $e->getMessage());
                // A mensagem exata do erro de conexão (host, credenciais) nunca vai pro cliente.
                throw new RuntimeException('Não foi possível conectar ao banco de dados.');
            }
        }

        return self::$instancia;
    }
}
