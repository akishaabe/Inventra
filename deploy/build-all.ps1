# Build Angular apps (admin, supad, staff, shared) and copy dist outputs to deploy/static
# Run from repo root or from this folder in Windows PowerShell

param(
  [string]$NodeBin = "node",
  [switch]$SkipSupad,
  [string[]]$Apps
)

function Build-App {
  param(
    [string]$AppPath,
    [string]$StaticPath
  )
  Write-Host "==> Building $AppPath" -ForegroundColor Cyan
  Push-Location $AppPath
  if (-Not (Test-Path node_modules)) { npm ci }
  npx ng build --configuration production
  Pop-Location

  # Find dist subfolder (Angular v17+ outputs named by app)
  $dist = Join-Path $AppPath "dist"
  if (-Not (Test-Path $dist)) { throw "Dist not found for $AppPath" }
  $sub = Get-ChildItem $dist | Where-Object { $_.PSIsContainer } | Select-Object -First 1
  if (-Not $sub) { throw "No subfolder in $dist" }

  if (-Not (Test-Path $StaticPath)) { New-Item -ItemType Directory -Force -Path $StaticPath | Out-Null }
  Write-Host "==> Copy to $StaticPath" -ForegroundColor Yellow
  robocopy $sub.FullName $StaticPath /MIR | Out-Null
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $root "..")

# Determine which apps to build
$allApps = @('admin','supad','staff','shared')
if ($Apps -and $Apps.Count -gt 0) {
  $toBuild = $Apps
} elseif ($SkipSupad) {
  $toBuild = @('admin','staff','shared')
} else {
  $toBuild = $allApps
}

foreach ($app in $toBuild) {
  switch ($app) {
    'admin'  { Build-App (Join-Path $repoRoot "frontend-app/admin") (Join-Path $root "static/admin") }
    'supad'  { Build-App (Join-Path $repoRoot "frontend-app/supad") (Join-Path $root "static/supad") }
    'staff'  { Build-App (Join-Path $repoRoot "frontend-app/staff") (Join-Path $root "static/staff") }
    'shared' { Build-App (Join-Path $repoRoot "frontend-app/shared") (Join-Path $root "static/shared") }
  default  { Write-Warning "Unknown app '$app' - skipping." }
  }
}

Write-Host ("Built apps: {0}" -f ($toBuild -join ', ')) -ForegroundColor Green
Write-Host "Copied outputs to deploy/static." -ForegroundColor Green
