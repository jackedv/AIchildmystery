$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
$taskRuntime = Join-Path $taskRoot '.tools'
New-Item -ItemType Directory -Force -Path $taskRuntime | Out-Null
$taskVersion = '24.19.0'
$taskExistingNode = Join-Path $taskRuntime 'node.exe'
if ((Test-Path -LiteralPath $taskExistingNode) -and (& $taskExistingNode --version) -eq ('v' + $taskVersion)) { Write-Host '本地环境已准备好，可以启动游戏。'; return }
$taskArchive = 'node-v' + $taskVersion + '-win-x64.zip'
$taskBase = 'https://nodejs.org/dist/v' + $taskVersion + '/'
$taskZip = Join-Path $taskRuntime $taskArchive
Invoke-WebRequest -UseBasicParsing -Uri ($taskBase + $taskArchive) -OutFile $taskZip
$taskChecksums = (Invoke-WebRequest -UseBasicParsing -Uri ($taskBase + 'SHASUMS256.txt')).Content
$taskExpected = ($taskChecksums -split "`n" | Where-Object { $_.Trim().EndsWith('  ' + $taskArchive) }) -replace '\s+.*$', ''
if (-not $taskExpected -or (Get-FileHash -LiteralPath $taskZip -Algorithm SHA256).Hash.ToLowerInvariant() -ne $taskExpected.Trim()) { throw '运行环境校验失败，请重试。' }
Expand-Archive -LiteralPath $taskZip -DestinationPath $taskRuntime -Force
Copy-Item -LiteralPath (Join-Path $taskRuntime ('node-v' + $taskVersion + '-win-x64\node.exe')) -Destination (Join-Path $taskRuntime 'node.exe') -Force
Write-Host '本地环境准备完成，可以双击启动游戏。'
