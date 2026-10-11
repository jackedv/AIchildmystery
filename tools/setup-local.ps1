$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
$taskRuntime = Join-Path $taskRoot '.tools'
New-Item -ItemType Directory -Force -Path $taskRuntime | Out-Null
$taskVersion = '24.19.0'
$taskExistingNode = Join-Path $taskRuntime 'node.exe'
if (-not ((Test-Path -LiteralPath $taskExistingNode) -and (& $taskExistingNode --version) -eq ('v' + $taskVersion))) {
$taskArchive = 'node-v' + $taskVersion + '-win-x64.zip'
$taskBase = 'https://nodejs.org/dist/v' + $taskVersion + '/'
$taskZip = Join-Path $taskRuntime $taskArchive
Invoke-WebRequest -UseBasicParsing -Uri ($taskBase + $taskArchive) -OutFile $taskZip
$taskChecksums = (Invoke-WebRequest -UseBasicParsing -Uri ($taskBase + 'SHASUMS256.txt')).Content
$taskExpected = ($taskChecksums -split "`n" | Where-Object { $_.Trim().EndsWith('  ' + $taskArchive) }) -replace '\s+.*$', ''
if (-not $taskExpected -or (Get-FileHash -LiteralPath $taskZip -Algorithm SHA256).Hash.ToLowerInvariant() -ne $taskExpected.Trim()) { throw '运行环境校验失败，请重试。' }
Expand-Archive -LiteralPath $taskZip -DestinationPath $taskRuntime -Force
Copy-Item -LiteralPath (Join-Path $taskRuntime ('node-v' + $taskVersion + '-win-x64\node.exe')) -Destination (Join-Path $taskRuntime 'node.exe') -Force
}
$taskDistribution = Join-Path $taskRuntime ('node-v' + $taskVersion + '-win-x64')
$taskNpm = Join-Path $taskDistribution 'node_modules\npm\bin\npm-cli.js'
if (-not (Test-Path -LiteralPath $taskNpm)) { throw '本地运行环境缺少准备工具，请重新运行准备脚本。' }
$taskPreviousPath = $env:PATH
$env:PATH = $taskDistribution + ';' + $env:PATH
$env:npm_config_cache = Join-Path $taskRuntime 'npm-cache'
$env:npm_config_userconfig = Join-Path $taskRuntime 'npmrc'
$env:npm_config_update_notifier = 'false'
try {
  Push-Location $taskRoot
  & $taskExistingNode $taskNpm ci --include=optional --no-audit --no-fund
  if ($LASTEXITCODE -ne 0) { throw '本地图片处理工具准备失败，请检查网络后重试。' }
} finally { Pop-Location; $env:PATH = $taskPreviousPath }
Write-Host '本地环境准备完成，可以双击启动游戏。'
