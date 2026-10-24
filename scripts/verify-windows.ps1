$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot

Write-Host "== Qorvexa verification ==" -ForegroundColor Cyan

Write-Host "`n[1/4] Installing frontend dependencies..." -ForegroundColor Yellow
Push-Location (Join-Path $root 'frontend')
try {
    npm ci
    if ($LASTEXITCODE -ne 0) { throw "npm ci failed with exit code $LASTEXITCODE" }
    Write-Host "`n[2/4] Building Angular frontend..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Angular build failed with exit code $LASTEXITCODE" }
} finally { Pop-Location }

Write-Host "`n[3/4] Restoring .NET API..." -ForegroundColor Yellow
Push-Location (Join-Path $root 'backend/Qorvexa.Api')
try {
    dotnet restore
    if ($LASTEXITCODE -ne 0) { throw ".NET restore failed with exit code $LASTEXITCODE" }
    Write-Host "`n[4/4] Building .NET API..." -ForegroundColor Yellow
    dotnet build --no-restore
    if ($LASTEXITCODE -ne 0) { throw ".NET build failed with exit code $LASTEXITCODE" }
} finally { Pop-Location }

Write-Host "`nBuild checks passed. Next, test the deployed website, API, Supabase RLS and Gemini integration using PRODUCTION_SETUP_CHECKLIST.md." -ForegroundColor Green
