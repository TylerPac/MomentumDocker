Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $repoRoot 'backend'
$rootEnvFile = Join-Path $repoRoot '.env'
$backendEnvFile = Join-Path $backendDir '.env'

$loadedKeys = New-Object System.Collections.Generic.List[string]

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
  Write-Host ("Loaded .env keys: {0}" -f (($loadedKeys | Sort-Object -Unique) -join ', ')) -ForegroundColor DarkGray
}
else {
  Write-Host "No .env found at: $rootEnvFile or $backendEnvFile" -ForegroundColor Yellow
  Write-Host "Create one from backend/.env.example" -ForegroundColor Yellow
}

Write-Host ("Using MOMENTUM_DEV_DB_HOST: {0}" -f ($env:MOMENTUM_DEV_DB_HOST ?? '(default in application-dev.properties)')) -ForegroundColor DarkGray
Write-Host ("Using MOMENTUM_DEV_DB_NAME: {0}" -f ($env:MOMENTUM_DEV_DB_NAME ?? '(default in application-dev.properties)')) -ForegroundColor DarkGray
Write-Host ("MYSQL_USER set: {0}" -f ([bool]$env:MYSQL_USER)) -ForegroundColor DarkGray
Write-Host ("MYSQL_PASSWORD set: {0}" -f ([bool]$env:MYSQL_PASSWORD)) -ForegroundColor DarkGray

Push-Location $repoRoot
try {
  mvn -f "backend\\pom.xml" "-Dspring-boot.run.profiles=dev" spring-boot:run
}
finally {
  Pop-Location
}
