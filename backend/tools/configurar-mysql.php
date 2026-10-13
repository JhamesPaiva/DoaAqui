<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
try {
    $project = dirname(__DIR__, 2);
    $input = json_decode(stream_get_contents(STDIN), true, 512, JSON_THROW_ON_ERROR);
    $envPath = $project . '/backend/.env';
    if (file_exists($envPath)) throw new RuntimeException('O .env já existe. Nenhum arquivo foi sobrescrito.');
    $db = new PDO('mysql:host=127.0.0.1;port=3306;charset=utf8mb4', 'root', $input['password'], [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
    unset($input);
    $version = (string)$db->query('SELECT VERSION()')->fetchColumn();
    if (stripos($version, 'MariaDB') !== false) throw new RuntimeException('A porta 3306 aponta para MariaDB. Configure a conexão do MySQL Server antes de continuar.');
    if ($db->query("SELECT COUNT(*) FROM information_schema.schemata WHERE schema_name='doaaqui'")->fetchColumn()) throw new RuntimeException('O banco doaaqui já existe. Nenhum dado foi alterado.');
    if ($db->query("SELECT COUNT(*) FROM mysql.user WHERE User='doaaqui_app' AND Host='localhost'")->fetchColumn()) throw new RuntimeException('O usuário doaaqui_app já existe. Nenhuma senha foi alterada.');
    if (!is_writable(dirname($envPath))) throw new RuntimeException('Sem permissão para gravar na pasta backend.');
    $db->exec(file_get_contents($project . '/backend/database/schema.sql'));
    $db->beginTransaction();
    try { $db->exec(file_get_contents($project . '/backend/database/seed.sql')); $db->commit(); }
    catch (Throwable $e) { if ($db->inTransaction()) $db->rollBack(); throw $e; }
    $password = bin2hex(random_bytes(24));
    $db->exec("CREATE USER 'doaaqui_app'@'localhost' IDENTIFIED BY " . $db->quote($password));
    $db->exec("GRANT SELECT, INSERT, UPDATE, DELETE ON doaaqui.* TO 'doaaqui_app'@'localhost'");
    $app = new PDO('mysql:host=127.0.0.1;port=3306;dbname=doaaqui;charset=utf8mb4', 'doaaqui_app', $password, [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
    $count=$app->query('SELECT COUNT(*) FROM categoria')->fetchColumn();
    $env="DB_HOST=127.0.0.1\nDB_PORT=3306\nDB_NAME=doaaqui\nDB_USER=doaaqui_app\nDB_PASS=$password\nAPP_ENV=development\nAPP_DEBUG=false\nSESSION_NAME=doaaqui_sessao\nCORS_ALLOWED_ORIGIN=http://localhost:8080\n";
    $file=fopen($envPath,'x');
    if (!$file) throw new RuntimeException('Não foi possível criar o .env.');
    fwrite($file,$env);fclose($file);
    echo "Banco criado no MySQL $version, porta 3306.\n.env criado e conexão da aplicação verificada ($count categorias).\nDados de demonstração do projeto importados.\nLogin local de teste: admin@doaaqui.com / admin123\n";
} catch (Throwable $e) {
    if ($e instanceof PDOException) {
        fwrite(STDERR, "Não foi possível concluir a configuração do MySQL (código ".$e->getCode()."). Confira se o servidor está ativo e a senha do root está correta. Em caso de importação parcial, não apague dados: peça uma verificação.\n");
    } else fwrite(STDERR, $e->getMessage()."\n");
    exit(1);
}
