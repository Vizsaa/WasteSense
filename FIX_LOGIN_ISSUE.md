# 🔧 Fix Login Issue - "Invalid email or password"

## Problem
Login with `admin@wastesense.ph` / `admin123` returns "Invalid email or password"

## Possible Causes
1. Admin user doesn't exist in database
2. Password hash is incorrect
3. Email case sensitivity issue
4. Database connection issue

## Solution: Fix Admin Password

### Option 1: Using Node.js Script (Recommended)

Run this script to fix the admin password:

```powershell
node database/fix_admin_password.js
```

This script will:
- ✅ Check if admin user exists
- ✅ Create admin user if missing
- ✅ Generate correct password hash for "admin123"
- ✅ Update the password hash
- ✅ Verify the password works

**Expected output:**
```
🔌 Connecting to MySQL...
✅ Connected to MySQL
🔐 Generating password hash...
✅ Password hash generated
🔍 Checking if admin user exists...
✅ Admin user found
🔄 Updating password hash...
✅ Password hash updated successfully!
🧪 Verifying password...
✅ Password verification successful!
🎉 Admin password fix completed!
```

### Option 2: Manual Fix via phpMyAdmin

1. **Open phpMyAdmin:** http://localhost/phpmyadmin
2. **Select database:** `wastesense_db`
3. **Click SQL tab**
4. **Run this SQL:**

```sql
-- First, check if admin exists
SELECT * FROM users WHERE email = 'admin@wastesense.ph';

-- If admin doesn't exist, create it (you'll need to generate a hash)
-- OR use the fix script above to generate the correct hash
```

**Note:** You need a proper bcrypt hash. The easiest way is to use the Node.js script above.

### Option 3: Delete and Recreate Admin User

If the admin user exists but password is wrong:

1. **Open phpMyAdmin**
2. **Select database:** `wastesense_db`
3. **Click SQL tab**
4. **Run:**

```sql
-- Delete existing admin user
DELETE FROM users WHERE email = 'admin@wastesense.ph';

-- Then run the fix script to recreate it
```

Then run: `node database/fix_admin_password.js`

---

## Verify the Fix

### Check Database

Run this in phpMyAdmin SQL tab:

```sql
SELECT 
    user_id,
    email,
    full_name,
    role,
    is_active
FROM users 
WHERE email = 'admin@wastesense.ph';
```

You should see 1 row with the admin user.

### Test Login

1. Go to: http://localhost:3000/pages/login.html
2. Email: `admin@wastesense.ph`
3. Password: `admin123`
4. Should redirect to Admin Dashboard ✅

---

## Troubleshooting

### "Cannot connect to MySQL"
- Check XAMPP MySQL is running
- Verify `.env` file has correct credentials

### "Database doesn't exist"
- Run database setup first: `node database/setup.js`
- Or use `database/complete_setup.sql` in phpMyAdmin

### "Script doesn't work"
- Make sure Node.js is installed
- Make sure dependencies are installed: `npm install`
- Check error messages in terminal

---

## Still Having Issues?

1. **Check if admin user exists:**
   ```sql
   SELECT * FROM users WHERE email = 'admin@wastesense.ph';
   ```

2. **Check server logs** for error messages

3. **Verify database connection:**
   - Visit: http://localhost:3000/api/test-db
   - Should return success message

4. **Try registering a new user** to test if authentication works at all

---

## Quick Fix Command

Just run this in PowerShell:

```powershell
node database/fix_admin_password.js
```

This should fix the issue! 🎉
