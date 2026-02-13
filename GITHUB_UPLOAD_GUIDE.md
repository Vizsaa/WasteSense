# GitHub Upload Guide for WasteSense

## Files That Should NOT Be Uploaded (Already in .gitignore)

These files are **intentionally excluded** from GitHub for security and best practices:

### ✅ Correctly Excluded:
- **`.env`** - Contains your database password and session secret (SECURITY RISK if uploaded)
- **`node_modules/`** - Dependencies folder (too large, users should run `npm install` themselves)
- **`uploads/*`** - User-uploaded images (except `.gitkeep` to preserve the folder)
- **`*.log`** - Log files (not needed)
- **`.DS_Store`, `Thumbs.db`** - OS files (not needed)
- **`.vscode/`, `.idea/`** - IDE settings (personal preference)

### 📝 What This Means:
- **`.env`** won't be uploaded → That's GOOD! Users should create their own from `.env.example`
- **`node_modules/`** won't be uploaded → That's GOOD! Users should run `npm install` after cloning

## Files That SHOULD Be Uploaded

These important files should be included:

- ✅ All source code (`backend/`, `frontend/`)
- ✅ `package.json` (tells users what dependencies to install)
- ✅ `package-lock.json` (ensures consistent dependency versions)
- ✅ `.env.example` (template for users to create their own `.env`)
- ✅ `.gitignore` (tells Git what to exclude)
- ✅ `README.md` (setup instructions)
- ✅ `database/` folder (SQL scripts)
- ✅ All documentation files (`.md` files)

## How to Upload to GitHub

### Option 1: Using GitHub Desktop (Easiest)

1. Download **GitHub Desktop** from https://desktop.github.com/
2. Install and sign in with your GitHub account
3. Click **File → Add Local Repository**
4. Browse to your `WasteSense` folder
5. Review the files (you'll see `.env` and `node_modules/` are grayed out - that's correct!)
6. Write a commit message like "Initial commit - WasteSense project"
7. Click **Commit to main**
8. Click **Publish repository** (or **Push origin** if already published)

### Option 2: Using Git Command Line

If you have Git installed:

```powershell
cd "c:\Users\Vince\OneDrive\Documents\SAAD\WasteSense"

# Initialize Git (if not already done)
git init

# Add all files (respects .gitignore)
git add .

# Check what will be uploaded (optional)
git status

# Commit
git commit -m "Initial commit - WasteSense project"

# Add your GitHub repository as remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push to GitHub
git push -u origin main
```

### Option 3: Using GitHub Web Interface

1. Go to https://github.com/new
2. Create a new repository (don't initialize with README)
3. On the repository page, click **"uploading an existing file"**
4. Drag and drop your `WasteSense` folder contents
5. **IMPORTANT:** Make sure `.env` and `node_modules/` are NOT selected
6. Commit the files

## Troubleshooting "Files Can't Be Uploaded"

### Issue: "File too large"
- **Solution:** `node_modules/` might be trying to upload. Make sure `.gitignore` includes `node_modules/` (it already does).

### Issue: "Some files are grayed out"
- **Solution:** This is normal! Grayed-out files are excluded by `.gitignore` (like `.env`). This is correct behavior.

### Issue: "Can't find .env.example"
- **Solution:** I've created `.env.example` for you. Make sure it's in your folder and upload it.

### Issue: "GitHub says .env is missing"
- **Solution:** That's correct! `.env` should NOT be uploaded. Users will create it from `.env.example` as explained in the README.

## After Uploading - What Users Need to Do

When someone clones your repository, they need to:

1. Run `npm install` (to create `node_modules/`)
2. Copy `.env.example` to `.env` (to create their own `.env`)
3. Set up the database using `database/complete_setup.sql`
4. Run `npm start` or `npm run dev`

All of this is explained in the `README.md` file.

## Quick Checklist Before Uploading

- [ ] `.env.example` exists (template for environment variables)
- [ ] `.gitignore` includes `.env` and `node_modules/`
- [ ] `README.md` has setup instructions
- [ ] `package.json` exists
- [ ] All source code files are present
- [ ] Database SQL files are in `database/` folder

## Need Help?

If you're still having issues uploading specific files, check:
1. File size (GitHub has limits)
2. File permissions (make sure files aren't locked)
3. `.gitignore` rules (some files are meant to be excluded)
