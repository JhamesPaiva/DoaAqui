<?php

declare(strict_types=1);

namespace DoaAqui\Services;

use DoaAqui\Http\Validador;
use DoaAqui\Repositories\BairroRepository;
use DoaAqui\Repositories\CategoriaRepository;
use DoaAqui\Repositories\HistoricoStatusRepository;
use DoaAqui\Repositories\ItemRepository;
use DoaAqui\Repositories\ModeracaoRepository;
use DoaAqui\Support\Enums;

class ModeracaoService
{
    private ItemRepository $itens;
    private CategoriaRepository $categorias;
    private BairroRepository $bairros;
    private ModeracaoRepository $moderacao;
    private HistoricoStatusRepository $historico;

    public function __construct()
    {
        $this->itens = new ItemRepository();
        $this->categorias = new CategoriaRepository();
        $this->bairros = new BairroRepository();
        $this->moderacao = new ModeracaoRepository();
        $this->historico = new HistoricoStatusRepository();
    }

    public function listarPendentes(): array
    {
        return $this->itens->listarPendentes();
    }

    public function listarPublicados(): array
    {
        $linhas = $this->itens->listarAprovadosAdmin();
        return array_map(static function (array $linha): array {
            $linha['status'] = Enums::statusItemParaApp($linha['status']);
            return $linha;
        }, $linhas);
    }

    public function aprovar(int $idAdmin, int $idItem): array
    {
        $item = $this->itens->buscarPorId($idItem);
        if (!$item || $item['status_moderacao'] !== 'Pendente') {
            return ['ok' => false, 'erro' => 'Item não encontrado na fila de moderação.'];
        }

        $this->itens->aprovar($idItem);
        $this->moderacao->registrar($idItem, $idAdmin, 'Aprovado', '');

        return ['ok' => true];
    }

    public function rejeitar(int $idAdmin, int $idItem, string $observacao): array
    {
        $item = $this->itens->buscarPorId($idItem);
        if (!$item || $item['status_moderacao'] !== 'Pendente') {
            return ['ok' => false, 'erro' => 'Item não encontrado na fila de moderação.'];
        }

        $this->itens->rejeitar($idItem);
        $this->moderacao->registrar($idItem, $idAdmin, 'Rejeitado', $observacao);

        return ['ok' => true];
    }

    public function editar(int $idAdmin, int $idItem, array $dados): array
    {
        $item = $this->itens->buscarPorId($idItem);
        if (!$item || $item['removido_em'] !== null) {
            return ['ok' => false, 'erro' => 'Item não encontrado.'];
        }

        $titulo = trim($dados['titulo'] ?? '');
        $descricao = trim($dados['descricao'] ?? '');
        $contato = trim($dados['contato'] ?? '');
        $contatoPublico = ($dados['contatoPublico'] ?? false) === true;

        if (!Validador::tamanho($titulo, 3, 255)) {
            return ['ok' => false, 'erro' => 'Título precisa ter entre 3 e 255 caracteres.'];
        }
        if (!Validador::tamanho($descricao, 3, 5000)) {
            return ['ok' => false, 'erro' => 'Descrição precisa ter entre 3 e 5000 caracteres.'];
        }
        if ($contatoPublico && $contato === '') {
            return ['ok' => false, 'erro' => 'Informe um número antes de autorizar sua exibição pública.'];
        }

        $categoria = $this->categorias->buscarPorNome(trim($dados['categoria'] ?? ''));
        if (!$categoria) {
            return ['ok' => false, 'erro' => 'Categoria inválida.'];
        }
        $bairro = $this->bairros->buscarPorNome(trim($dados['bairro'] ?? ''));
        if (!$bairro) {
            return ['ok' => false, 'erro' => 'Bairro inválido.'];
        }

        $fotoUrl = trim($dados['fotoUrl'] ?? '');
        if ($fotoUrl !== '' && strpos($fotoUrl, '/uploads/') !== 0) {
            $fotoUrl = '';
        }

        $this->itens->editar($idItem, [
            'titulo' => $titulo,
            'descricao' => $descricao,
            'id_categoria' => $categoria['id_categoria'],
            'id_bairro' => $bairro['id_bairro'],
            'contato_whatsapp' => $contato,
            'contato_publico' => $contatoPublico,
            'foto_url' => $fotoUrl !== '' ? $fotoUrl : null,
        ]);
        if (!empty($item['foto_url']) && $item['foto_url'] !== $fotoUrl) {
            UploadService::excluirSeNaoReferenciada($item['foto_url']);
        }
        $this->moderacao->registrar($idItem, $idAdmin, 'Editado', 'Dados do item atualizados pelo administrador.');

        return ['ok' => true];
    }

    public function remover(int $idAdmin, int $idItem): array
    {
        $item = $this->itens->buscarPorId($idItem);
        if (!$item || $item['removido_em'] !== null) {
            return ['ok' => false, 'erro' => 'Item não encontrado.'];
        }

        $this->itens->remover($idItem);
        if (!empty($item['foto_url'])) UploadService::excluirSeNaoReferenciada($item['foto_url']);
        $this->moderacao->registrar($idItem, $idAdmin, 'Removido', '');

        return ['ok' => true];
    }

    public function historicoDoItem(int $idItem): array
    {
        $historico = $this->historico->listarPorItem($idItem);
        return array_map(static function (array $linha): array {
            $linha['status_anterior'] = Enums::statusItemParaApp($linha['status_anterior']);
            $linha['status_novo'] = Enums::statusItemParaApp($linha['status_novo']);
            return $linha;
        }, $historico);
    }

    public function logModeracao(int $limite = 20): array
    {
        return $this->moderacao->listarRecentes($limite);
    }

    public function metricas(): array
    {
        $contagens = $this->itens->contagensPainel();
        $categorias = $this->itens->categoriasMaisDoadas();

        return [
            'pendentes' => (int) $contagens['pendentes'],
            'disponiveis' => (int) $contagens['disponiveis'],
            'doados' => (int) $contagens['doados'],
            'total' => (int) $contagens['total'],
            'categoriasMaisDoadas' => array_map(static function (array $linha): array {
                return ['categoria' => $linha['categoria'], 'total' => (int) $linha['total']];
            }, $categorias),
        ];
    }
}
