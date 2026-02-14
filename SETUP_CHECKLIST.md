# ✅ WasteSense Setup Checklist

Follow these steps in order to set up your WasteSense project.

## Prerequisites Check

- [ ] **XAMPP MySQL is running** (you mentioned it's already running ✅)
- [ ] **Node.js is installed** - [Download here](https://nodejs.org/) if needed
  - Check by running: `node --version` in PowerShell
  - If not installed, download LTS version and check "Add to PATH"

---

## Step 1: Create .env File

**Option A: Using PowerShell script**
```powershell
.\create_env.ps1
```

**Option B: Manual creation**
1. Create a new file named `.env` in the project root
2. Copy this content:

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

**Note:** If your MySQL has a password, update `DB_PASSWORD` in the `.env` file.

---

## Step 2: Install Node.js Dependencies

Open PowerShell in the project directory and run:

```powershell
npm install
```

This will install all packages listed in `package.json`.

**Expected output:** Should see packages being installed, ending with something like:
```
added 150 packages in 30s
```

---

## Step 3: Set Up Database

You have **TWO options**:

### Option A: Automated Setup (Requires Node.js)

```powershell
node database/setup.js
```

**Expected output:**
```
🔌 Connecting to MySQL...
✅ Connected to MySQL
📦 Creating database: wastesense_db...
✅ Database "wastesense_db" created or already exists
📋 Creating tables...
✅ Tables created successfully
📊 Inserting sample data...
✅ Sample locations inserted
✅ Admin user created
✅ Sample schedules inserted
🎉 Database setup completed successfully!
```

### Option B: Manual Setup via phpMyAdmin

1. **Open phpMyAdmin:**
   - Go to: http://localhost/phpmyadmin

2. **Create Database:**
   - Click **"New"** in left sidebar
   - Database name: `wastesense_db`
   - Collation: `utf8mb4_general_ci`
   - Click **"Create"**

3. **Run SQL:**
   - Select `wastesense_db` from left sidebar
   - Click **"SQL"** tab
   - Open file: `database/complete_setup.sql`
   - Copy **ALL** contents
   - Paste into SQL text area
   - Click **"Go"**

4. **Verify:**
   - You should see 6 tables created
   - Check `users` table has 1 admin user
   - Check `locations` table has 3 barangays

---

## Step 4: Start the Server

```powershell
npm run dev
```

**Expected output:**
```
🚀 WasteSense server running on http://localhost:3000
📊 Environment: development
✅ Database connection established
```

**If you see errors:**
- Check XAMPP MySQL is running
- Verify `.env` file exists and has correct values
- Check database `wastesense_db` exists

---

## Step 5: Access the Application

1. **Open browser:** http://localhost:3000

2. **You should see:** Login page

3. **Test Admin Login:**
   - Email: `admin@wastesense.ph`
   - Password: `admin123`
   - Should redirect to Admin Dashboard

4. **Test Registration:**
   - Click "Register here"
   - Fill form and create a new user
   - Login with new credentials

---

## Step 6: Verify Everything Works

### ✅ Database Connection Test
Visit: http://localhost:3000/api/test-db

Should return:
```json
{
  "status": "ok",
  "message": "Database connection successful"
}
```

### ✅ Health Check
Visit: http://localhost:3000/api/health

Should return:
```json
{
  "status": "ok",
  "message": "WasteSense API is running"
}
```

### ✅ Role-Based Access
- Login as Resident → Should see Resident Dashboard
- Login as Collector → Should see Collector Dashboard  
- Login as Admin → Should see Admin Dashboard

---

## Troubleshooting

### ❌ "npm is not recognized"
**Solution:** Install Node.js and restart PowerShell

### ❌ "Cannot connect to MySQL"
**Solutions:**
1. Check XAMPP MySQL service is running (green)
2. Verify MySQL port is 3306
3. Check `.env` file has correct credentials

### ❌ "Port 3000 already in use"
**Solution:** Change `PORT=3001` in `.env` file

### ❌ "Database connection failed"
**Solutions:**
1. Ensure MySQL is running in XAMPP
2. Verify database `wastesense_db` exists
3. Check `.env` file configuration
4. Try manual database setup

### ❌ "Table doesn't exist"
**Solution:** Run database setup again (Step 3)

---

## ✅ Completion Checklist

- [ ] Node.js installed and working
- [ ] `.env` file created
- [ ] Dependencies installed (`npm install`)
- [ ] Database created (`wastesense_db`)
- [ ] All tables created (6 tables)
- [ ] Sample data inserted
- [ ] Server starts without errors
- [ ] Can access http://localhost:3000
- [ ] Can login with admin credentials
- [ ] Can register new users
- [ ] Role-based dashboards work

---

## 🎉 You're Done!

Once all checkboxes are checked, your WasteSense prototype is ready!

**Next Steps:**
- Explore the dashboards
- Test user registration
- Check database in phpMyAdmin
- Start developing Phase 4 features

---

## Need Help?

If you're stuck:
1. Check error messages in terminal
2. Verify all prerequisites
3. Review troubleshooting section
4. Check `QUICK_START.md` for alternative methods
