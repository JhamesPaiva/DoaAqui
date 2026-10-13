<?php

declare(strict_types=1);

namespace DoaAqui\Repositories;

use DoaAqui\Database\Conexao;

class ItemRepository
{
    public function buscarPorId(int $id): ?array
    {
        $pdo = Conexao::obter();
        $stmt = $pdo->prepare('SELECT * FROM item WHERE id_item = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $linha = $stmt->fetch();
        return $linha ?: null;
    }

    /** Fila de moderação: itens ainda não avaliados pelo admin. */
    public function listarPendentes(): array
    {
        $pdo = Conexao::obter();
        $sql = 'SELECT i.id_item, i.titulo, i.descricao,
                       c.nome AS categoria, b.nome AS bairro
                FROM item i
                JOIN categoria c ON c.id_categoria = i.id_categoria
                JOIN bairro b ON b.id_bairro = i.id_bairro
                WHERE i.status_moderacao = "Pendente"
                ORDER BY i.data_publicacao ASC';
        return $pdo->query($sql)->fetchAll();
    }

    /** Itens já aprovados (visão do admin — inclui todos os status, não só Disponível). */
    public function listarAprovadosAdmin(): array
    {
        $pdo = Conexao::obter();
        $sql = 'SELECT i.id_item, i.titulo, i.descricao, i.foto_url, i.contato_whatsapp, i.status,
                       i.id_usuario_doador,
                       c.nome AS categoria, b.nome AS bairro
                FROM item i
                JOIN categoria c ON c.id_categoria = i.id_categoria
                JOIN bairro b ON b.id_bairro = i.id_bairro
                WHERE i.status_moderacao = "Aprovado" AND i.removido_em IS NULL
                ORDER BY i.data_publicacao DESC';
        return $pdo->query($sql)->fetchAll();
    }

    /** Pendentes + aprovados (não removidos) de um doador específico — usado em "Meus anúncios". */
    public function listarDoUsuario(int $idUsuario): array
    {
        $pdo = Conexao::obter();

        $stmtPendentes = $pdo->prepare(
            'SELECT i.id_item, i.titulo, c.nome AS categoria, b.nome AS bairro
             FROM item i
             JOIN categoria c ON c.id_categoria = i.id_categoria
             JOIN bairro b ON b.id_bairro = i.id_bairro
             WHERE i.id_usuario_doador = :id AND i.status_moderacao = "Pendente"
             ORDER BY i.data_publicacao DESC'
        );
        $stmtPendentes->execute(['id' => $idUsuario]);

        $stmtPublicados = $pdo->prepare(
            'SELECT i.id_item, i.titulo, i.status, c.nome AS categoria
             FROM item i
             JOIN categoria c ON c.id_categoria = i.id_categoria
             WHERE i.id_usuario_doador = :id AND i.status_moderacao = "Aprovado" AND i.removido_em IS NULL
             ORDER BY i.data_publicacao DESC'
        );
        $stmtPublicados->execute(['id' => $idUsuario]);

        return [
            'pendentes' => $stmtPendentes->fetchAll(),
            'publicados' => $stmtPublicados->fetchAll(),
        ];
    }

    public function aprovar(int $id): void
    {
        $pdo = Conexao::obter();
        $stmt = $pdo->prepare('UPDATE item SET status_moderacao = "Aprovado" WHERE id_item = :id');
        $stmt->execute(['id' => $id]);
    }

    public function rejeitar(int $id): void
    {
        $pdo = Conexao::obter();
        $stmt = $pdo->prepare('UPDATE item SET status_moderacao = "Rejeitado" WHERE id_item = :id');
        $stmt->execute(['id' => $id]);
    }

    public function editar(int $id, array $dados): void
    {
        $pdo = Conexao::obter();

        if (array_key_exists('foto_url', $dados) && $dados['foto_url'] !== null) {
            $stmt = $pdo->prepare(
                'UPDATE item SET titulo = :titulo, descricao = :descricao,
                        id_categoria = :categoria, id_bairro = :bairro, contato_whatsapp = :contato,
                        foto_url = :foto_url
                 WHERE id_item = :id'
            );
            $stmt->bindValue('foto_url', $dados['foto_url']);
        } else {
            $stmt = $pdo->prepare(
                'UPDATE item SET titulo = :titulo, descricao = :descricao,
                        id_categoria = :categoria, id_bairro = :bairro, contato_whatsapp = :contato
                 WHERE id_item = :id'
            );
        }

        $stmt->bindValue('titulo', $dados['titulo']);
        $stmt->bindValue('descricao', $dados['descricao']);
        $stmt->bindValue('categoria', $dados['id_categoria']);
        $stmt->bindValue('bairro', $dados['id_bairro']);
        $stmt->bindValue('contato', $dados['contato_whatsapp'] !== '' ? $dados['contato_whatsapp'] : null);
        $stmt->bindValue('id', $id);
        $stmt->execute();
    }

    /** Soft delete — nunca apaga a linha, só marca removido_em (preserva moderação/histórico). */
    /** Retira o anúncio de circulação sem apagar fotos ou histórico. */
    public function removerPublicadoDoUsuario(int $id, int $idUsuario): bool
    {
        $stmt = Conexao::obter()->prepare(
            'UPDATE item SET removido_em = NOW()
             WHERE id_item = :id AND id_usuario_doador = :usuario
               AND status_moderacao = "Aprovado" AND removido_em IS NULL'
        );
        $stmt->execute(['id' => $id, 'usuario' => $idUsuario]);
        return $stmt->rowCount() === 1;
    }

    public function remover(int $id): void
    {
        $pdo = Conexao::obter();
        $stmt = $pdo->prepare('UPDATE item SET removido_em = NOW() WHERE id_item = :id');
        $stmt->execute(['id' => $id]);
    }

    public function atualizarStatus(int $id, string $statusDb): void
    {
        $pdo = Conexao::obter();
        $stmt = $pdo->prepare('UPDATE item SET status = :status WHERE id_item = :id');
        $stmt->execute(['status' => $statusDb, 'id' => $id]);
    }

    /**
     * Cancela um item ainda pendente do próprio doador. É o único caso em que
     * de fato apagamos a linha (DELETE, não soft delete): nada mais no banco
     * referencia um item que nunca chegou a ser moderado, então não sobra órfão.
     */
    public function cancelarPendenteDoUsuario(int $id, int $idUsuario): bool
    {
        $pdo = Conexao::obter();
        $stmt = $pdo->prepare(
            'DELETE FROM item WHERE id_item = :id AND id_usuario_doador = :usuario AND status_moderacao = "Pendente"'
        );
        $stmt->execute(['id' => $id, 'usuario' => $idUsuario]);
        return $stmt->rowCount() > 0;
    }

    public function contagensPainel(): array
    {
        $pdo = Conexao::obter();
        $sql = 'SELECT
                    (SELECT COUNT(*) FROM item WHERE status_moderacao = "Pendente") AS pendentes,
                    (SELECT COUNT(*) FROM item WHERE status_moderacao = "Aprovado" AND removido_em IS NULL AND status = "Disponivel") AS disponiveis,
                    (SELECT COUNT(*) FROM item WHERE status_moderacao = "Aprovado" AND removido_em IS NULL AND status = "Doado") AS doados,
                    (SELECT COUNT(*) FROM item WHERE status_moderacao = "Aprovado" AND removido_em IS NULL) AS total';
        return $pdo->query($sql)->fetch();
    }

    public function categoriasMaisDoadas(): array
    {
        $pdo = Conexao::obter();
        $sql = 'SELECT c.nome AS categoria, COUNT(*) AS total
                FROM item i
                JOIN categoria c ON c.id_categoria = i.id_categoria
                WHERE i.status = "Doado" AND i.status_moderacao = "Aprovado" AND i.removido_em IS NULL
                GROUP BY c.nome
                ORDER BY total DESC';
        return $pdo->query($sql)->fetchAll();
    }

    /** Feed público do mural: só itens aprovados pela moderação e não removidos. */
    public function listarAprovados(): array
    {
        $pdo = Conexao::obter();
        $sql = 'SELECT
                    i.id_item, i.titulo, i.descricao, i.foto_url, i.contato_whatsapp,
                    i.status, i.data_publicacao, i.data_atualizacao,
                    c.nome AS categoria, b.nome AS bairro,
                    u.nome AS doador, u.telefone_whatsapp AS doador_telefone
                FROM item i
                JOIN categoria c ON c.id_categoria = i.id_categoria
                JOIN bairro b ON b.id_bairro = i.id_bairro
                JOIN usuario u ON u.id_usuario = i.id_usuario_doador
                WHERE i.status_moderacao = "Aprovado" AND i.removido_em IS NULL
                ORDER BY i.data_publicacao DESC';
        return $pdo->query($sql)->fetchAll();
    }

    public function criarPendente(array $dados): int
    {
        $pdo = Conexao::obter();
        $stmt = $pdo->prepare(
            'INSERT INTO item (id_usuario_doador, id_categoria, id_bairro, titulo, descricao, foto_url, contato_whatsapp, status_moderacao)
             VALUES (:doador, :categoria, :bairro, :titulo, :descricao, :foto_url, :contato, "Pendente")'
        );
        $stmt->execute([
            'doador' => $dados['id_usuario_doador'],
            'categoria' => $dados['id_categoria'],
            'bairro' => $dados['id_bairro'],
            'titulo' => $dados['titulo'],
            'descricao' => $dados['descricao'],
            'foto_url' => $dados['foto_url'] ?? null,
            'contato' => $dados['contato_whatsapp'] !== '' ? $dados['contato_whatsapp'] : null,
        ]);
        return (int) $pdo->lastInsertId();
    }
}
