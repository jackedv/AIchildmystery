$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
$taskPidFile = Join-Path $taskRoot '.local\server.pid'
$taskExpectedPath = [IO.Path]::GetFullPath((Join-Path $taskRoot '.tools\node.exe'))
$taskServerPath = Join-Path $taskRoot 'server\start.js'
# Recover from a stale pid left by an unsuccessful duplicate launch.
$taskOwnedProcesses = Get-CimInstance Win32_Process -Filter "name='node.exe'" -ErrorAction SilentlyContinue | Where-Object { $_.ExecutablePath -eq $taskExpectedPath -and $_.CommandLine -and $_.CommandLine.Contains($taskServerPath) }
foreach ($taskProcess in $taskOwnedProcesses) {
  Stop-Process -Id $taskProcess.ProcessId -ErrorAction SilentlyContinue
}
if (Test-Path -LiteralPath $taskPidFile) { Remove-Item -LiteralPath $taskPidFile }
