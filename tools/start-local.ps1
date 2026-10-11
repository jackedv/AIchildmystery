param([switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
$taskNode = Join-Path $taskRoot '.tools\node.exe'
if (-not (Test-Path -LiteralPath $taskNode) -or -not (Test-Path -LiteralPath (Join-Path $taskRoot 'node_modules\sharp'))) { & (Join-Path $PSScriptRoot 'setup-local.ps1') }
if (-not (Test-Path -LiteralPath (Join-Path $taskRoot '.env'))) { Copy-Item -LiteralPath (Join-Path $taskRoot '.env.example') -Destination (Join-Path $taskRoot '.env') }
$taskLocal = Join-Path $taskRoot '.local'
New-Item -ItemType Directory -Force -Path $taskLocal | Out-Null
$taskUrl = 'http://127.0.0.1:4173/'
$taskServer = Join-Path $taskRoot 'server\start.js'
$taskHealthy = $false
try { $taskHealth = Invoke-RestMethod -Uri ($taskUrl + 'api/health') -TimeoutSec 2; $taskHealthy = $taskHealth.app -eq 'ai-child-mystery' -and $taskHealth.version -eq 2 } catch {}
if ($taskHealthy) {
  $taskOwnedProcess = Get-CimInstance Win32_Process -Filter "name='node.exe'" -ErrorAction SilentlyContinue | Where-Object { $_.ExecutablePath -eq $taskNode -and $_.CommandLine -and $_.CommandLine.Contains($taskServer) } | Select-Object -First 1
  if (-not $taskOwnedProcess) { throw '端口被另一个故事书实例占用，请先停止那个项目的游戏。' }
  Set-Content -LiteralPath (Join-Path $taskLocal 'server.pid') -Value $taskOwnedProcess.ProcessId
}
if (-not $taskHealthy) {
  $taskProcess = Start-Process -FilePath $taskNode -ArgumentList ('"' + $taskServer + '"') -WorkingDirectory $taskRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $taskLocal 'server.log') -RedirectStandardError (Join-Path $taskLocal 'server-error.log')
  Set-Content -LiteralPath (Join-Path $taskLocal 'server.pid') -Value $taskProcess.Id
  for ($taskAttempt = 0; $taskAttempt -lt 30; $taskAttempt++) {
    try { $taskHealth = Invoke-RestMethod -Uri ($taskUrl + 'api/health') -TimeoutSec 1; $taskHealthy = $taskHealth.app -eq 'ai-child-mystery' -and $taskHealth.version -eq 2; if ($taskHealthy) { break } } catch {}
    Start-Sleep -Milliseconds 200
  }
  $taskProcess.Refresh()
  if ($taskProcess.HasExited) { throw '本次启动进程已退出，请检查 .local/server-error.log。' }
}
if (-not $taskHealthy) { throw '游戏没有启动成功，请检查端口是否被占用，或查看 .local/server-error.log。' }
if (-not $NoBrowser) { Start-Process $taskUrl }
