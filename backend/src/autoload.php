<?php

declare(strict_types=1);

/**
 * Autoloader manual, sem Composer — mapeia o namespace "DoaAqui\" para esta pasta,
 * seguindo a mesma convenção do PSR-4 (namespace = caminho de pastas), só que escrito
 * à mão pra não introduzir uma dependência de gerenciador de pacotes num projeto acadêmico.
 */
spl_autoload_register(function (string $classe): void {
    $prefixo = 'DoaAqui\\';

    if (!str_starts_with($classe, $prefixo)) {
        return;
    }

    $caminhoRelativo = str_replace('\\', '/', substr($classe, strlen($prefixo)));
    $arquivo = __DIR__ . '/' . $caminhoRelativo . '.php';

    if (file_exists($arquivo)) {
        require $arquivo;
    }
});
