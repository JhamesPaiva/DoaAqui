<?php

declare(strict_types=1);

namespace DoaAqui\Repositories;

use DoaAqui\Database\Conexao;

class HistoricoStatusRepository
{
    public function registrar(int $idItem, string $statusAnteriorDb, string $statusNovoDb, int $alteradoPor): void
    {
        $pdo = Conexao::obter();
        $stmt = $pdo->prepare(
            'INSERT INTO historico_status (id_item, status_anterior, status_novo, alterado_por)
             VALUES (:item, :anterior, :novo, :usuario)'
        );
        $stmt->execute([
            'item' => $idItem,
            'anterior' => $statusAnteriorDb,
            'novo' => $statusNovoDb,
            'usuario' => $alteradoPor,
        ]);
    }

    public function listarPorItem(int $idItem): array
    {
        $pdo = Conexao::obter();
        $stmt = $pdo->prepare(
            'SELECT h.status_anterior, h.status_novo, h.data_alteracao, u.nome AS alterado_por_nome
             FROM historico_status h
             JOIN usuario u ON u.id_usuario = h.alterado_por
             WHERE h.id_item = :item
             ORDER BY h.data_alteracao DESC'
        );
        $stmt->execute(['item' => $idItem]);
        return $stmt->fetchAll();
    }
}
