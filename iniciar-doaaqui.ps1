$ErrorActionPreference = 'Stop'
$projectPath = $PSScriptRoot
try {
    $wampPath = 'C:\wamp64'
    $wampConfig = Get-Content -LiteralPath (Join-Path $wampPath 'wampmanager.conf') -Raw
    $phpMatch = [regex]::Match($wampConfig, '(?m)^phpVersion\s*=\s*"([^"]+)"')
    if (-not $phpMatch.Success) { throw 'Versão do PHP não encontrada no Wamp.' }
    $phpPath = Join-Path $wampPath ('bin\php\php' + $phpMatch.Groups[1].Value + '\php.exe')
    if (-not (Test-Path -LiteralPath $phpPath)) { throw 'PHP do Wamp não encontrado.' }
    if (-not (Test-Path -LiteralPath (Join-Path $projectPath 'backend\.env'))) { throw 'Configure backend\.env antes de iniciar.' }
    $logPath = Join-Path $projectPath 'backend\storage\logs'
    New-Item -ItemType Directory -Path $logPath -Force | Out-Null
    foreach ($server in @(@{Port=8000;Folder='backend';Arguments=@('-d','xdebug.mode=off','-d','upload_max_filesize=5M','-d','post_max_size=6M','-S','localhost:8000','-t','public')},@{Port=8080;Folder='doa-aqui';Arguments=@('-d','xdebug.mode=off','-S','localhost:8080')})) {
        $socket = [System.Net.Sockets.TcpClient]::new()
        try { $socket.Connect('localhost',$server.Port); $listening=$true } catch { $listening=$false } finally { $socket.Dispose() }
        if (-not $listening) {
            Start-Process -FilePath $phpPath -ArgumentList $server.Arguments -WorkingDirectory (Join-Path $projectPath $server.Folder) -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logPath ('server-'+$server.Port+'.out.log')) -RedirectStandardError (Join-Path $logPath ('server-'+$server.Port+'.error.log'))
        }
    }
    $ready = $false
    for($attempt=0; $attempt -lt 10; $attempt++) {
        try {
            $categories = Invoke-RestMethod -Uri 'http://localhost:8000/api/categorias/listar.php' -TimeoutSec 3
            $page = Invoke-WebRequest -Uri 'http://localhost:8080/' -UseBasicParsing -TimeoutSec 3
            if ($null -ne $categories.categorias -and $page.Content -match 'DoaAqui') { $ready=$true;break }
        } catch { Start-Sleep -Milliseconds 500 }
    }
    if (-not $ready) { throw 'O site não respondeu. Verifique o banco e se as portas 8000 e 8080 estão sendo usadas por outro programa.' }
    Start-Process 'http://localhost:8080'
} catch {
    Write-Host $_.Exception.Message -ForegroundColor Red
    Read-Host 'Pressione Enter para fechar'
    exit 1
}
