# Create .env file for WasteSense
# Run this script to create the .env file

$envContent = @"
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=wastesense_db

# Session Configuration
SESSION_SECRET=wastesense-secret-key-change-in-production-2024

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
"@

$envPath = Join-Path $PSScriptRoot ".env"

if (Test-Path $envPath) {
    Write-Host ".env file already exists. Skipping creation." -ForegroundColor Yellow
} else {
    $envContent | Out-File -FilePath $envPath -Encoding UTF8
    Write-Host "✅ .env file created successfully!" -ForegroundColor Green
    Write-Host "Location: $envPath" -ForegroundColor Cyan
}
