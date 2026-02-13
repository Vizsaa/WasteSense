# WasteSense Installation Guide

## Prerequisites Check

Before proceeding, you need:

1. **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
2. **XAMPP** (MySQL) - ✅ Already installed at `C:\WasteSense`

## Step-by-Step Installation

### Step 1: Install Node.js

1. Download Node.js from: https://nodejs.org/
2. Choose the **LTS version** (recommended)
3. Run the installer
4. **Important:** Check "Add to PATH" during installation
5. Restart your terminal/PowerShell after installation

**Verify Installation:**
```bash
node --version
npm --version
```

### Step 2: Verify XAMPP MySQL is Running

1. Open XAMPP Control Panel
2. Ensure **MySQL** service shows green (running)
3. If not running, click "Start" button

### Step 3: Install Project Dependencies

Open PowerShell in the project directory (`C:\Users\FSOS\Desktop\WasteSense`) and run:

```bash
npm install
```

This will install all required packages listed in `package.json`.

### Step 4: Set Up Database

You have **TWO options**:

#### Option A: Automated Setup (Recommended)

Run the setup script:
```bash
node database/setup.js
```

This will automatically:
- Create the database `wastesense_db`
- Create all tables
- Insert sample data
- Create admin user

#### Option B: Manual Setup via phpMyAdmin

1. Open browser: `http://localhost/phpmyadmin`
2. Click **"New"** in left sidebar
3. Database name: `wastesense_db`
4. Collation: `utf8mb4_general_ci`
5. Click **"Create"**
6. Select `wastesense_db` from left sidebar
7. Click **"SQL"** tab
8. Copy contents of `database/schema.sql` and paste, click **"Go"**
9. Copy contents of `database/sample_data.sql` and paste, click **"Go"**

### Step 5: Start the Server

```bash
npm run dev
```

You should see:
```
🚀 WasteSense server running on http://localhost:3000
📊 Environment: development
✅ Database connection established
```

### Step 6: Access the Application

Open your browser and go to:
- **Main:** http://localhost:3000
- **Login:** http://localhost:3000/pages/login.html

**Default Admin Login:**
- Email: `admin@wastesense.ph`
- Password: `admin123`

## Troubleshooting

### "npm is not recognized"
- Node.js is not installed or not in PATH
- Install Node.js and restart terminal
- Or add Node.js to system PATH manually

### "Cannot connect to MySQL"
- Ensure XAMPP MySQL service is running
- Check MySQL port (default: 3306)
- Verify `.env` file has correct credentials

### "Port 3000 already in use"
- Change PORT in `.env` to another port (e.g., 3001)
- Or stop the process using port 3000

### Database connection fails
- Check XAMPP MySQL is running
- Verify database `wastesense_db` exists
- Check `.env` file configuration

## What to Do Next

Once everything is set up:

1. ✅ Test login with admin credentials
2. ✅ Register a new user account
3. ✅ Test role-based dashboards
4. ✅ Verify database tables in phpMyAdmin

## Need Help?

If you encounter issues:
1. Check error messages in terminal
2. Verify all prerequisites are installed
3. Ensure XAMPP MySQL is running
4. Check `.env` file exists and has correct values
