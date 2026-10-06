# Doa Aqui

Projeto completo: front-end + back-end, em pastas separadas mas neste mesmo pacote.

```
DoaAqui/
├── doa-aqui/   → front-end (HTML/CSS/JS puro), fala com a API via js/api.js
└── backend/    → back-end (PHP puro + MySQL), a API em si
```

## Windows — setup automático

Se você está no Windows, dá pra pular os passos manuais abaixo: dê duplo-clique
em **`executar.bat`**. Ele verifica se PHP e MySQL estão instalados (procura em
locais comuns tipo XAMPP/WAMP/Laragon, e tenta instalar o PHP via `winget` se
não achar), configura o banco na primeira vez que rodar (schema + dados de
teste), cria o `backend\.env`, sobe os dois servidores em janelas separadas e
abre o navegador — tudo isso pode ser rodado de novo sem medo, ele não recria
nem apaga dados que já existem.

**Importante sobre esse script:** eu não tenho como testar `.bat` num Windows de
verdade (meu ambiente de desenvolvimento é Linux) — validei a lógica com um
emulador (Wine) até onde ele consegue simular, e encontrei e corrigi um bug real
nesse processo, mas não é o mesmo nível de garantia que tenho sobre o resto do
projeto (que testei de ponta a ponta, de verdade, repetidas vezes). Se algo não
funcionar exatamente como esperado na sua máquina, me avise o que apareceu na
tela que eu ajusto.

Cada pasta tem seu próprio `README.md` com instruções detalhadas pra quem
preferir (ou precisar) rodar cada passo manualmente. Resumo de como subir os
dois juntos:

**1. Backend primeiro** (veja `backend/README.md` para schema, seed e `.env`):
```bash
cd backend
php -S localhost:8000 -t public -d upload_max_filesize=5M -d post_max_size=6M
```

**2. Front-end depois** (veja `doa-aqui/README.md` para detalhes de CORS):
```bash
cd doa-aqui
python3 -m http.server 8080
```

Acesse `http://localhost:8080`. Login de admin de teste: `admin@doaaqui.com` / `admin123`
(veja `backend/README.md` para as demais credenciais do seed).
