$ErrorActionPreference = 'Stop'
try {
    $configPath = 'C:\wamp64\wampmanager.conf'
    $configText = Get-Content -LiteralPath $configPath -Raw
    $versionMatch = [regex]::Match($configText, '(?m)^phpVersion\s*=\s*"([^"]+)"')
    if (-not $versionMatch.Success) { throw 'PHP do Wamp nao encontrado.' }
    $phpPath = 'C:\wamp64\bin\php\php' + $versionMatch.Groups[1].Value + '\php.exe'
    if (-not (Test-Path -LiteralPath $phpPath)) { throw 'PHP do Wamp nao encontrado.' }
    if (Test-Path -LiteralPath (Join-Path $PSScriptRoot 'backend\.env')) { throw 'O .env ja existe. Nenhum arquivo foi alterado.' }
    Write-Host 'DoaAqui - MySQL Server em 127.0.0.1:3306' -ForegroundColor Cyan
    Write-Host 'Serao criados o banco, um usuario exclusivo e os dados de demonstracao.'
    Write-Host 'Use a senha do root utilizada na sua conexao do MySQL Workbench.'
    $securePassword = Read-Host 'Senha do root (nao sera exibida)' -AsSecureString
    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    try {
        $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
        $start = [Diagnostics.ProcessStartInfo]::new()
        $start.FileName = $phpPath
        $setupPath = Join-Path $PSScriptRoot 'backend\tools\configurar-mysql.php'
        $start.Arguments = '-d xdebug.mode=off "' + $setupPath + '"'
        $start.UseShellExecute = $false
        $start.CreateNoWindow = $true
        $start.RedirectStandardInput = $true
        $start.StandardInputEncoding = [Text.UTF8Encoding]::new($false)
        $process = [Diagnostics.Process]::Start($start)
        $process.StandardInput.WriteLine((@{ password=$plainPassword } | ConvertTo-Json -Compress))
        $process.StandardInput.Close()
        $plainPassword = $null
        $process.WaitForExit()
        if ($process.ExitCode -ne 0) { throw 'Configuracao nao concluida. Veja a mensagem acima.' }
        Write-Host 'Configuracao concluida. Atualize a lista de schemas no Workbench para ver doaaqui.' -ForegroundColor Green
    } finally {
        $plainPassword = $null
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
        $securePassword.Dispose()
    }
} catch { Write-Host $_.Exception.Message -ForegroundColor Red }
Read-Host 'Pressione Enter para fechar'
