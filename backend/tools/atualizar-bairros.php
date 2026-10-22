<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__ . '/../config/config.php';
require __DIR__ . '/../src/autoload.php';
$pdo = DoaAqui\Database\Conexao::obter();
$pdo->beginTransaction();
try {
    $antes = (int) $pdo->query('SELECT COUNT(*) FROM bairro')->fetchColumn();
    $pdo->exec(file_get_contents(__DIR__ . '/../database/bairros-muriae.sql'));
    $depois = (int) $pdo->query('SELECT COUNT(*) FROM bairro')->fetchColumn();
    $pdo->commit();
    echo 'Bairros adicionados: ' . ($depois - $antes) . '. Total: ' . $depois . PHP_EOL;
} catch (Throwable $e) {
    $pdo->rollBack();
    fwrite(STDERR, 'Não foi possível atualizar os bairros. Nenhuma alteração foi aplicada.' . PHP_EOL);
    exit(1);
}
