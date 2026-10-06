@echo off
setlocal EnableDelayedExpansion
title Doa Aqui - Setup e Execucao
cd /d "%~dp0"

echo ================================================================
echo   DOA AQUI - Setup e execucao automatica
echo ================================================================
echo.

REM ============================================================
REM Passo 1 - Verificar PHP
REM ============================================================
echo [1/6] Verificando PHP...
where php >nul 2>nul
if %errorlevel% equ 0 goto :php_ok

for %%P in (
    "C:\xampp\php"
    "C:\wamp64\bin\php\php8.3.0"
    "C:\wamp64\bin\php\php8.2.0"
    "C:\wamp64\bin\php\php8.1.0"
    "C:\laragon\bin\php\php-8.3"
    "C:\laragon\bin\php\php-8.2"
    "C:\php"
) do (
    if exist "%%~P\php.exe" (
        set "PATH=%%~P;!PATH!"
        set "PHP_ENCONTRADO=1"
        echo   PHP encontrado em %%~P
    )
)
if defined PHP_ENCONTRADO goto :php_ok

where winget >nul 2>nul
if %errorlevel% neq 0 goto :erro_php_sem_winget

echo   PHP nao encontrado. Tentando instalar via winget, aguarde...
winget install --id PHP.PHP -e --accept-source-agreements --accept-package-agreements
echo.
echo   PHP foi instalado. Feche esta janela, abra um terminal NOVO
echo   ^(para o PATH atualizar^) e rode este script de novo.
pause
exit /b 1

:erro_php_sem_winget
echo.
echo   [ERRO] PHP nao encontrado e nao foi possivel instalar automaticamente.
echo   Baixe em: https://windows.php.net/download/
echo   ou instale o XAMPP, que ja inclui PHP e MySQL: https://www.apachefriends.org/
pause
exit /b 1

:php_ok
for /f "tokens=*" %%V in ('php -r "echo PHP_VERSION;" 2^>nul') do set PHP_VERSION=%%V
echo   [OK] PHP %PHP_VERSION%
echo.

REM ============================================================
REM Passo 2 - Verificar extensoes do PHP - pdo_mysql, mbstring
REM ============================================================
echo [2/6] Verificando extensoes do PHP...
set "FALTOU_EXTENSAO="
php -m | findstr /i "pdo_mysql" >nul
if %errorlevel% neq 0 (
    echo   [AVISO] Extensao pdo_mysql nao esta ativa.
    set "FALTOU_EXTENSAO=1"
)
php -m | findstr /i "mbstring" >nul
if %errorlevel% neq 0 (
    echo   [AVISO] Extensao mbstring nao esta ativa.
    set "FALTOU_EXTENSAO=1"
)
if not defined FALTOU_EXTENSAO goto :extensoes_ok

echo.
echo   Abra o php.ini usado pelo PHP e garanta que estas linhas existem
echo   e NAO estao comentadas ^(sem ponto-e-virgula na frente^):
echo     extension=pdo_mysql
echo     extension=mbstring
echo.
echo   Local do php.ini em uso:
for /f "tokens=*" %%I in ('php --ini ^| findstr /i "Loaded Configuration"') do echo     %%I
echo.
echo   Ajuste o arquivo e rode este script de novo.
pause
exit /b 1

:extensoes_ok
echo   [OK] Extensoes presentes.
echo.

REM ============================================================
REM Passo 3 - Verificar cliente MySQL
REM ============================================================
echo [3/6] Verificando MySQL...
where mysql >nul 2>nul
if %errorlevel% equ 0 goto :mysql_ok

for %%P in (
    "C:\xampp\mysql\bin"
    "C:\wamp64\bin\mysql\mysql8.0.31\bin"
    "C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin"
    "C:\Program Files\MySQL\MySQL Server 8.0\bin"
    "C:\Program Files\MySQL\MySQL Server 8.4\bin"
    "C:\Program Files\MariaDB 10.11\bin"
    "C:\Program Files\MariaDB 11.0\bin"
) do (
    if exist "%%~P\mysql.exe" (
        set "PATH=%%~P;!PATH!"
        set "MYSQL_ENCONTRADO=1"
        echo   MySQL encontrado em %%~P
    )
)
if defined MYSQL_ENCONTRADO goto :mysql_ok

echo.
echo   [ERRO] Cliente mysql nao encontrado no PATH nem nos locais comuns.
echo   Instale o MySQL Server: https://dev.mysql.com/downloads/installer/
echo   ou o XAMPP ^(ja inclui^): https://www.apachefriends.org/
echo   Depois rode este script de novo.
pause
exit /b 1

:mysql_ok
echo   [OK] Cliente mysql disponivel.
echo.

REM ============================================================
REM Passo 4 - Banco de dados - so pergunta credenciais se ainda nao tem .env
REM ============================================================
echo [4/6] Configurando o banco de dados...
set "DB_PORT=3307"

if not exist "backend\.env" goto :configurar_banco_do_zero

echo   backend\.env ja existe - vou usar as credenciais que ja estao la.
set "DB_USER_ATUAL="
set "DB_PASS_ATUAL="
set "DB_NAME_ATUAL="
set "DB_PORT_ATUAL=3307"
for /f "tokens=1,2 delims==" %%A in (backend\.env) do (
    if "%%A"=="DB_USER" set "DB_USER_ATUAL=%%B"
    if "%%A"=="DB_PASS" set "DB_PASS_ATUAL=%%B"
    if "%%A"=="DB_NAME" set "DB_NAME_ATUAL=%%B"
    if "%%A"=="DB_PORT" set "DB_PORT_ATUAL=%%B"
)
mysql -P !DB_PORT_ATUAL! -u !DB_USER_ATUAL! -p!DB_PASS_ATUAL! -e "SELECT 1;" !DB_NAME_ATUAL! >nul 2>nul
if !errorlevel! equ 0 goto :banco_ok

echo.
echo   [ERRO] Nao consegui conectar ao MySQL com as credenciais de backend\.env.
echo   O servico do MySQL esta rodando? ^(no XAMPP, abra o Painel de Controle
echo   e clique em Start ao lado de MySQL^)
echo   Se voce mudou a senha do banco, apague backend\.env e rode este script
echo   de novo para reconfigurar do zero.
pause
exit /b 1

:configurar_banco_do_zero
set "MYSQL_ROOT_USER="
set /p MYSQL_ROOT_USER="  Usuario root do MySQL [root]: "
if "!MYSQL_ROOT_USER!"=="" set "MYSQL_ROOT_USER=root"

set "MYSQL_ROOT_PASS="
set /p MYSQL_ROOT_PASS="  Senha do root do MySQL (deixe em branco se nao tiver): "

set "MYSQL_AUTH=-u !MYSQL_ROOT_USER!"
if not "!MYSQL_ROOT_PASS!"=="" set "MYSQL_AUTH=!MYSQL_AUTH! -p!MYSQL_ROOT_PASS!"

mysql !MYSQL_AUTH! -e "SELECT 1;" >nul 2>nul
if !errorlevel! equ 0 goto :root_conectou

echo.
echo   [ERRO] Nao consegui conectar ao MySQL com essas credenciais.
echo   Confirme se o servidor MySQL esta rodando e se usuario/senha estao certos.
pause
exit /b 1

:root_conectou
echo   [OK] Conectado ao MySQL como !MYSQL_ROOT_USER!.

REM Gera uma senha aleatoria so alfanumerica para o usuario de aplicacao
for /f "delims=" %%G in ('powershell -NoProfile -Command "-join ((48..57)+(65..90)+(97..122) | Get-Random -Count 24 | %% {[char]$_})"') do set DB_APP_PASS=%%G

mysql !MYSQL_AUTH! --default-character-set=utf8mb4 -e "CREATE USER IF NOT EXISTS 'doaaqui_app'@'localhost' IDENTIFIED BY '!DB_APP_PASS!'; ALTER USER 'doaaqui_app'@'localhost' IDENTIFIED BY '!DB_APP_PASS!'; GRANT SELECT, INSERT, UPDATE, DELETE ON doaaqui.* TO 'doaaqui_app'@'localhost'; FLUSH PRIVILEGES;"
if !errorlevel! neq 0 (
    echo   [ERRO] Falha ao criar o usuario de aplicacao no MySQL.
    pause
    exit /b 1
)

mysql !MYSQL_AUTH! --default-character-set=utf8mb4 < backend\database\schema.sql
if !errorlevel! neq 0 (
    echo   [ERRO] Falha ao aplicar backend\database\schema.sql
    pause
    exit /b 1
)
echo   [OK] Schema aplicado.

mysql !MYSQL_AUTH! --default-character-set=utf8mb4 doaaqui < backend\database\seed.sql
if !errorlevel! neq 0 (
    echo   [AVISO] Falha ao aplicar o seed de teste - o banco ficou so com as tabelas, sem dados.
) else (
    echo   [OK] Dados de teste inseridos. Admin de teste: admin@doaaqui.com / admin123
)

(
    echo DB_HOST=127.0.0.1
    echo DB_PORT=3306
    echo DB_NAME=doaaqui
    echo DB_USER=doaaqui_app
    echo DB_PASS=!DB_APP_PASS!
    echo APP_ENV=development
    echo APP_DEBUG=true
    echo SESSION_NAME=doaaqui_sessao
    echo CORS_ALLOWED_ORIGIN=http://localhost:8080
) > backend\.env
echo   [OK] backend\.env criado.

:banco_ok
echo.

REM ============================================================
REM Passo 5 - Subir backend e front-end - pula se ja estiver rodando
REM ============================================================
echo [5/6] Subindo os servidores...

netstat -ano | findstr /c:":8000 " | findstr "LISTENING" >nul
if !errorlevel! equ 0 (
    echo   [OK] Ja tem algo rodando em localhost:8000 - nao vou subir outro backend.
) else (
    start "Doa Aqui - Backend (porta 8000)" cmd /k "cd /d backend && php -S localhost:8000 -t public -d upload_max_filesize=5M -d post_max_size=6M"
    echo   [OK] Backend subindo em http://localhost:8000
)

netstat -ano | findstr /c:":8080 " | findstr "LISTENING" >nul
if !errorlevel! equ 0 (
    echo   [OK] Ja tem algo rodando em localhost:8080 - nao vou subir outro front-end.
) else (
    start "Doa Aqui - Front-end (porta 8080)" cmd /k "cd /d doa-aqui && php -S localhost:8080"
    echo   [OK] Front-end subindo em http://localhost:8080
)
echo.

REM ============================================================
REM Passo 6 - Abrir navegador
REM ============================================================
echo [6/6] Abrindo o navegador...
timeout /t 2 /nobreak >nul
start http://localhost:8080

echo.
echo ================================================================
echo   Tudo rodando!
echo   Front-end: http://localhost:8080
echo   Backend:   http://localhost:8000
echo   Admin de teste: admin@doaaqui.com / admin123
echo.
echo   Duas janelas de terminal foram abertas (backend e front-end).
echo   Feche essas janelas quando quiser parar os servidores.
echo ================================================================
pause
exit /b 0
