# 🚀 Quick Fix for Login Issue

## The Problem
Login with `admin@wastesense.ph` / `admin123` returns "Invalid email or password"

## Solution Options

### ✅ Option 1: Run Fix Script (Easiest)

**In the same terminal where your server is running**, open a NEW terminal/PowerShell window and run:

```powershell
cd C:\Users\FSOS\Desktop\WasteSense
node database/fix_admin_password.js
```

This will:
- Check if admin user exists
- Create/update admin user with correct password hash
- Verify the password works

**Then try logging in again!**

---

### ✅ Option 2: Register New Admin User

1. Go to: http://localhost:3000/pages/register.html
2. Fill in the form:
   - Full Name: Admin User
   - Email: `admin@wastesense.ph` (or use a different email)
   - Password: `admin123`
   - Confirm Password: `admin123`
   - Role: **Admin**
   - Other fields: Optional
3. Click Register
4. Login with the credentials you just created

**Note:** If `admin@wastesense.ph` already exists, use a different email like `admin2@wastesense.ph`

---

### ✅ Option 3: Check Database via phpMyAdmin

1. Open: http://localhost/phpmyadmin
2. Select database: `wastesense_db`
3. Click on `users` table
4. Check if admin user exists:
   - Look for email: `admin@wastesense.ph`
   - If it doesn't exist, that's the problem!
5. If it doesn't exist, run this SQL:

```sql
USE wastesense_db;

-- Check what's in users table
SELECT * FROM users;

-- If empty, you need to run the database setup
-- Use: database/complete_setup.sql in phpMyAdmin
```

---

### ✅ Option 4: Manual SQL Fix (If you can't run Node.js script)

If you can't run the Node.js script, you can manually create the admin user, but you'll need a proper bcrypt hash.

**Easiest way:** Use Option 2 (Register new admin) instead!

---

## Recommended: Try Option 1 First!

If your server is running, Node.js should be available. Try:

```powershell
node database/fix_admin_password.js
```

If that doesn't work, use **Option 2** (register a new admin user) - it's the quickest!

---

## After Fixing

1. Go to: http://localhost:3000/pages/login.html
2. Login with your admin credentials
3. Should redirect to Admin Dashboard ✅

---

## Still Not Working?

Check these:

1. **Is the database connected?**
   - Visit: http://localhost:3000/api/test-db
   - Should show success message

2. **Does admin user exist?**
   - Check in phpMyAdmin: `SELECT * FROM users WHERE email = 'admin@wastesense.ph';`

3. **Check server console** for error messages

Let me know which option works for you!
