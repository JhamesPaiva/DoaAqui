<?php

declare(strict_types=1);

namespace DoaAqui\Services;

use DoaAqui\Http\Auth;
use DoaAqui\Http\Validador;
use DoaAqui\Repositories\UsuarioRepository;
use DoaAqui\Security\LoginThrottle;

/**
 * Regra de negócio de autenticação. Não sabe nada sobre $_SERVER, cabeçalhos HTTP
 * ou JSON de resposta — quem chama (o endpoint) que traduz o resultado em HTTP.
 */
class AuthService
{
    public const VERSAO_TERMOS = '2026-10-23-v1';
    private UsuarioRepository $usuarios;

    public function __construct()
    {
        $this->usuarios = new UsuarioRepository();
    }

    public function cadastrar(string $nome, string $email, string $senha, string $telefone, bool $aceitouTermos): array
    {
        $nome = trim($nome);
        $email = strtolower(trim($email));
        $telefone = trim($telefone);

        if (!$aceitouTermos) {
            return ['ok' => false, 'erro' => 'É necessário aceitar os Termos de Uso para criar uma conta.'];
        }

        if (!Validador::tamanho($nome, 2, 255)) {
            return ['ok' => false, 'erro' => 'Nome precisa ter entre 2 e 255 caracteres.'];
        }
        if (!Validador::emailValido($email)) {
            return ['ok' => false, 'erro' => 'E-mail inválido.'];
        }
        // 72 bytes é o limite prático do bcrypt (usado por password_hash com PASSWORD_DEFAULT);
        // qualquer coisa além disso é truncada silenciosamente, então validamos antes.
        if (!Validador::tamanho($senha, 4, 72)) {
            return ['ok' => false, 'erro' => 'A senha precisa ter entre 4 e 72 caracteres.'];
        }
        if (!Validador::tamanho($telefone, 8, 30)) {
            return ['ok' => false, 'erro' => 'Telefone inválido.'];
        }
        if ($this->usuarios->buscarPorEmail($email)) {
            return ['ok' => false, 'erro' => 'Já existe uma conta com esse e-mail.'];
        }

        $hash = password_hash($senha, PASSWORD_DEFAULT);
        $id = $this->usuarios->criar($nome, $email, $hash, $telefone, self::VERSAO_TERMOS);
        $usuario = $this->usuarios->buscarPorId($id);

        Auth::logar($usuario);
        return ['ok' => true, 'usuario' => Auth::usuarioLogado()];
    }

    public function logar(string $email, string $senha, string $ip): array
    {
        $email = strtolower(trim($email));
        $chaveThrottle = $email . '|' . $ip;

        if (LoginThrottle::bloqueado($chaveThrottle)) {
            return [
                'ok' => false,
                'status' => 429,
                'erro' => 'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.',
            ];
        }

        $usuario = $this->usuarios->buscarPorEmail($email);

        // Mensagem de erro é sempre a mesma pra e-mail inexistente ou senha errada —
        // não dá pra um atacante descobrir, por tentativa e erro, quais e-mails existem.
        if (!$usuario || !password_verify($senha, $usuario['senha_hash'])) {
            LoginThrottle::registrarFalha($chaveThrottle);
            return ['ok' => false, 'status' => 401, 'erro' => 'E-mail ou senha inválidos.'];
        }

        if (!$usuario['ativo']) {
            return ['ok' => false, 'status' => 403, 'erro' => 'Essa conta está desativada.'];
        }

        LoginThrottle::limpar($chaveThrottle);
        Auth::logar($usuario);
        return ['ok' => true, 'usuario' => Auth::usuarioLogado()];
    }
}
