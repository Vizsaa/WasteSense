## WasteSense Evaluation Guide

> **Purpose of this guide**  
> This file is for panelists, advisers, and reviewers who will evaluate **WasteSense** using the TUP System Analysis and Design Evaluation Matrix.  
> It explains **what to run, what to click, what to say, and what to show** so the system’s strengths are obvious in a short, well-structured demo.

---

## 1. Quick Start (5–7 minutes)

### 1.1. Prerequisites

- **Node.js**: v18+ (tested with v24)
- **MySQL / MariaDB**: XAMPP or similar stack

### 1.2. One-Time Database Setup

From the project root:

```bash
node database/setup.js
```

This will:
- Create the `wastesense_db` database
- Drop and recreate all tables
- Insert seed data (admin, sample residents/collectors, locations, schedules)
- Print default admin credentials:
  - **Email**: `admin@wastesense.ph`
  - **Password**: `admin123`

### 1.3. Environment Configuration

1. Copy `.env.example` → `.env`
2. Adjust only if needed:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=wastesense_db

SESSION_SECRET=wastesense-secret-key-change-in-production-2024
JWT_SECRET=super_secret_jwt_key_wastesense_2026

UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

> **Panel cue**: Emphasize that **changing only `.env`** is enough to move between machines (criterion 3.2 – portability).

### 1.4. Start the Server

From the project root:

```bash
npm install
npm start
```

Watch the terminal for:

- `🚀 WasteSense server running on http://localhost:3000`
- `✅ Database connection established`
- `[ImageRecognition] ✅ MobileNet model loaded successfully.`

> **Panel cue**: Point out that **MobileNet is pre-warmed on startup**, not on the first request (criterion 2.3 – resource efficiency).

---

## 2. System Overview (Roles & Story)

Use this script to frame the demo in **plain language**:

- **Resident** – “A household user who wants to schedule waste pickups and see notifications.”
- **Collector** – “A barangay-assigned garbage collector who sees optimized routes and tasks.”
- **Admin** – “The LGU user who manages locations, schedules, categories, accounts, and special access requests.”

### 2.1. High-Level Flow

1. Resident **registers and submits** a waste pickup request.
2. Collector in the same barangay **accepts and completes** the request using the map and route tools.
3. Admin **monitors and configures**:
   - User roles and barangays
   - Locations, categories, and schedules
   - Password and access requests
   - Analytics, feedback, and performance

> This 3-role story is what the evaluation matrix expects for **Functionality (1.1)** and **Technical Background (DFD/Use Cases)**.

---

## 3. Database & Schema (What the System Expects)

You rarely need to open the SQL, but reviewers may ask about structure.

### 3.1. Key Tables

- `users` – roles (`resident`, `collector`, `admin`), barangay assignment, `is_active`, `force_password_change`.
- `waste_submissions` – core entity; fields include:
  - `collection_status` ENUM(`pending`,`scheduled`,`collected`)
  - `predicted_category`, `confidence_score`, `confirmed_category`
  - `waste_types`, `waste_adjectives`, `waste_description`
  - `latitude`, `longitude`, `address_description`
  - `has_problem`, `problem_type`, `problem_description`
- `locations` – barangays, municipalities, `is_active`.
- `schedules` – collection schedule per location & category.
- `notifications` – per-user notifications, `notification_type` enum.
- `password_reset_requests` – multi-purpose request entity (passwords, role upgrades, reactivation, email change, issue reports).
- `waste_categories` – configurable waste categories.
- `feedback` – resident feedback messages.

> **Panel cue**: When asked about DFD/ERD, explain how these tables support the 3-role flow above.

---

## 4. Evaluation Matrix Walkthrough (Live Demo Script)

This section is **exactly how to run the demo** so that each criterion is visibly satisfied.

### 4.1. Resident Flow (Criterion 1.1, 1.2, 1.3, 2.2)

1. Open `http://localhost:3000/pages/register.html`.
2. **Show barangay dropdown**:
   - Explain that options come from **`GET /api/locations`**, not hard-coded.
3. Register as a **Resident**:
   - Fill in name, email, password (≥6), confirm password, barangay.
   - Show inline validation if you intentionally leave barangay or email blank.
4. After registering, switch to **Login** and log in as this new resident.
   - Mention that a **JWT and a server session** are created (criterion 1.4).
5. You should be redirected to `dashboard-resident.html`:
   - Point out:
     - **Greeting** with name (“Good morning, …”).
     - **Assigned barangay badge**.
     - **Stats cards**: Total Submitted, Pending Pickups, Collected (derived from `/api/waste/my-submissions`).
     - **Upcoming schedules** for that barangay.

#### 4.1.1. Waste Submission Wizard

1. Click **Submit Waste** (sidebar or floating button).
2. Step 1 – **Take/Upload Photo**:
   - Upload a small image.
   - Show **preview** and “Retake Photo” button.
3. The AI overlay appears:
   - Explain that:
     - Client-side TensorFlow.js + MobileNet runs in the browser.
     - Server-side `/api/waste/analyze` also runs the image through the backend model.
   - When done, the card shows:
     - **Predicted category**.
     - **Confidence bar** that fills to e.g. “77%” (capped at 100).
     - **Detected labels** chips when available.
4. Step 2 – **Details**:
   - Show that category can be **overridden**.
   - Select main category and properties (adjectives).
   - Optionally add a text note.
5. Step 3 – **Location**:
   - Barangay is **pre-filled** from the resident profile and read-only.
   - Use one of:
     - **GPS button**.
     - **Map Address** (geocode).
     - Or click on the map to drop a pin.
6. Submit:
   - The overlay shows upload progress.
   - On success, it redirects to **My Submissions**.

#### 4.1.2. My Submissions & Notifications

1. On `my-submissions.html`, show:
   - The new submission with **status badge `Pending`** (amber).
   - Confidence (% match) on the card if AI predicted a category.
2. If you have previous data, show filters:
   - **All / Pending / Scheduled / Collected**.
3. Open **Notifications**:
   - Show the list for this user only.
   - Explain that:
     - Notifications are stored in the `notifications` table.
     - The **bell icon** in the header reflects unread counts.

#### 4.1.3. Profile & Feedback

1. On **My Profile**, show:
   - Name, email, role badge.
   - Updating phone/address via `/api/users/update-profile`.
2. On **Feedback**, submit a short message:
   - This goes into `feedback` table and is visible in the admin panel later.

---

### 4.2. Collector Flow (Criterion 1.1, 1.3, 2.1, 2.2, 2.3)

Use either:
- A **seeded collector** in barangay 1 (e.g., one from `users` table), or  
- The **eval collector** created during setup: `eval.collector@wastesense.test`.

1. Log out as resident. Log in as **Collector**.
2. Confirm redirect to `dashboard-collector.html`.
3. Show top:
   - “Ready for today, [CollectorName]?”
   - **Assigned area badge** – “📍 Assigned Area: Barangay …”  
     - If a collector has no barangay, they see a **warning banner** instead of tasks.
4. Stats cards (from `/api/waste/collector/stats`):
   - **Collected Today**
   - **Collected This Week**
   - **Pending Available**
   - **My Active Tasks**
   - Mention that these match SQL:
     - Pending = count of `collection_status='pending'` for collector’s barangay.
     - Active tasks = `collection_status='scheduled'` for this collector.
   - Note: auto-refresh every 60 seconds with `setInterval`.

#### 4.2.1. Seeing the Resident’s Request

1. Click **Open Master Map** or go directly to `collector-submissions.html`.
2. Show:
   - Leaflet map centered on the city.
   - Side panel with **filters**:
     - Status: All / New Requests / My Pickups.
     - Category: All / Bio / Recycle / Hazard / Mixed.
3. You should see at least:
   - The resident’s pending request from the previous flow.
4. Click on a card:
   - Map centers and opens a popup with:
     - **Image** or mascot placeholder.
     - **AI section**: predicted category, **confidence bar with correct width** (uses `normalizeConfidencePct`).
     - Confirmed category badge.
     - Resident name + email.
     - Address, time-ago (`timeAgo` helper).

#### 4.2.2. Accepting & Completing a Task

1. On a **Pending** card, click **Claim Request**:
   - A toast-confirmation appears (no `window.confirm`).
   - After accepting:
     - `collection_status` becomes `scheduled`.
     - `collector_id` is set to this collector.
     - A **notification is sent to the resident**.
2. Now the card appears as **Scheduled (My Pickups)**:
   - Buttons: **Mark Collected** and **Report**.
3. Mark Collected:
   - A **prompt toast** asks for an optional note.
   - On confirm:
     - Backend ensures only the assigned collector can complete it.
     - Sets `collection_status='collected'`, `collected_at=NOW()`, and saves `collector_notes`.
     - Sends a “collected” notification to the resident.
4. Collector History:
   - Open `collector-history.html`.
   - Show that completed tasks appear here with relevant details.

#### 4.2.3. Route Optimization

1. Make sure the collector has **≥2 scheduled tasks**.
2. In `collector-submissions.html`:
   - Click **Optimize My Route**.
   - Pins are numbered **1, 2, 3…** using a greedy nearest-neighbor algorithm.
   - A dashed polyline shows the route.
   - Sidebar cards show route order and incremental distances.
3. Click **Get Directions**:
   - Opens **Google Maps** with destination coordinates.

> **Panel cue**: Emphasize that the optimizer uses a simple but explainable **Haversine-based nearest-neighbor** algorithm – good for criterion 2.3 and 3.1 (expandability).

---

### 4.3. Admin Flow (Criterion 1.1, 1.2, 1.3, 1.4, 2.1, 3.1, 3.3)

1. Log out as collector. Log in with:
   - **Admin**: `admin@wastesense.ph` / `admin123`.
2. Confirm redirect to `dashboard-admin.html`.

#### 4.3.1. Dashboard Overview

Show:
- Total users, total submissions, pending, collected (via analytics endpoints).
- **Uncovered barangay warning**:
  - If there are barangays with pending submissions but **no assigned collectors**, a banner appears listing those barangays.
  - When all have collectors, the banner disappears.

#### 4.3.2. Password / Access Requests

From the admin dashboard (or dedicated section):

- **Request types** in `password_reset_requests.request_type`:
  - `forgot_password` → 🔑 Password Reset
  - `become_collector` → 🚛 Become a Collector
  - `request_admin_access` → 🛡️ Request Admin Access
  - `reactivate_account` → 🔓 Reactivate Account
  - `update_email` → 📧 Change Email
  - `report_issue` → 🐛 Report Technical Issue

For each:
- Show **cards** with appropriate icon & label.
- Use at least one example:
  1. As a normal user, open **login → Need help with your account?** (the account request modal).
  2. Submit a **“Become Collector”** or **“Change Password”** request.
  3. Back on the admin dashboard:
     - See the request card.
     - Click **Accept**:
       - A **context-aware dialog** appears (`showConfirmDialog`), not `window.confirm`.
       - E.g., admin access requires typing `CONFIRM` before enabling the button.
     - On accept:
       - `status` set to `accepted/completed` as appropriate.
       - For change_password: user’s `force_password_change=1` (but the password itself is not auto-changed).
       - For become_collector: collector’s `is_active=1`, they can now log in.

Then demonstrate forced password change:
- Log in as that user:
  - Backend sees `force_password_change=1` and responds with limited scope.
  - Frontend switches to the **inline password-change panel** on `login.html`.
  - New password must be **≥8 characters**.
  - On success:
    - `force_password_change` is reset to 0.
    - A normal JWT/session is established.
    - User is redirected to their dashboard.

#### 4.3.3. User Management & Assignments

Go to `admin-users.html`:

- Show:
  - List of all users.
  - Collectors **without barangay** labeled with a ⚠ “No barangay assigned” badge.
- Edit a collector:
  - Use the side **panel drawer**.
  - Set their `barangay` and toggle `Active/Inactive`.
  - Save changes; show that the local list updates.
- Explain:
  - Backend checks `admin` role on all `/api/users/*` endpoints.
  - `assign-barangay` verifies target is a collector and barangay is active.

#### 4.3.4. Locations, Categories, Schedules

Visit:
- `admin-locations.html` – Create, enable/disable barangays.
- `admin-categories.html` – Manage waste categories (these feed into resident submit wizard).
- `admin-schedules.html` – Assign collection days/times per barangay & category.

Show that:
- New locations appear in **registration barangay dropdown**.
- New categories appear in the **submit wizard category list**.
- Schedules for a barangay are shown in the **resident dashboard** for residents assigned there.

#### 4.3.5. Admin Analytics, Feedback, Performance

- `admin-analytics.html` – Charts using real data (submissions by status, category, time).
- `admin-feedback.html` – List of resident feedback (including the test feedback you sent).
- `admin-performance.html` – Performance summaries based on `performance_tracking` data.

> **Panel cue**: Emphasize that analytics use the same DB, **no duplicated state**, and admin pages are **server-side protected** & role-guarded (criterion 1.4 and 1.3).

---

## 5. Security & Robustness Talking Points

Use these when examiners ask “What about security?” or “What if X goes wrong?”:

- **Authentication & Roles**
  - Backend middleware `requireAuth` checks sessions or JWT.
  - Role helpers (`requireAdmin`, `requireCollector`, `requireResident`) ensure only the right users hit admin/collector/resident-only endpoints.
  - Frontend pages call `checkAuthStatus()` and redirect to login when unauthenticated.
- **Data Ownership**
  - Collectors can only accept/complete/report problems for:
    - Submissions in **their barangay**, and
    - Submissions where they are the assigned `collector_id`.
  - Residents can only see and manage **their own** submissions.
- **Password Safety**
  - Passwords are stored hashed using **bcrypt** (`$2b$` hashes).
  - Forced password change uses a limited-scope session token and enforces minimum length.
- **Rate Limiting**
  - Login endpoint has a simple IP-based rate limiter to prevent brute force.
- **Error Handling**
  - Controllers wrap logic in `try/catch` and return clean JSON error messages.
  - Frontend `apiFetch` centralizes error handling and user feedback via toasts.

---

## 6. Checklist Against the Evaluation Matrix

You can literally read this to the panel while clicking through:

- **1.1 Functionality** –  
  “All required features are implemented for Residents (register, login, submit waste with AI, track submissions, notifications, feedback, profile), Collectors (dashboard stats, map, route optimization, accept/complete/report), and Admins (dashboards, user/role management, locations, categories, schedules, analytics, feedback, performance, password/access requests).”

- **1.2 & 1.3 Accurate I/O & Module Connectivity** –  
  “Every page uses real API endpoints; all fields match the database schema (e.g., `collection_status`, `confidence_score`, `barangay_id`). Frontend uses a shared `apiFetch` and `normalizeConfidencePct` helper so data types and units are consistent.”

- **1.4 Security** –  
  “We protect all `/api` routes with `requireAuth`, then layer role checks on top. Frontend pages re-check authentication and role before rendering. Passwords are bcrypt-hashed, secrets live in `.env`, and we have a login rate limiter and forced-password-change flow.”

- **2.1 Error-Free** –  
  “The server starts without runtime errors; core controllers use `try/catch` and log internally. Fetch failures show clear toasts rather than crashing. We removed blocking `alert()`/`confirm()` and replaced them with custom dialogs and toasts.”

- **2.2 Usability** –  
  “Each role has a dedicated navigation with friendly, icon-based cards, skeleton loaders while data loads, clear empty states (with mascots), and mobile responsiveness. Users can reach all relevant pages from the sidebar/bottom-nav—no manual URL typing required.”

- **2.3 Resource Efficiency** –  
  “The TensorFlow MobileNet model is loaded once at server startup to avoid a first-request spike. Database access uses pooled connections and avoids N+1 query patterns in the main flows. Image uploads are capped at 5MB with user-friendly errors.”

- **3.1 & 3.2 Maintainability & Portability** –  
  “Configuration is centralized in `.env` and `.env.example`. Frontend uses relative `/api/...` URLs, so hosting behind a reverse proxy or different port does not require code changes. The code is modular—separate controllers, routes, models, and utilities—and the image recognition logic is isolated in `backend/utils/imageRecognition.js`.”

- **3.3 GUI** –  
  “We use a consistent green-based design system, with strong contrast, consistent badges for statuses, responsive cards/tables, and mascot illustrations to guide the user. There are no blend effects hiding content, and inputs have clear focus and error states.”

- **Documentation** –  
  “The README and this `GUIDE.md` together explain what the system is, who the 3 roles are, how to install, how to run the demo, and how the database/entities map to the flows. This aligns with the documentation part of the rubric (content, methods, and technical background).”

---

## 7. Final Regression Flow (One Last Rehearsal)

Before an actual defense, run this sequence quickly:

1. **Resident**
   - Register a new resident.
   - Log in → land on resident dashboard with barangay & schedule.
   - Submit one new waste request via wizard.
   - Confirm it appears in **My Submissions** as `Pending`.
2. **Collector**
   - Log in as collector for the same barangay.
   - Confirm stats and pending list reflect the new request.
   - Accept the request; show it flips to `Scheduled`.
   - Mark it as collected with a small note.
   - Confirm it appears in **Collector History**.
3. **Admin**
   - Log in as admin.
   - Show dashboards, warnings (uncovered barangays if any), and at least:
     - a user edit (assigning a barangay),
     - a schedule or location update,
     - a feedback entry in admin feedback,
     - a password/access request being accepted.

If all of that works smoothly, the system is **ready to pass the evaluation matrix**.  

