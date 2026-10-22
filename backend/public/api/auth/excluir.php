<?php
declare(strict_types=1);
require __DIR__ . '/../bootstrap.php';
use DoaAqui\Http\{Auth, Request, Response};
use DoaAqui\Database\Conexao;
use DoaAqui\Repositories\UsuarioRepository;
use DoaAqui\Security\LoginThrottle;
Request::exigirMetodo('POST');
$usuario = Auth::exigirLogin();
Auth::exigirCsrf();
$chave = 'excluir|' . $usuario['id'] . '|' . ($_SERVER['REMOTE_ADDR'] ?? '');
if (LoginThrottle::bloqueado($chave)) Response::erro('Muitas tentativas. Aguarde alguns minutos.', 429);
$registro = (new UsuarioRepository())->buscarPorId($usuario['id']);
$senha = Request::corpoJson()['senha'] ?? '';
if (!is_string($senha) || !password_verify($senha, $registro['senha_hash'])) {
    LoginThrottle::registrarFalha($chave);
    Response::erro('Senha incorreta. Confira para confirmar a exclusão.', 422);
}
$pdo = Conexao::obter();
$pdo->beginTransaction();
try {
    // Lock the account so related writes cannot race with deletion.
    $lock = $pdo->prepare('SELECT id_usuario FROM usuario WHERE id_usuario = ? FOR UPDATE');
    $lock->execute([$usuario['id']]);
    foreach ([
        'DELETE FROM item_foto WHERE id_item IN (SELECT id_item FROM item WHERE id_usuario_doador = ?)',
        'DELETE FROM moderacao WHERE id_item IN (SELECT id_item FROM item WHERE id_usuario_doador = ?)',
        'DELETE FROM historico_status WHERE id_item IN (SELECT id_item FROM item WHERE id_usuario_doador = ?)',
        'DELETE FROM moderacao WHERE id_admin = ?',
        'DELETE FROM historico_status WHERE alterado_por = ?',
        'DELETE FROM item WHERE id_usuario_doador = ?',
        'DELETE FROM usuario WHERE id_usuario = ?'
    ] as $sql) {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$usuario['id']]);
    }
    $pdo->commit();
} catch (\Throwable $e) {
    $pdo->rollBack();
    throw $e;
}
\DoaAqui\Services\ProfilePhotoService::excluir($usuario['id']);
LoginThrottle::limpar($chave);
Auth::deslogar();
Response::json(['mensagem' => 'Conta excluída.']);
