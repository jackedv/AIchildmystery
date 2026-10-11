$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root
Write-Host '打开 http://127.0.0.1:4173/ ，按 Ctrl+C 停止。'
python -m http.server 4173 --directory $root
