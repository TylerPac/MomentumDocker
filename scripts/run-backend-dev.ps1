Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $repoRoot 'backend'
$rootEnvFile = Join-Path $repoRoot 'dev.env'
$backendEnvFile = Join-Path $backendDir 'dev.env'

$loadedKeys = New-Object System.Collections.Generic.List[string]

function Get-DisplayValue([string]$value, [string]$fallback) {
  if ([string]::IsNullOrWhiteSpace($value)) {
    return $fallback
  }

  return $value
}

function Import-DotEnvFile([string]$path) {
  if (-not (Test-Path $path)) { return }

  Get-Content $path | ForEach-Object {
    $line = $_.Trim()

    if (-not $line) { return }
    if ($line.StartsWith('#')) { return }

    $parts = $line.Split('=', 2)
    if ($parts.Count -ne 2) { return }

    $name = $parts[0].Trim()
    $value = $parts[1].Trim()

    if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
      $value = $value.Substring(1, $value.Length - 2)
    }

    if ($name) {
      Set-Item -Path ("Env:{0}" -f $name) -Value $value
      $loadedKeys.Add($name) | Out-Null
    }
  }
}

Import-DotEnvFile $rootEnvFile
Import-DotEnvFile $backendEnvFile

if ($loadedKeys.Count -gt 0) {
  Write-Host ("Loaded dev.env keys: {0}" -f (($loadedKeys | Sort-Object -Unique) -join ', ')) -ForegroundColor DarkGray
}
else {
  Write-Host "No dev.env found at: $rootEnvFile or $backendEnvFile" -ForegroundColor Yellow
  Write-Host "Create one at the repo root or in backend/dev.env" -ForegroundColor Yellow
}

Write-Host ("Using MOMENTUM_DEV_DB_HOST: {0}" -f (Get-DisplayValue $env:MOMENTUM_DEV_DB_HOST '(default in application-dev.properties)')) -ForegroundColor DarkGray
Write-Host ("Using MOMENTUM_DEV_DB_NAME: {0}" -f (Get-DisplayValue $env:MOMENTUM_DEV_DB_NAME '(default in application-dev.properties)')) -ForegroundColor DarkGray
Write-Host ("MYSQL_USER set: {0}" -f ([bool]$env:MYSQL_USER)) -ForegroundColor DarkGray
Write-Host ("MYSQL_PASSWORD set: {0}" -f ([bool]$env:MYSQL_PASSWORD)) -ForegroundColor DarkGray

$mavenCommand = Get-Command mvn -ErrorAction SilentlyContinue
if (-not $mavenCommand) {
  throw "Maven is not installed or not on PATH. Install Maven 3.9+ and make sure 'mvn' works in PowerShell, then rerun this script."
}

Push-Location $repoRoot
try {
  mvn -f "backend\\pom.xml" "-Dspring-boot.run.profiles=dev" spring-boot:run
}
finally {
  Pop-Location
}
