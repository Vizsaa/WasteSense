# WasteSense - Smart Waste Collection System

A web-based smart waste collection and monitoring system designed for Philippine communities.

## 🚀 Quick Start (for your own PC)

If you just want to run WasteSense locally and everything is already installed, do this in a terminal inside the `WasteSense` folder:

```bash
npm install
node database/setup.js
npm run dev
```

Then open `http://localhost:3000` in your browser and log in with:

- Email: `admin@wastesense.ph`  
- Password: `admin123`

If you’re setting this up on a **new computer** (fresh install), follow the full guide below.

---

## 🧰 Full Setup Guide (from zero)

These steps are written so you can **send this project to a friend** and they can get it running by just following this section.

### 1. Install required software

1. **Node.js (JavaScript runtime)**
   - Go to `https://nodejs.org/`
   - Download the **LTS** version.
   - Run the installer.
   - On the install screen, make sure **“Add to PATH”** is checked.
   - After installation, close and reopen PowerShell / Command Prompt.
   - Verify:
     ```bash
     node --version
     npm --version
     ```

2. **XAMPP (MySQL database)**
   - Download XAMPP from `https://www.apachefriends.org/`
   - Install it (default options are fine).
   - Open **XAMPP Control Panel**.
   - Start **MySQL** (green indicator). Apache is optional for WasteSense.

### 2. Get the WasteSense project files

You can either:

- **Download as ZIP**:
  - Receive the project folder (`WasteSense`) as a ZIP.
  - Extract it to a folder, e.g.:
    - `C:\Users\YOUR_NAME\Documents\WasteSense`

or

- **Clone from Git (if you use Git)**:
  ```bash
  git clone <repo-url>
  cd WasteSense
  ```

For the rest of this guide, we’ll assume your project is in a folder like:

```text
C:\Users\YOUR_NAME\Documents\WasteSense
```

### 3. Open a terminal in the project folder

1. Open **File Explorer**.
2. Navigate to your `WasteSense` folder.
3. Click on the **address bar**, type `powershell`, and press **Enter**.  
   → A PowerShell window will open already in the `WasteSense` directory.

You should see the prompt ending in `...WasteSense>` when you type:

```powershell
pwd
```

### 4. Install Node.js dependencies

In that PowerShell window (inside `WasteSense`), run:

```powershell
npm install
```

This reads `package.json` and installs all required backend packages (Express, MySQL2, bcrypt, etc.).

Only do this once per machine (or when `package.json` changes).

### 5. Configure environment (.env)

**Important:** The `.env` file is not included in the GitHub repository (for security). You need to create it yourself.

1. In your `WasteSense` folder, you should see a file called **`.env.example`**.
2. **Copy** `.env.example` and rename the copy to **`.env`**:
   - In Windows: Right-click `.env.example` → Copy → Paste → Rename the copy to `.env`
   - Or in PowerShell:
     ```powershell
     Copy-Item .env.example .env
     ```
3. Open `.env` in a text editor. The default values should work for most setups:

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

You only need to change this if:

- Your MySQL has a password → set `DB_PASSWORD` to that password.
- Port 3000 is already in use → change `PORT` to e.g. `3001`.

Otherwise, you can leave `.env` as is.

### 6. Create and populate the database

WasteSense uses a MySQL database called **`wastesense_db`**. You can set it up in **two ways**; pick the one you prefer.

#### Option A: One‑click style via Node.js script (recommended if Node is working)

1. Make sure **MySQL** is running in XAMPP.
2. In the PowerShell window inside `WasteSense`, run:

   ```powershell
   node database/setup.js
   ```

3. This script will:
   - Create the database `wastesense_db` (if it doesn’t exist).
   - Create all tables.
   - Insert initial data.
   - Create the admin user.

If it finishes without error, you’re done with the database step.

#### Option B: Manual setup via phpMyAdmin

Use this if you prefer a graphical interface or the script fails.

1. Open your browser and go to:
   - `http://localhost/phpmyadmin`
2. In the left sidebar, click **“New”**.
3. Create database:
   - Name: `wastesense_db`
   - Collation: `utf8mb4_general_ci`
   - Click **Create**.
4. Click the `wastesense_db` database in the left sidebar.
5. Click the **SQL** tab.
6. Open this file in a text editor:
   - `database/complete_setup.sql`
7. Select all text (Ctrl+A) and copy it (Ctrl+C).
8. Paste into the SQL text area in phpMyAdmin.
9. Click **Go**.
10. You should now see several tables created (locations, users, schedules, waste_submissions, notifications, performance_tracking, etc.).

### 7. Start the WasteSense server

In the same PowerShell window (inside `WasteSense`), run:

```powershell
npm run dev
```

You should see something like:

```text
🚀 WasteSense server running on http://localhost:3000
📊 Environment: development
✅ Database connection established
```

**Leave this window open** while you use the application. To stop the server later, press **Ctrl + C** in that window.

### 8. Open the application in your browser

1. Open Chrome / Edge / Firefox.
2. Go to:
   - `http://localhost:3000`
3. You’ll be redirected to the login page.
4. Log in as **admin** using:
   - Email: `admin@wastesense.ph`
   - Password: `admin123`

You can then:

- Use the **Admin Dashboard** to manage schedules, users, locations, analytics, and performance.
- Register additional **resident** and **collector** accounts from the **User Management** page or via the **Register** screen.

### 9. Basic smoke tests

After setup, try these to confirm everything works:

1. **Admin login**
   - Log in as admin (`admin@wastesense.ph` / `admin123`).
   - Verify you land on the Admin dashboard.
2. **Resident flow**
   - Register a new user as a **resident**.
   - Log in as that resident.
   - Go to **Submit Waste**, upload an image, select types, and submit.
3. **Collector flow**
   - Register a user as a **collector**.
   - Log in as that collector.
   - Check **Collector Dashboard** → see assigned submissions when admin/collector accepts them.
4. **Database health**
   - Visit `http://localhost:3000/api/test-db` → should return a small JSON with `"status": "ok"`.

If any of these steps fail, see the troubleshooting hints in `SETUP.md` or `QUICK_START.md`.

## 📋 Project Status

**Current Completion: 40%**

✅ **Phase 1:** Project Setup & Configuration (15%)  
✅ **Phase 2:** Database Design & Implementation (10%)  
✅ **Phase 3:** User Authentication System (15%)  
⏳ **Phase 4:** Schedule Management System (15%) - Next  
⏳ **Phase 5:** Waste Submission & Image Recognition (15%)  
⏳ **Phase 6:** Notification System (10%)  
⏳ **Phase 7:** Admin Analytics Dashboard (10%)  
⏳ **Phase 8:** Testing, Refinement & Deployment (10%)

See [COMPLETION_SUMMARY.md](COMPLETION_SUMMARY.md) for detailed status.

## 🏗️ Project Structure

```
wastesense/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth middleware
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
├── uploads/             # File uploads directory
└── README.md            # This file
```

## ✨ Features

### ✅ Implemented (40%)
- User authentication with role-based access (Resident, Collector, Admin)
- Secure password hashing (bcrypt)
- Session management
- Role-based dashboards
- Database structure with 6 core tables
- Automated database setup

### 🚧 In Progress (60%)
- Automated scheduling and notifications
- Waste submission with image recognition
- Geotagging for precise collection
- Performance tracking and analytics
- Admin management tools

## 🛠️ Technology Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express
- **Database:** MySQL (via XAMPP)
- **Authentication:** Express-session, bcrypt
- **File Upload:** Multer (ready for implementation)
- **Image Processing:** TensorFlow.js (planned)

## 📚 Documentation

- **[SETUP.md](SETUP.md)** - Detailed setup instructions
- **[COMPLETION_SUMMARY.md](COMPLETION_SUMMARY.md)** - Project completion status
- **[database/README.md](database/README.md)** - Database documentation

## 🔐 Default Credentials

**Admin Account:**
- Email: `admin@wastesense.ph`
- Password: `admin123`

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user (protected)

### System
- `GET /api/health` - Health check
- `GET /api/test-db` - Test database connection

## 🧪 Testing

1. **Test Registration:** Create a new user account
2. **Test Login:** Login with admin credentials
3. **Test Role Access:** Verify role-based dashboards
4. **Test Database:** Visit `/api/test-db`

## 🤝 Contributing

This is a development project. Follow the setup guide and ensure all tests pass before submitting changes.

## 📄 License

ISC

---

**Status:** ✅ Foundation Complete - Ready for Feature Development
