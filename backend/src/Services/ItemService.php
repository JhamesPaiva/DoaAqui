<?php

declare(strict_types=1);

namespace DoaAqui\Services;

use DoaAqui\Http\Validador;
use DoaAqui\Repositories\BairroRepository;
use DoaAqui\Repositories\CategoriaRepository;
use DoaAqui\Repositories\HistoricoStatusRepository;
use DoaAqui\Repositories\ItemRepository;
use DoaAqui\Support\Enums;

class ItemService
{
    private ItemRepository $itens;
    private CategoriaRepository $categorias;
    private BairroRepository $bairros;
    private HistoricoStatusRepository $historico;

    public function __construct()
    {
        $this->itens = new ItemRepository();
        $this->categorias = new CategoriaRepository();
        $this->bairros = new BairroRepository();
        $this->historico = new HistoricoStatusRepository();
    }

    public static function categoriaDisponivelParaNovaDoacao(string $nome): bool
    {
        return mb_strtolower(trim($nome), 'UTF-8') !== 'alimentos';
    }

    /** Feed público — já traduz o status do banco (sem acento) pro formato do front-end. */
    public function listarPublicos(): array
    {
        $linhas = $this->itens->listarAprovados();

        return array_map(static function (array $linha): array {
            return [
                'id' => (int) $linha['id_item'],
                'titulo' => $linha['titulo'],
                'descricao' => $linha['descricao'],
                'categoria' => $linha['categoria'],
                'bairro' => $linha['bairro'],
                'status' => Enums::statusItemParaApp($linha['status']),
                'doador' => 'Pessoa da comunidade',
                'contato' => !empty($linha['contato_publico']) ? ($linha['contato_whatsapp'] ?? '') : '',
                'dataPublicacao' => $linha['data_publicacao'],
                'fotoUrl' => $linha['foto_url'] ?: null,
            ];
        }, $linhas);
    }

    /**
     * Publica um item novo, sempre como pendente de moderação (RF01 + RF07).
     * $usuario vem de Auth::exigirLogin() — já confiável, não precisa revalidar tipo/id aqui.
     */
    public function publicar(array $usuario, array $dados): array
    {
        $titulo = trim($dados['titulo'] ?? '');
        $descricao = trim($dados['descricao'] ?? '');
        $contato = trim($dados['contato'] ?? '');
        $contatoPublico = ($dados['contatoPublico'] ?? false) === true;
        $nomeCategoria = trim($dados['categoria'] ?? '');
        $nomeBairro = trim($dados['bairro'] ?? '');

        if (!Validador::tamanho($titulo, 3, 255)) {
            return ['ok' => false, 'erro' => 'Título precisa ter entre 3 e 255 caracteres.'];
        }
        if (!Validador::tamanho($descricao, 3, 5000)) {
            return ['ok' => false, 'erro' => 'Descrição precisa ter entre 3 e 5000 caracteres.'];
        }

        // Categoria e bairro chegam como nome (texto) do front-end, igual ao protótipo mockado.
        // Resolvemos pro id aqui — se o nome não bater com nada ativo no banco, rejeita:
        // isso impede que alguém publique um item numa categoria/bairro inventado.
        $categoria = $this->categorias->buscarPorNome($nomeCategoria);
        if (!$categoria) {
            return ['ok' => false, 'erro' => 'Categoria inválida.'];
        }
        if (!self::categoriaDisponivelParaNovaDoacao($categoria['nome'])) {
            return ['ok' => false, 'erro' => 'A categoria Alimentos não está disponível para novas doações.'];
        }

        $bairro = $this->bairros->buscarPorNome($nomeBairro);
        if (!$bairro) {
            return ['ok' => false, 'erro' => 'Bairro inválido.'];
        }

        // Só aceita uma foto cuja URL veio do nosso próprio endpoint de upload —
        // nunca uma URL arbitrária mandada solta no corpo da requisição.
        $fotoUrl = trim($dados['fotoUrl'] ?? '');
        if ($fotoUrl !== '' && strpos($fotoUrl, '/uploads/') !== 0) {
            $fotoUrl = '';
        }

        $id = $this->itens->criarPendente([
            'id_usuario_doador' => $usuario['id'],
            'id_categoria' => $categoria['id_categoria'],
            'id_bairro' => $bairro['id_bairro'],
            'titulo' => $titulo,
            'descricao' => $descricao,
            'foto_url' => $fotoUrl !== '' ? $fotoUrl : null,
            // Cai pro telefone do usuário logado quando vazio — mesma regra do mock no front-end.
            'contato_whatsapp' => $contatoPublico ? ($contato !== '' ? $contato : $usuario['telefone']) : '',
            'contato_publico' => $contatoPublico,
        ]);

        return [
            'ok' => true,
            'item' => ['id' => $id, 'titulo' => $titulo, 'statusModeracao' => 'Pendente'],
        ];
    }

    /**
     * Troca o status de um item (Disponível/Reservado/Doado). Usada tanto pelo
     * painel admin quanto por "Meus anúncios" — a única diferença entre os dois
     * é a checagem de dono, então essa regra fica num lugar só em vez de duplicada.
     */
    public function mudarStatus(int $idItem, string $novoStatusApp, array $usuarioAutor, bool $ehAdmin): array
    {
        if (!Validador::dentroDe($novoStatusApp, Enums::STATUS_ITEM_VALIDOS_APP)) {
            return ['ok' => false, 'erro' => 'Status inválido.'];
        }

        $item = $this->itens->buscarPorId($idItem);
        if (!$item || $item['removido_em'] !== null || $item['status_moderacao'] !== 'Aprovado') {
            return ['ok' => false, 'erro' => 'Item não encontrado.'];
        }
        if (!$ehAdmin && (int) $item['id_usuario_doador'] !== (int) $usuarioAutor['id']) {
            return ['ok' => false, 'erro' => 'Você só pode alterar o status dos seus próprios itens.', 'status' => 403];
        }

        $novoStatusDb = Enums::statusItemParaDb($novoStatusApp);
        if ($item['status'] === $novoStatusDb) {
            return ['ok' => true, 'alterado' => false];
        }

        $this->itens->atualizarStatus($idItem, $novoStatusDb);
        $this->historico->registrar($idItem, $item['status'], $novoStatusDb, (int) $usuarioAutor['id']);

        return ['ok' => true, 'alterado' => true];
    }

    /** "Meus anúncios": pendentes + publicados do doador logado. */
    public function listarMeusAnuncios(int $idUsuario): array
    {
        $dados = $this->itens->listarDoUsuario($idUsuario);

        $dados['publicados'] = array_map(static function (array $linha): array {
            $linha['status'] = Enums::statusItemParaApp($linha['status']);
            return $linha;
        }, $dados['publicados']);

        return $dados;
    }

    public function removerPublicadoProprio(int $idItem, int $idUsuario): array
    {
        $item = $this->itens->buscarPorId($idItem);
        if (!$this->itens->removerPublicadoDoUsuario($idItem, $idUsuario)) {
            return ['ok' => false, 'erro' => 'Anúncio não encontrado entre suas doações publicadas.'];
        }
        if (!empty($item['foto_url'])) UploadService::excluirSeNaoReferenciada($item['foto_url']);
        return ['ok' => true];
    }

    public function cancelarPendente(int $idItem, int $idUsuario): array
    {
        $item = $this->itens->buscarPorId($idItem);
        $cancelado = $this->itens->cancelarPendenteDoUsuario($idItem, $idUsuario);
        if (!$cancelado) {
            return ['ok' => false, 'erro' => 'Anúncio não encontrado ou já foi avaliado pela moderação.'];
        }
        if (!empty($item['foto_url'])) UploadService::excluirSeNaoReferenciada($item['foto_url']);
        return ['ok' => true];
    }
}
