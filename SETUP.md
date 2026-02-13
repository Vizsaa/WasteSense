# WasteSense Setup Guide

This guide will help you set up the WasteSense project from scratch.

## Prerequisites

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **XAMPP** (for MySQL) - Already installed at `C:\WasteSense`
- **Git** (optional, for version control)

## Step 1: Verify XAMPP is Running

1. Open XAMPP Control Panel
2. Ensure **Apache** and **MySQL** services are running (green status)
3. If not running, click "Start" for both services

## Step 2: Install Node.js Dependencies

Open PowerShell or Command Prompt in the project directory and run:

```bash
npm install
```

This will install all required packages:
- express
- mysql2
- dotenv
- bcrypt
- express-session
- body-parser
- cors
- multer
- nodemon (dev dependency)

## Step 3: Configure Environment Variables

The `.env` file should already be created with default values. If not, create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=wastesense_db

SESSION_SECRET=wastesense-secret-key-change-in-production-2024

UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

**Note:** If your MySQL has a password, update `DB_PASSWORD` in `.env`.

## Step 4: Set Up Database

You have two options to set up the database:

### Option A: Using Setup Script (Recommended)

Run the automated setup script:

```bash
node database/setup.js
```

This script will:
- Create the database `wastesense_db`
- Create all required tables
- Insert sample data (locations, admin user, schedules)

### Option B: Manual Setup via phpMyAdmin

1. Open your browser and go to: `http://localhost/phpmyadmin`
2. Click **"New"** in the left sidebar
3. Enter database name: `wastesense_db`
4. Choose collation: `utf8mb4_general_ci`
5. Click **"Create"**
6. Select `wastesense_db` from the left sidebar
7. Click the **"SQL"** tab
8. Open `database/schema.sql` and copy all contents
9. Paste into the SQL text area and click **"Go"**
10. Open `database/sample_data.sql` and copy all contents
11. Paste into the SQL text area and click **"Go"**

**Default Admin Credentials:**
- Email: `admin@wastesense.ph`
- Password: `admin123`

## Step 5: Start the Development Server

Run the following command:

```bash
npm run dev
```

The server will start on `http://localhost:3000`

You should see:
```
🚀 WasteSense server running on http://localhost:3000
📊 Environment: development
✅ Database connection established
```

## Step 6: Access the Application

Open your browser and navigate to:
- **Main Application:** `http://localhost:3000`
- **Login Page:** `http://localhost:3000/pages/login.html`
- **Register Page:** `http://localhost:3000/pages/register.html`

## Step 7: Test the Setup

### Test Database Connection

Visit: `http://localhost:3000/api/test-db`

You should see:
```json
{
  "status": "ok",
  "message": "Database connection successful",
  "data": [...]
}
```

### Test Authentication

1. **Register a new user:**
   - Go to Register page
   - Fill in the form
   - Select role: Resident, Collector, or Admin
   - Submit

2. **Login:**
   - Use your registered credentials
   - Or use admin credentials: `admin@wastesense.ph` / `admin123`
   - You should be redirected to the appropriate dashboard

3. **Test Role-Based Access:**
   - Login as Resident → Should see Resident Dashboard
   - Login as Collector → Should see Collector Dashboard
   - Login as Admin → Should see Admin Dashboard

## Troubleshooting

### Database Connection Failed

**Error:** `Database connection failed`

**Solutions:**
1. Check XAMPP MySQL service is running
2. Verify database `wastesense_db` exists
3. Check `.env` file has correct credentials
4. Try accessing phpMyAdmin: `http://localhost/phpmyadmin`

### Port Already in Use

**Error:** `Port 3000 is already in use`

**Solutions:**
1. Change `PORT` in `.env` to a different port (e.g., 3001)
2. Or stop the process using port 3000

### Module Not Found

**Error:** `Cannot find module 'xxx'`

**Solution:**
```bash
npm install
```

### Session Not Working

**Issue:** Login doesn't persist

**Solutions:**
1. Ensure cookies are enabled in your browser
2. Check `SESSION_SECRET` is set in `.env`
3. Clear browser cache and cookies
4. Try accessing from `http://localhost:3000` (not `127.0.0.1`)

### Tables Don't Exist

**Error:** `Table 'wastesense_db.users' doesn't exist`

**Solution:**
Run the database setup script again:
```bash
node database/setup.js
```

Or manually run `database/schema.sql` in phpMyAdmin.

## Project Structure

```
wastesense/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/     # Auth middleware
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   └── server.js        # Main server file
├── frontend/
│   ├── css/             # Stylesheets
│   ├── js/              # JavaScript files
│   └── pages/           # HTML pages
├── database/
│   ├── schema.sql       # Database schema
│   ├── sample_data.sql  # Sample data
│   └── setup.js         # Setup script
├── uploads/              # File uploads directory
├── .env                 # Environment variables
├── package.json         # Dependencies
└── README.md            # Project documentation
```

## Next Steps

After completing setup, you can:

1. **Test User Registration** - Create accounts for different roles
2. **Explore Dashboards** - Check out role-specific dashboards
3. **Review Database** - View data in phpMyAdmin
4. **Continue Development** - Start building Phase 4 features

## Support

If you encounter issues:
1. Check the error messages in the console
2. Review the troubleshooting section above
3. Verify all prerequisites are installed
4. Ensure XAMPP services are running

---

**Happy Coding! 🚀**
