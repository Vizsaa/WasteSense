#!/bin/bash
echo "========================================"
echo "   WasteSense — Setup Script"
echo "========================================"

if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js not found. Install from https://nodejs.org"
    exit 1
fi
echo "✓ Node.js: $(node --version)"

echo "Installing dependencies..."
npm install
echo "✓ Dependencies installed"

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✓ .env created from .env.example"
    echo "  → Open .env and fill in your database credentials"
else
    echo "✓ .env already exists"
fi

mkdir -p uploads
echo "✓ uploads/ directory ready"

echo ""
echo "========================================"
echo "  Done! Next steps:"
echo "  1. Import wastesense_db.sql into MySQL via phpMyAdmin"
echo "  2. Fill in your DB credentials in .env"
echo "  3. Run: npm start"
echo "  4. Open: http://localhost:3000"
echo "========================================"
