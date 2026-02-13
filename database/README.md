# Database Setup Guide

This guide explains how to set up the WasteSense database using XAMPP and phpMyAdmin.

## Prerequisites

- XAMPP installed and running (MySQL service must be active)
- Access to phpMyAdmin at `http://localhost/phpmyadmin`

## Setup Steps

### 1. Access phpMyAdmin

1. Open XAMPP Control Panel
2. Ensure **Apache** and **MySQL** services are running (green)
3. Open your web browser
4. Navigate to: `http://localhost/phpmyadmin`

### 2. Create Database

1. Click **"New"** in the left sidebar
2. Enter database name: `wastesense_db`
3. Choose collation: `utf8mb4_general_ci`
4. Click **"Create"**

### 3. Create Tables

1. Select `wastesense_db` from the left sidebar
2. Click the **"SQL"** tab at the top
3. Open `schema.sql` file from this directory
4. Copy the entire contents
5. Paste into the SQL text area in phpMyAdmin
6. Click **"Go"** to execute
7. Verify all 6 tables are created:
   - `locations`
   - `users`
   - `schedules`
   - `waste_submissions`
   - `notifications`
   - `performance_tracking`

### 4. Insert Sample Data

1. Still in the SQL tab
2. Open `sample_data.sql` file
3. Copy the entire contents
4. Paste into the SQL text area
5. Click **"Go"** to execute
6. Verify data insertion:
   - 3 sample locations (barangays)
   - 1 admin user
   - 7 sample schedules

## Database Structure

### Table Relationships

```
locations (1) ──< (many) users
locations (1) ──< (many) schedules
users (1) ──< (many) waste_submissions
users (1) ──< (many) notifications
schedules (1) ──< (many) notifications
schedules (1) ──< (many) performance_tracking
users (1) ──< (many) performance_tracking (as collector)
```

### Key Tables

- **users**: All system users (residents, collectors, admins)
- **locations**: Geographic areas (barangays, zones)
- **schedules**: Collection schedules by location
- **waste_submissions**: Resident waste uploads
- **notifications**: System notifications
- **performance_tracking**: Collection performance metrics

## Common SQL Queries

### View all users
```sql
SELECT user_id, email, full_name, role, created_at FROM users;
```

### View schedules with location names
```sql
SELECT s.*, l.barangay_name, l.municipality 
FROM schedules s 
JOIN locations l ON s.location_id = l.location_id;
```

### Count users by role
```sql
SELECT role, COUNT(*) as count FROM users GROUP BY role;
```

### View recent waste submissions
```sql
SELECT ws.*, u.full_name, u.email 
FROM waste_submissions ws 
JOIN users u ON ws.user_id = u.user_id 
ORDER BY ws.created_at DESC 
LIMIT 10;
```

## Database Backup & Restore

### Backup Database

1. Select `wastesense_db` in phpMyAdmin
2. Click **"Export"** tab
3. Choose **"Quick"** method
4. Format: **SQL**
5. Click **"Go"** to download backup file

### Restore Database

1. Select `wastesense_db` in phpMyAdmin
2. Click **"Import"** tab
3. Choose your `.sql` backup file
4. Click **"Go"** to restore

## Troubleshooting

### Database Connection Failed

- Check MySQL service is running in XAMPP
- Verify database name is `wastesense_db`
- Check `.env` file has correct credentials:
  - `DB_HOST=localhost`
  - `DB_USER=root`
  - `DB_PASSWORD=` (empty for default XAMPP)
  - `DB_NAME=wastesense_db`

### Foreign Key Errors

- Ensure tables are created in order (locations first, then users, then schedules)
- Check that referenced IDs exist before inserting foreign keys

### Character Encoding Issues

- Ensure database uses `utf8mb4` collation
- Check table collation matches database collation
