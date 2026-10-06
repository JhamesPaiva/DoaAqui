<?php

declare(strict_types=1);

namespace DoaAqui\Repositories;

use DoaAqui\Database\Conexao;

class CategoriaRepository
{
    public function listarAtivas(): array
    {
        $pdo = Conexao::obter();
        $stmt = $pdo->query('SELECT id_categoria, nome, descricao FROM categoria WHERE ativo = 1 ORDER BY nome');
        return $stmt->fetchAll();
    }

    /** Usada ao publicar um item: o front-end manda o nome da categoria, não o id. */
    public function buscarPorNome(string $nome): ?array
    {
        $pdo = Conexao::obter();
        $stmt = $pdo->prepare('SELECT id_categoria, nome FROM categoria WHERE nome = :nome AND ativo = 1 LIMIT 1');
        $stmt->execute(['nome' => $nome]);
        $linha = $stmt->fetch();
        return $linha ?: null;
    }
}
