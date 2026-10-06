<?php

declare(strict_types=1);

namespace DoaAqui\Repositories;

use DoaAqui\Database\Conexao;

class ModeracaoRepository
{
    public function registrar(int $idItem, int $idAdmin, string $acao, string $observacao): void
    {
        $pdo = Conexao::obter();
        $stmt = $pdo->prepare(
            'INSERT INTO moderacao (id_item, id_admin, acao, observacao)
             VALUES (:item, :admin, :acao, :observacao)'
        );
        $stmt->execute([
            'item' => $idItem,
            'admin' => $idAdmin,
            'acao' => $acao,
            'observacao' => $observacao !== '' ? $observacao : null,
        ]);
    }

    public function listarRecentes(int $limite = 20): array
    {
        $pdo = Conexao::obter();
        $stmt = $pdo->prepare(
            'SELECT m.id_moderacao, m.acao, m.observacao, m.data_acao,
                    i.titulo AS item_titulo, u.nome AS admin_nome
             FROM moderacao m
             JOIN item i ON i.id_item = m.id_item
             JOIN usuario u ON u.id_usuario = m.id_admin
             ORDER BY m.data_acao DESC
             LIMIT :limite'
        );
        $stmt->bindValue('limite', $limite, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }
}
