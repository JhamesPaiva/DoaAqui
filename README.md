# DoaAqui

Mural de doações desenvolvido em HTML, CSS e JavaScript, com API PHP e banco MySQL.

## Iniciar no Windows com Wamp

Com o MySQL em execução e `backend/.env` configurado, dê duplo clique em **iniciar-doaaqui.bat**.

Esse atalho chama `iniciar-doaaqui.ps1`, localiza a versão ativa do PHP em `C:\wamp64`, inicia os servidores locais em segundo plano e abre http://localhost:8080. O backend atende em http://localhost:8000. Os registros de execução ficam em `backend/storage/logs`.

Os dois arquivos de início são complementares: mantenha tanto o `.bat` quanto o `.ps1`.

## Configurar uma máquina nova

Use **configurar-mysql.bat** somente para a configuração inicial. Ele chama `configurar-mysql.ps1`, solicita a senha do administrador MySQL e prepara o banco e o `.env`. O configurador recusa sobrescrever uma configuração existente.

Na máquina já configurada, basta usar o iniciador. Não apague o `.env` nem importe o seed novamente para iniciar o site.

## Estrutura

- `doa-aqui/`: páginas, estilos, scripts e imagens da interface.
- `backend/public/api/`: endpoints PHP.
- `backend/public/uploads/`: imagens enviadas pelos usuários.
- `backend/src/`: autenticação, serviços e acesso ao banco.
- `backend/database/`: schema, seed de desenvolvimento, catálogo de bairros e migrações pontuais.
- `backend/storage/`: sessões, logs e referências das fotos de perfil.
- `docs/PRIVACIDADE-OPERACAO.md`: inventário de dados, controles implementados e decisões pendentes para LGPD.
- `doa-aqui/privacidade.html` e `doa-aqui/termos.html`: exemplos demonstrativos com dados fictícios; revisar e substituir pelas informações reais antes da publicação.

## Execução manual

Backend, a partir de `backend/`:

```powershell
php -d upload_max_filesize=5M -d post_max_size=6M -S localhost:8000 -t public
```

Frontend, a partir de `doa-aqui/`:

```powershell
php -S localhost:8080
```

Consulte `backend/README.md` e `doa-aqui/README.md` para os detalhes da aplicação. Mantenha as credenciais do `.env` fora do Git.

## Documentação e manutenção

Consulte [docs/README.md](docs/README.md) para o mapa da documentação e [docs/ARQUITETURA.md](docs/ARQUITETURA.md) para responsabilidades, ordem de carregamento e cuidados com dados locais.
