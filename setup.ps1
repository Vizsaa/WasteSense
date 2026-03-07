Write-Host "========================================" -ForegroundColor Green
Write-Host "   WasteSense — Setup Script" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Node.js not found. Install from https://nodejs.org" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Node.js: $(node --version)" -ForegroundColor Green

Write-Host "`nInstalling dependencies..." -ForegroundColor Yellow
npm install
Write-Host "✓ Dependencies installed" -ForegroundColor Green

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "✓ .env created from .env.example" -ForegroundColor Green
    Write-Host "  → Open .env and fill in your database credentials" -ForegroundColor Yellow
} else {
    Write-Host "✓ .env already exists" -ForegroundColor Green
}

if (-not (Test-Path "uploads")) {
    New-Item -ItemType Directory -Path "uploads" | Out-Null
}
Write-Host "✓ uploads/ directory ready" -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  Done! Next steps:" -ForegroundColor White
Write-Host "  1. Import wastesense_db.sql into MySQL via phpMyAdmin" -ForegroundColor White
Write-Host "  2. Fill in your DB credentials in .env" -ForegroundColor White
Write-Host "  3. Run: npm start" -ForegroundColor White
Write-Host "  4. Open: http://localhost:3000" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Green
