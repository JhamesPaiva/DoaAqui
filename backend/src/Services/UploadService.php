<?php

declare(strict_types=1);

namespace DoaAqui\Services;

/**
 * Upload de foto do item (RNF06). Regras de segurança aplicadas aqui, não só
 * checadas — cada uma existe pra fechar um jeito específico de abusar de upload:
 *
 * - Nunca confia na extensão do nome original nem no Content-Type que o navegador
 *   mandou (os dois são só o que o cliente *diz* que é); o tipo real é lido dos
 *   bytes do arquivo com finfo.
 * - Confirma com getimagesize() que o arquivo é mesmo decodificável como imagem,
 *   não um arquivo qualquer com header falsificado.
 * - O nome final do arquivo é gerado no servidor (aleatório) — nunca reaproveita
 *   o nome que o usuário mandou, o que evita path traversal, sobrescrita de
 *   arquivo existente e truques de dupla extensão (ex. "foto.php.jpg").
 * - move_uploaded_file() confirma que o arquivo veio de um upload HTTP de verdade,
 *   não de alguma outra origem.
 * - Limite de tamanho aplicado explicitamente, além do que o php.ini já limita.
 */
class UploadService
{
    private const EXTENSOES_PERMITIDAS = [
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png' => 'image/png',
        'webp' => 'image/webp',
    ];
    private const TAMANHO_MAXIMO_BYTES = 5 * 1024 * 1024; // 5 MB

    public function salvar(array $arquivo): array
    {
        if (!isset($arquivo['error']) || is_array($arquivo['error'])) {
            return ['ok' => false, 'erro' => 'Envio de arquivo inválido.'];
        }
        if ($arquivo['error'] === UPLOAD_ERR_NO_FILE) {
            return ['ok' => false, 'erro' => 'Nenhum arquivo enviado.'];
        }
        if ($arquivo['error'] !== UPLOAD_ERR_OK) {
            return ['ok' => false, 'erro' => 'Falha no envio do arquivo.'];
        }
        if ($arquivo['size'] > self::TAMANHO_MAXIMO_BYTES) {
            return ['ok' => false, 'erro' => 'A imagem precisa ter no máximo 5MB.'];
        }
        if (!is_uploaded_file($arquivo['tmp_name'])) {
            return ['ok' => false, 'erro' => 'Envio de arquivo inválido.'];
        }

        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $mimeReal = $finfo->file($arquivo['tmp_name']);
        $extensao = array_search($mimeReal, self::EXTENSOES_PERMITIDAS, true);

        if ($extensao === false) {
            return ['ok' => false, 'erro' => 'Formato de imagem não permitido. Use JPG, PNG ou WEBP.'];
        }
        if (@getimagesize($arquivo['tmp_name']) === false) {
            return ['ok' => false, 'erro' => 'Arquivo não é uma imagem válida.'];
        }

        $dir = dirname(__DIR__, 2) . '/public/uploads';
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $nomeArquivo = bin2hex(random_bytes(16)) . '.' . $extensao;
        $destino = $dir . '/' . $nomeArquivo;

        if (!move_uploaded_file($arquivo['tmp_name'], $destino)) {
            error_log('[UploadService] Falha ao mover arquivo para ' . $destino);
            return ['ok' => false, 'erro' => 'Não foi possível salvar a imagem.'];
        }

        return ['ok' => true, 'url' => '/uploads/' . $nomeArquivo];
    }

    /** Remove imagem órfã sem apagar arquivo ainda usado por outro anúncio. */
    public static function excluirSeNaoReferenciada(string $url): void
    {
        if (!preg_match('~^/uploads/[a-f0-9]{32}\.(jpg|jpeg|png|webp)$~i', $url)) return;
        $pdo = \DoaAqui\Database\Conexao::obter();
        $stmt = $pdo->prepare(
            'SELECT 1 FROM item WHERE foto_url = ? UNION ALL SELECT 1 FROM item_foto WHERE foto_url = ? LIMIT 1'
        );
        $stmt->execute([$url, $url]);
        if ($stmt->fetchColumn()) return;
        $arquivo = dirname(__DIR__, 2) . '/public' . $url;
        if (is_file($arquivo)) @unlink($arquivo);
    }
}
