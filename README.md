# WasteSense - Smart Waste Collection System

A web-based smart waste collection and monitoring system designed for Philippine communities. Features AI-powered waste image recognition, geocoded collection locations, role-based dashboards, and a complete schedule management system.

## Quick Start

```bash
npm install
Copy-Item .env.example .env      # create .env from template
node database/setup.js            # create database + seed data
npm run dev                       # start server on http://localhost:3000
```

**Default admin login:** `admin@wastesense.ph` / `admin123`

---

## Full Setup Guide

### Prerequisites

1. **Node.js** (LTS) - [nodejs.org](https://nodejs.org/)
2. **XAMPP** (for MySQL) - [apachefriends.org](https://www.apachefriends.org/)
   - Start **MySQL** from the XAMPP Control Panel

### Step 1: Install dependencies

```bash
npm install
```

### Step 2: Configure environment

Copy the example environment file and edit if needed:

```bash
Copy-Item .env.example .env
```

Default `.env` values work for standard XAMPP setups. Only change if:
- Your MySQL has a password: set `DB_PASSWORD`
- Port 3000 is in use: change `PORT`

### Step 3: Set up the database

There is **one SQL file** for the entire database: `database/wastesense_db_setup.sql`

**Method A - Automated (recommended):**

```bash
node database/setup.js
```

This creates the database, all 6 tables, and inserts seed data (admin user, locations, schedules).

**Method B - Manual (phpMyAdmin / MySQL Workbench):**

1. Open `http://localhost/phpmyadmin`
2. Click the **SQL** tab (or **Import** tab)
3. Open and run the file: `database/wastesense_db_setup.sql`
4. Verify 6 tables are created: `locations`, `users`, `schedules`, `waste_submissions`, `notifications`, `performance_tracking`

### Step 4: Start the server

```bash
npm run dev
```

Expected output:
```
Server running on http://localhost:3000
Database connection established
```

### Step 5: Verify

1. Open `http://localhost:3000` in your browser
2. Log in as admin: `admin@wastesense.ph` / `admin123`
3. Register a resident account and test the waste submission flow

---

## Project Structure

```
WasteSense/
├── backend/
│   ├── config/
│   │   └── db.config.js            # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js       # Registration, login, logout
│   │   ├── wasteController.js      # Waste submission CRUD
│   │   ├── scheduleController.js   # Schedule management
│   │   ├── userController.js       # User/profile management
│   │   ├── locationController.js   # Barangay/location CRUD
│   │   ├── notificationController.js
│   │   └── performanceController.js
│   ├── middleware/
│   │   ├── auth.js                 # requireAuth, requireAdmin, requireCollector
│   │   └── upload.js               # Multer config (5MB, image types only)
│   ├── models/
│   │   ├── User.js                 # User model with bcrypt hashing
│   │   ├── WasteSubmission.js      # Waste submission model
│   │   ├── Schedule.js             # Schedule model
│   │   ├── Location.js             # Location model
│   │   ├── Notification.js         # Notification model
│   │   └── PerformanceTracking.js  # Performance model
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── wasteRoutes.js
│   │   ├── scheduleRoutes.js
│   │   ├── userRoutes.js
│   │   ├── locationRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── performanceRoutes.js
│   ├── utils/
│   │   └── imageRecognition.js     # Server-side waste categorization
│   └── server.js                   # Express app entry point
├── frontend/
│   ├── css/
│   │   └── style.css               # Global stylesheet
│   ├── js/
│   │   ├── auth.js                 # Auth utilities (checkAuthStatus, logout, redirectByRole)
│   │   └── wasteSubmission.js      # Image upload, TF.js AI, geocoding, compression
│   ├── pages/
│   │   ├── login.html
│   │   ├── register.html
│   │   ├── dashboard-resident.html
│   │   ├── dashboard-admin.html
│   │   ├── dashboard-collector.html
│   │   ├── submit-waste.html       # Waste submission with AI image recognition
│   │   ├── my-submissions.html     # Submission history with status filters
│   │   ├── collector-submissions.html
│   │   ├── profile.html
│   │   ├── admin-users.html
│   │   ├── admin-schedules.html
│   │   ├── admin-locations.html
│   │   ├── admin-analytics.html
│   │   └── admin-performance.html
│   └── index.html                  # Redirects to login
├── database/
│   ├── wastesense_db_setup.sql     # Single source-of-truth SQL file
│   └── setup.js                    # Automated DB setup script
├── uploads/                        # Uploaded waste images (gitignored)
├── .env.example                    # Environment variable template
├── package.json
└── README.md
```

## Features

### Authentication & User Management
- Role-based access control: **Resident**, **Collector**, **Admin**
- Secure password hashing (bcrypt, 10 rounds)
- Session management (httpOnly cookies, 24h expiry)
- Login rate limiting
- Profile management with avatar upload

### Waste Submission (Resident)
- Image upload with drag-and-drop (max 5MB)
- Client-side image compression (canvas resize to JPEG)
- AI-powered waste recognition using TensorFlow.js + MobileNet
- Color-coded confidence scores (green/yellow/red)
- User confirms or overrides AI suggestion before submission
- Waste type and adjective multi-select checkboxes
- Text address input with geocoding (OpenStreetMap Nominatim)
- GPS "Use Current Location" button with Leaflet map
- Upload progress overlay with staged feedback
- Submissions stored with "Pending" status

### Submission History (Resident)
- Card-based view of past submissions
- Status filter buttons (All / Pending / Scheduled / Collected)
- Shows image, waste types, confidence score, location, date
- Cancel pending submissions

### Collector Dashboard
- View pending and assigned waste submissions
- Filter by waste type, adjective, barangay
- Accept submissions and mark as collected

### Admin Dashboard
- System overview with key metrics
- Manage users (roles, active status)
- Manage collection schedules (CRUD by location/day/time/waste type)
- Manage barangay locations
- Analytics: submission counts, waste category breakdown
- Performance tracking: completed/missed/delayed collection runs

### Schedule Management
- Schedules per barangay with day, time, and waste type
- Residents see schedules filtered by their barangay
- Admin creates/edits/deletes schedules

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, JavaScript (ES6+) |
| Backend | Node.js, Express.js |
| Database | MySQL 8.0+ / MariaDB 10.4+ (via XAMPP) |
| Auth | express-session, bcrypt |
| File Upload | Multer (image validation, 5MB limit) |
| AI/ML | TensorFlow.js, MobileNet (client-side) |
| Maps | Leaflet.js, OpenStreetMap |
| Geocoding | Nominatim API (free, no key required) |

## API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user (role forced to resident) |
| POST | `/login` | Login with email/password |
| POST | `/logout` | Destroy session |
| GET | `/me` | Get current authenticated user |

### Waste Submissions (`/api/waste`) - requires auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/submit` | Submit waste with image (multipart) |
| POST | `/analyze` | Analyze image server-side |
| GET | `/my-submissions` | Get current user's submissions |
| GET | `/pending` | Get pending submissions (collector) |
| GET | `/assigned` | Get collector's assigned submissions |
| GET | `/:id` | Get submission by ID |
| PUT | `/:id` | Update submission |
| POST | `/:id/accept` | Collector accepts submission |
| POST | `/:id/complete` | Mark submission as collected |
| DELETE | `/:id` | Delete/cancel submission |

### Schedules (`/api/schedules`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/upcoming` | Get schedules for current user's barangay |
| GET | `/` | Get all schedules |
| GET | `/by-location/:id` | Get schedules for a location |
| POST | `/` | Create schedule (admin) |
| PUT | `/:id` | Update schedule (admin) |
| DELETE | `/:id` | Delete schedule (admin) |

### Locations (`/api/locations`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all locations |
| GET | `/:id` | Get location by ID |
| POST | `/` | Create location (admin) |
| PUT | `/:id` | Update location (admin) |
| DELETE | `/:id` | Delete location (admin) |

### Users (`/api/users`) - requires auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile` | Get current user profile |
| PUT | `/update-profile` | Update profile |
| PUT | `/update-profile-picture` | Update avatar |
| GET | `/` | List all users (admin) |
| PUT | `/:id` | Update user role/status (admin) |

### Notifications (`/api/notifications`) - requires auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get current user's notifications |
| POST | `/:id/read` | Mark notification as read |

### Performance (`/api/performance`) - admin only
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Log a performance entry |
| GET | `/summary` | Get performance summary |

### System
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/test-db` | Database connection test |

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@wastesense.ph` | `admin123` |

Register additional resident and collector accounts through the registration page or admin user management.

## Database Schema

6 tables with full foreign key relationships:

- **locations** - Barangays/geographic areas
- **users** - All user accounts (resident, collector, admin)
- **schedules** - Collection schedules by location/day/time
- **waste_submissions** - Waste upload records with AI predictions, coordinates, status
- **notifications** - User notification messages
- **performance_tracking** - Collection performance metrics

See `database/wastesense_db_setup.sql` for the complete schema.

## License

ISC
