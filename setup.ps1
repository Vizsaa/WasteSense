# WasteSense Setup Script
# Run this script in PowerShell to set up the project

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  WasteSense Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "Make sure to check 'Add to PATH' during installation" -ForegroundColor Yellow
    exit 1
}

# Check npm
Write-Host "Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 1: Installing dependencies..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Database Setup" -ForegroundColor Cyan
Write-Host "Please choose an option:" -ForegroundColor Yellow
Write-Host "1. Automated setup (requires MySQL running)" -ForegroundColor White
Write-Host "2. Manual setup via phpMyAdmin" -ForegroundColor White
Write-Host ""
$choice = Read-Host "Enter choice (1 or 2)"

if ($choice -eq "1") {
    Write-Host "Running automated database setup..." -ForegroundColor Yellow
    node database/setup.js
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Database setup failed" -ForegroundColor Red
        Write-Host "Please ensure XAMPP MySQL is running" -ForegroundColor Yellow
        Write-Host "Or use option 2 for manual setup" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Database setup completed" -ForegroundColor Green
    }
} else {
    Write-Host ""
    Write-Host "Manual Database Setup Instructions:" -ForegroundColor Cyan
    Write-Host "1. Open http://localhost/phpmyadmin" -ForegroundColor White
    Write-Host "2. Click 'New' and create database: wastesense_db" -ForegroundColor White
    Write-Host "3. Select wastesense_db, click 'SQL' tab" -ForegroundColor White
    Write-Host "4. Open database/complete_setup.sql and copy all contents" -ForegroundColor White
    Write-Host "5. Paste into SQL tab and click 'Go'" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter when database setup is complete"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the server, run:" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Then open:" -ForegroundColor Yellow
Write-Host "  http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Admin Login:" -ForegroundColor Yellow
Write-Host "  Email: admin@wastesense.ph" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host ""
