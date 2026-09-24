param([int]$Port = 4173)

$compiler = 'C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe'
$source = Join-Path $PSScriptRoot 'LocalServer.cs'
$server = Join-Path $PSScriptRoot 'LocalServer.exe'

$portInUse = $false
$probe = New-Object System.Net.Sockets.TcpClient
try {
  $probe.Connect('127.0.0.1', $Port)
  $portInUse = $true
} catch {
  $portInUse = $false
} finally {
  $probe.Dispose()
}

if ($portInUse) {
  Write-Host "ObraFlow ja esta em execucao em http://localhost:$Port/"
  return
}

if (-not (Test-Path $server) -or (Get-Item $source).LastWriteTime -gt (Get-Item $server).LastWriteTime) {
  & $compiler /nologo /optimize+ /out:$server $source
  if ($LASTEXITCODE -ne 0) { throw 'Não foi possível compilar o servidor local.' }
}

& $server $Port
