<?php
declare(strict_types=1);
require __DIR__ . '/../bootstrap.php';
use DoaAqui\Http\{Auth, Request, Response};
use DoaAqui\Database\Conexao;
use DoaAqui\Services\UploadService;
Request::exigirMetodo('POST');
$usuario = Auth::exigirLogin();
Auth::exigirCsrf();
if (empty($_FILES['foto'])) Response::erro('Escolha uma foto.', 422);
$foto = (new UploadService())->salvar($_FILES['foto']);
if (!$foto['ok']) Response::erro($foto['erro'], 422);
try {
    \DoaAqui\Services\ProfilePhotoService::salvar($usuario['id'], $foto['url']);
} catch (\Throwable $e) {
    @unlink(__DIR__ . '/../..' . $foto['url']);
    throw $e;
}
Response::json(['usuario' => Auth::usuarioLogado()]);
