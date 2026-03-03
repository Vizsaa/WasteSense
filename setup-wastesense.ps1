param(
    [switch]$SkipInstall,
    [switch]$SkipDbSetup
)

$ErrorActionPreference = 'Stop'

Write-Host "=== WasteSense Setup ===" -ForegroundColor Cyan
Write-Host ""

# Ensure we are in the script directory
Set-Location -Path (Split-Path -Parent $MyInvocation.MyCommand.Definition)

Write-Host "Current directory: $(Get-Location)" -ForegroundColor DarkCyan

if (-not $SkipInstall) {
    Write-Host ""
    Write-Host "Step 1/3: Installing npm dependencies..." -ForegroundColor Yellow
    if (Test-Path "package-lock.json") {
        npm ci
    } else {
        npm install
    }
} else {
    Write-Host "Skipping npm install (SkipInstall specified)." -ForegroundColor DarkYellow
}

Write-Host ""
Write-Host "Step 2/3: Ensuring .env exists..." -ForegroundColor Yellow

if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env" -Force
        Write-Host "Created .env from .env.example." -ForegroundColor Green
    } else {
        Write-Host "WARNING: .env.example not found. Please create .env manually." -ForegroundColor Red
    }
} else {
    Write-Host ".env already exists. Leaving as-is." -ForegroundColor Green
}

if (-not $SkipDbSetup) {
    Write-Host ""
    Write-Host "Step 3/3: Running database setup script..." -ForegroundColor Yellow
    if (Test-Path ".\database\setup.js") {
        node ".\database\setup.js"
    } else {
        Write-Host "WARNING: database/setup.js not found. Skipping DB setup." -ForegroundColor Red
    }
} else {
    Write-Host "Skipping database setup (SkipDbSetup specified)." -ForegroundColor DarkYellow
}

Write-Host ""
Write-Host "Starting WasteSense dev server (npm run dev)..." -ForegroundColor Cyan
Write-Host "Leave this window open while you use the app." -ForegroundColor DarkCyan
Write-Host ""

npm run dev

