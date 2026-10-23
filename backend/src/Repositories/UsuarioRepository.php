<?php

declare(strict_types=1);

namespace DoaAqui\Repositories;

use DoaAqui\Database\Conexao;

/**
 * Acesso à tabela "usuario". Só SQL preparado — nenhuma string de usuário é
 * concatenada em uma query em lugar nenhum deste arquivo.
 */
class UsuarioRepository
{
    public function buscarPorEmail(string $email): ?array
    {
        $pdo = Conexao::obter();
        $stmt = $pdo->prepare('SELECT * FROM usuario WHERE email = :email LIMIT 1');
        $stmt->execute(['email' => $email]);
        $linha = $stmt->fetch();
        return $linha ?: null;
    }

    public function buscarPorId(int $id): ?array
    {
        $pdo = Conexao::obter();
        $stmt = $pdo->prepare('SELECT * FROM usuario WHERE id_usuario = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $linha = $stmt->fetch();
        return $linha ?: null;
    }

    public function criar(string $nome, string $email, string $senhaHash, string $telefone, string $versaoTermos): int
    {
        $pdo = Conexao::obter();
        $pdo->beginTransaction();
        try {
            $stmt = $pdo->prepare(
                'INSERT INTO usuario (nome, email, senha_hash, telefone_whatsapp, tipo)
                 VALUES (:nome, :email, :senha_hash, :telefone, "comum")'
            );
            $stmt->execute([
                'nome' => $nome,
                'email' => $email,
                'senha_hash' => $senhaHash,
                'telefone' => $telefone,
            ]);
            $id = (int) $pdo->lastInsertId();
            $aceite = $pdo->prepare('INSERT INTO aceite_termo (id_usuario, versao) VALUES (:id, :versao)');
            $aceite->execute(['id' => $id, 'versao' => $versaoTermos]);
            $pdo->commit();
            return $id;
        } catch (\Throwable $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            throw $e;
        }
    }
}
