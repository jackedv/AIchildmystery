$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
$taskPidFile = Join-Path $taskRoot '.local\server.pid'
if (Test-Path -LiteralPath $taskPidFile) {
  $taskPidValue = [int](Get-Content -LiteralPath $taskPidFile)
  $taskProcess = Get-CimInstance Win32_Process -Filter ('ProcessId=' + $taskPidValue) -ErrorAction SilentlyContinue
  $taskExpectedPath = [IO.Path]::GetFullPath((Join-Path $taskRoot '.tools\node.exe'))
  $taskServerPath = Join-Path $taskRoot 'server\start.js'
  if ($taskProcess -and $taskProcess.ExecutablePath -eq $taskExpectedPath -and $taskProcess.CommandLine.Contains($taskServerPath)) { Stop-Process -Id $taskPidValue }
}
