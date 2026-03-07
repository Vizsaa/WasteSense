![WasteSense](frontend/assets/banner.png)

WasteSense is a smart, role-based waste collection system built for local communities in the Philippines. It helps residents submit waste pickup requests with AI-assisted categorization, helps collectors manage and complete pickups in their assigned barangay, and gives administrators the tools to manage users, schedules, locations, analytics, and feedback in one place.

### Key features (by role)
- **Resident**
  - Submit waste with photo + AI category suggestion
  - Pinpoint pickup location on a map (Leaflet) or via address geocoding
  - Track request history and status
  - Send feedback to the LGU/admin team
- **Collector**
  - Sees only the submissions in their assigned barangay
  - Claims new requests, marks them as collected, and logs notes/problems
  - Master Map view with filters + route optimization helpers
- **Admin**
  - Approves/denies account requests (collector role, password reset, etc.)
  - Manages users, barangays/locations, categories, and schedules
  - Views analytics (charts + heatmap) and performance summaries

### Tech stack
Node.js, Express, MySQL/MariaDB, Vanilla JS, Leaflet.js, TensorFlow.js

---

## Prerequisites
1. **Node.js v18+** — `https://nodejs.org`  
   - Verify: `node --version`
2. **XAMPP** — `https://www.apachefriends.org`  
   - You only need **MySQL** (Apache is optional for this project)
3. **Git** (optional) — `https://git-scm.com`

---

## Installation (step by step)

### Step 1 — Get the code
You can either:
- **Clone with Git**:
  - `git clone <your-repo-url>`
- **Or download ZIP** from GitHub and extract it

Then open the folder in your terminal:

```bash
cd WasteSense
```

### Step 2 — Set up the database (phpMyAdmin, click-by-click)
1. Open **XAMPP Control Panel**
2. Start **MySQL**
3. Open your browser and go to `http://localhost/phpmyadmin`
4. Click **New** (left sidebar)
5. Database name: `wastesense_db`
6. Click **Create**
7. Click the new `wastesense_db` database in the left sidebar
8. Click **Import**
9. Click **Choose File**
10. Select `wastesense_db.sql` (it’s in the project root)
11. Scroll down and click **Go**

If the import finishes successfully, you’re done with the database.

### Step 3 — Configure `.env`
1. Copy `.env.example` to `.env`
2. Open `.env` and set your MySQL credentials (typical XAMPP defaults are `root` with an empty password)

### Step 4 — Install dependencies

```bash
npm install
```

### Step 5 — Start the app

```bash
npm start
```

### Step 6 — Open the app
Visit:
- `http://localhost:3000`

---

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@wastesense.ph | admin123 |

> ⚠️ Change the admin password after first login.

Notes:
- Residents self-register.
- Collectors register and **await admin approval** before they can log in.

---

## Quick Setup (Automated)
These scripts handle `npm install`, `.env` creation, and ensuring `uploads/` exists. Database import is still manual.

```bash
# Windows (PowerShell)
.\setup.ps1

# Mac / Linux
chmod +x setup.sh && ./setup.sh
```

---

## Project Structure

```
WasteSense/
├── backend/
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth, file upload
│   ├── models/          # Database queries
│   ├── routes/          # API endpoints
│   ├── utils/           # Image recognition (TensorFlow.js)
│   └── server.js        # Entry point
├── frontend/
│   ├── assets/          # Brand images (banner, mascots)
│   ├── css/             # Global styles
│   ├── js/              # Shared JS utilities
│   └── pages/           # All HTML pages
├── uploads/             # Waste images (auto-created; kept empty in git)
├── wastesense_db.sql    # Full database dump — import this first
├── .env.example         # Environment template
└── package.json
```

---

## How It Works

### Resident flow
Residents register, then submit a waste pickup request by uploading a photo. The app suggests a category using AI, the resident confirms/overrides it, then sets the pickup location on the map. Requests show up in **My Submissions** with clear status badges.

### Collector flow
Collectors are scoped to a barangay assigned by the admin. They open the Master Map to see new requests and their scheduled pickups, claim requests, and mark them collected with optional notes. If there’s an issue, they can report a problem so admins/residents are informed.

### Admin flow
Admins manage the system: locations (barangays), categories, schedules, user roles/activation, and account requests (collector approvals, password resets, etc.). Analytics and performance pages provide visibility into trends and operational health.

---

## Troubleshooting

| Problem | Fix |
|--------|-----|
| Cannot connect to database | Start **MySQL** in the XAMPP Control Panel |
| Port 3000 already in use | Set `PORT=3001` in `.env`, then restart `npm start` |
| `npm install` fails | Make sure Node.js is v18+: `node --version` |
| Admin login fails | Re-import `wastesense_db.sql` into `wastesense_db` |
| Images not loading | Ensure `uploads/` exists at project root (it is created by the setup scripts) |
| Map is blank | Leaflet map tiles require internet access |
| Collector sees no submissions | Admin must assign the collector to a barangay first |

---

## Tech Stack & Acknowledgements
Built with Node.js, Express, MySQL/MariaDB, Vanilla JS, Leaflet.js, and TensorFlow.js.

Credits: **BRUTAS, AGUILA, BARLISO, BAYANI**.
