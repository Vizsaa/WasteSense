# 🚀 Quick Start Guide

## Prerequisites

Before starting, ensure you have:

1. ✅ **XAMPP** installed and MySQL running (you mentioned it's already running)
2. ⚠️ **Node.js** installed - [Download here](https://nodejs.org/) if not installed

## Option 1: Automated Setup (Recommended)

### Step 1: Install Node.js (if not installed)

1. Download from: https://nodejs.org/
2. Choose **LTS version**
3. Install and check "Add to PATH"
4. **Restart PowerShell** after installation

### Step 2: Run Setup Script

Open PowerShell in the project folder and run:

```powershell
.\setup.ps1
```

This script will:
- Check Node.js installation
- Install all npm dependencies
- Set up the database automatically

### Step 3: Start Server

```powershell
npm run dev
```

### Step 4: Access Application

Open browser: **http://localhost:3000**

Login with:
- Email: `admin@wastesense.ph`
- Password: `admin123`

---

## Option 2: Manual Setup

### Step 1: Install Node.js

Download and install from: https://nodejs.org/

### Step 2: Install Dependencies

```powershell
npm install
```

### Step 3: Set Up Database Manually

**Using phpMyAdmin:**

1. Open: http://localhost/phpmyadmin
2. Click **"New"** in left sidebar
3. Database name: `wastesense_db`
4. Collation: `utf8mb4_general_ci`
5. Click **"Create"**
6. Select `wastesense_db` from left sidebar
7. Click **"SQL"** tab
8. Open `database/complete_setup.sql` file
9. Copy **ALL** contents
10. Paste into SQL text area
11. Click **"Go"**

**Using MySQL Workbench:**

1. Connect to localhost MySQL
2. Open `database/complete_setup.sql`
3. Execute the entire file (or run it)

### Step 4: Start Server

```powershell
npm run dev
```

### Step 5: Access Application

Open browser: **http://localhost:3000**

---

## Verify Installation

### Check Database

Visit: http://localhost:3000/api/test-db

Should return:
```json
{
  "status": "ok",
  "message": "Database connection successful"
}
```

### Test Login

1. Go to: http://localhost:3000/pages/login.html
2. Login with admin credentials
3. Should redirect to Admin Dashboard

### Check Database Tables

In phpMyAdmin, verify these tables exist:
- ✅ locations
- ✅ users
- ✅ schedules
- ✅ waste_submissions
- ✅ notifications
- ✅ performance_tracking

---

## Troubleshooting

### "npm is not recognized"
- Node.js not installed or not in PATH
- Install Node.js and restart PowerShell

### "Cannot connect to MySQL"
- Check XAMPP MySQL is running (green in control panel)
- Verify MySQL port is 3306

### "Port 3000 already in use"
- Change PORT in `.env` file to 3001
- Or stop the process using port 3000

### Database setup fails
- Ensure MySQL is running
- Check `.env` file has correct database credentials
- Try manual setup via phpMyAdmin

---

## What's Next?

Once setup is complete:

1. ✅ Test login functionality
2. ✅ Register new users
3. ✅ Explore role-based dashboards
4. ✅ Verify database in phpMyAdmin

**You're ready to start development! 🎉**
