<?php

declare(strict_types=1);

namespace DoaAqui\Http;

/**
 * Sessão de login. Guarda em $_SESSION só o que a tela precisa (id, nome, email,
 * telefone, tipo) — nunca o hash de senha nem nenhum outro dado sensível.
 */
class Auth
{
    public static function iniciarSessao(): void
    {
        if (session_status() === PHP_SESSION_ACTIVE) {
            return;
        }

        $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
            || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';

        session_set_cookie_params([
            'lifetime' => 0,          // expira ao fechar o navegador
            'path' => '/',
            'domain' => '',
            'secure' => $https,       // só envia o cookie por HTTPS quando HTTPS está em uso
            'httponly' => true,       // JavaScript não consegue ler o cookie de sessão (mitiga XSS→roubo de sessão)
            'samesite' => 'Lax',      // mitiga CSRF vindo de outros sites
        ]);

        session_name(env('SESSION_NAME', 'doaaqui_sessao'));
        session_start();
    }

    public static function logar(array $usuario): void
    {
        // Regenera o ID da sessão a cada login — evita fixação de sessão
        // (um atacante que tenha "plantado" um ID de sessão antes do login não o reaproveita).
        session_regenerate_id(true);

        $_SESSION['usuario'] = [
            'id' => (int) $usuario['id_usuario'],
            'nome' => $usuario['nome'],
            'email' => $usuario['email'],
            'telefone' => $usuario['telefone_whatsapp'],
            'tipo' => $usuario['tipo'],
            'fotoUrl' => \DoaAqui\Services\ProfilePhotoService::obter((int) $usuario['id_usuario']),
        ];
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    public static function deslogar(): void
    {
        $_SESSION = [];

        if (ini_get('session.use_cookies')) {
            $parametros = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $parametros['path'],
                $parametros['domain'],
                $parametros['secure'],
                $parametros['httponly']
            );
        }

        session_destroy();
    }

    public static function usuarioLogado(): ?array
    {
        $sessao = $_SESSION['usuario'] ?? null;
        if (!$sessao) return null;
        $usuario = (new \DoaAqui\Repositories\UsuarioRepository())->buscarPorId((int) $sessao['id']);
        if (!$usuario || !$usuario['ativo']) {
            $_SESSION = [];
            return null;
        }
        $sessao['fotoUrl'] = \DoaAqui\Services\ProfilePhotoService::obter((int) $usuario['id_usuario']);
        $sessao['tipo'] = $usuario['tipo'];
        return $sessao;
    }

    /** Garante que existe sessão ativa; encerra a requisição com 401 se não houver. */
    public static function exigirLogin(): array
    {
        $usuario = self::usuarioLogado();
        if (!$usuario) {
            Response::erro('É necessário estar logado.', 401);
        }
        return $usuario;
    }

    /** Garante sessão ativa E tipo admin; encerra com 403 se for um usuário comum. */
    public static function exigirAdmin(): array
    {
        $usuario = self::exigirLogin();
        if ($usuario['tipo'] !== 'admin') {
            Response::erro('Acesso restrito a administradores.', 403);
        }
        return $usuario;
    }

    public static function tokenCsrf(): string
    {
        return $_SESSION['csrf_token'] ?? '';
    }

    /**
     * Exige o cabeçalho X-CSRF-Token em toda rota que muda estado (POST/PUT/DELETE).
     * Sem isso, um site malicioso poderia usar o cookie de sessão do usuário (enviado
     * automaticamente pelo navegador) pra disparar ações em nome dele.
     */
    public static function exigirCsrf(): void
    {
        $enviado = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
        $esperado = self::tokenCsrf();

        if ($esperado === '' || !hash_equals($esperado, $enviado)) {
            Response::erro('Token CSRF inválido ou ausente.', 403);
        }
    }
}
