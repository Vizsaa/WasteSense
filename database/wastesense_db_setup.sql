-- ============================================================================
-- WasteSense Database Setup
-- ============================================================================
-- File:        wastesense_db_setup.sql
-- Database:    wastesense_db
-- Engine:      InnoDB / MariaDB 10.4+ or MySQL 8.0+
-- Charset:     utf8mb4
--
-- This is the SINGLE source-of-truth database file for WasteSense.
-- It creates all tables, indexes, foreign keys, and inserts seed data.
--
-- Setup Methods:
--   Method A (Automated): node database/setup.js
--   Method B (Manual):    Import this file in phpMyAdmin or MySQL Workbench
--
-- WARNING: This will DROP and recreate the wastesense_db database.
--          All existing data will be lost.
--
-- Default Admin Credentials:
--   Email:    admin@wastesense.ph
--   Password: admin123
-- ============================================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
SET NAMES utf8mb4;

-- ============================================================================
-- 1. CREATE DATABASE
-- ============================================================================
DROP DATABASE IF EXISTS wastesense_db;
CREATE DATABASE wastesense_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE wastesense_db;

-- ============================================================================
-- 2. TABLE: locations
--    Stores geographic areas (barangays, zones, streets).
--    Referenced by users.barangay_id and schedules.location_id.
-- ============================================================================
CREATE TABLE locations (
    location_id   INT AUTO_INCREMENT PRIMARY KEY,
    barangay_name VARCHAR(100) NOT NULL,
    municipality  VARCHAR(100) NOT NULL,
    province      VARCHAR(100) NOT NULL,
    zone_or_street VARCHAR(100) DEFAULT NULL,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_barangay    (barangay_name),
    INDEX idx_municipality (municipality)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================================
-- 3. TABLE: users
--    Stores all user accounts (residents, collectors, admins).
-- ============================================================================
CREATE TABLE users (
    user_id         INT AUTO_INCREMENT PRIMARY KEY,
    email           VARCHAR(255) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(255) NOT NULL,
    role            ENUM('resident','collector','admin') NOT NULL,
    phone_number    VARCHAR(20)  DEFAULT NULL,
    address         TEXT         DEFAULT NULL,
    barangay_id     INT          DEFAULT NULL,
    profile_picture VARCHAR(255) DEFAULT NULL,
    is_active       TINYINT(1)   NOT NULL DEFAULT 1,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_email   (email),
    INDEX idx_email        (email),
    INDEX idx_role         (role),
    INDEX idx_barangay     (barangay_id),

    CONSTRAINT fk_user_barangay
        FOREIGN KEY (barangay_id) REFERENCES locations(location_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================================
-- 4. TABLE: schedules
--    Stores garbage collection schedules by area and day of week.
-- ============================================================================
CREATE TABLE schedules (
    schedule_id    INT AUTO_INCREMENT PRIMARY KEY,
    location_id    INT NOT NULL,
    collection_day ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
    collection_time TIME NOT NULL,
    waste_type     ENUM('biodegradable','non-biodegradable','recyclable','mixed') NOT NULL DEFAULT 'mixed',
    is_active      TINYINT(1) NOT NULL DEFAULT 1,
    created_by     INT NOT NULL,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_location (location_id),
    INDEX idx_day      (collection_day),
    INDEX idx_active   (is_active),

    CONSTRAINT fk_schedule_location
        FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE CASCADE,
    CONSTRAINT fk_schedule_creator
        FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================================
-- 5. TABLE: waste_submissions
--    Stores resident waste upload / classification records.
-- ============================================================================
CREATE TABLE waste_submissions (
    submission_id      INT AUTO_INCREMENT PRIMARY KEY,
    user_id            INT NOT NULL,
    collector_id       INT          DEFAULT NULL,
    image_path         VARCHAR(500) DEFAULT NULL,
    predicted_category VARCHAR(50)  DEFAULT NULL,
    confidence_score   DECIMAL(5,2) DEFAULT NULL,
    confirmed_category ENUM('biodegradable','non-biodegradable','recyclable','special','hazardous','mixed') DEFAULT NULL,
    waste_types        JSON         DEFAULT NULL,
    waste_adjective    VARCHAR(50)  DEFAULT NULL,
    waste_adjectives   JSON         DEFAULT NULL,
    waste_description  TEXT         DEFAULT NULL,
    latitude           DECIMAL(10,8) DEFAULT NULL,
    longitude          DECIMAL(11,8) DEFAULT NULL,
    address_description TEXT        DEFAULT NULL,
    barangay_id        INT          DEFAULT NULL,
    collection_status  ENUM('pending','scheduled','collected') NOT NULL DEFAULT 'pending',
    scheduled_date     DATE         DEFAULT NULL,
    created_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    collected_at       TIMESTAMP    NULL DEFAULT NULL,

    INDEX idx_user           (user_id),
    INDEX idx_collector      (collector_id),
    INDEX idx_status         (collection_status),
    INDEX idx_scheduled_date (scheduled_date),
    INDEX idx_barangay       (barangay_id),

    CONSTRAINT fk_submission_user
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_submission_collector
        FOREIGN KEY (collector_id) REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT fk_submission_barangay
        FOREIGN KEY (barangay_id) REFERENCES locations(location_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================================
-- 6. TABLE: notifications
--    Stores notification messages sent to users.
-- ============================================================================
CREATE TABLE notifications (
    notification_id   INT AUTO_INCREMENT PRIMARY KEY,
    user_id           INT NOT NULL,
    schedule_id       INT DEFAULT NULL,
    notification_type ENUM('reminder','schedule_change','system') NOT NULL,
    message           TEXT NOT NULL,
    is_read           TINYINT(1) NOT NULL DEFAULT 0,
    sent_at           TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user (user_id),
    INDEX idx_read (is_read),
    INDEX idx_type (notification_type),

    CONSTRAINT fk_notification_user
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_notification_schedule
        FOREIGN KEY (schedule_id) REFERENCES schedules(schedule_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================================
-- 7. TABLE: performance_tracking
--    Stores collection performance metrics per schedule.
-- ============================================================================
CREATE TABLE performance_tracking (
    tracking_id  INT AUTO_INCREMENT PRIMARY KEY,
    schedule_id  INT NOT NULL,
    collector_id INT DEFAULT NULL,
    planned_date DATE NOT NULL,
    actual_date  DATE DEFAULT NULL,
    status       ENUM('completed','missed','delayed') NOT NULL DEFAULT 'missed',
    notes        TEXT DEFAULT NULL,
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_schedule     (schedule_id),
    INDEX idx_collector    (collector_id),
    INDEX idx_status       (status),
    INDEX idx_planned_date (planned_date),

    CONSTRAINT fk_tracking_schedule
        FOREIGN KEY (schedule_id) REFERENCES schedules(schedule_id) ON DELETE CASCADE,
    CONSTRAINT fk_tracking_collector
        FOREIGN KEY (collector_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================================
-- 8. SEED DATA: Locations
-- ============================================================================
INSERT INTO locations (barangay_name, municipality, province, zone_or_street) VALUES
    ('Barangay Poblacion',   'Sample Municipality', 'Sample Province', 'Zone 1'),
    ('Barangay San Jose',    'Sample Municipality', 'Sample Province', 'Zone 2'),
    ('Barangay Santa Maria', 'Sample Municipality', 'Sample Province', 'Zone 3');

-- ============================================================================
-- 9. SEED DATA: Admin User
--    Email:    admin@wastesense.ph
--    Password: admin123  (bcrypt, 10 salt rounds)
-- ============================================================================
INSERT INTO users (email, password_hash, full_name, role, phone_number, address, barangay_id) VALUES
    ('admin@wastesense.ph',
     '$2b$10$3l6Xmd0p2UmBCG6CPwY3fuAi0mxHkrR3AKtYDZgr.2z07EGMkvwH6',
     'System Administrator',
     'admin',
     '09123456789',
     'Admin Office',
     NULL);

-- ============================================================================
-- 10. SEED DATA: Collection Schedules
--     Barangay Poblacion (location_id=1): Mon/Wed/Fri 08:00
--     Barangay San Jose  (location_id=2): Tue/Thu 09:00
--     Barangay Santa Maria (location_id=3): Mon/Thu 10:00
-- ============================================================================
INSERT INTO schedules (location_id, collection_day, collection_time, waste_type, created_by) VALUES
    (1, 'Monday',    '08:00:00', 'biodegradable',     1),
    (1, 'Wednesday', '08:00:00', 'non-biodegradable', 1),
    (1, 'Friday',    '08:00:00', 'recyclable',        1),
    (2, 'Tuesday',   '09:00:00', 'biodegradable',     1),
    (2, 'Thursday',  '09:00:00', 'non-biodegradable', 1),
    (3, 'Monday',    '10:00:00', 'mixed',             1),
    (3, 'Thursday',  '10:00:00', 'mixed',             1);

-- ============================================================================
-- DONE. The database is ready.
-- Start the server: node backend/server.js
-- ============================================================================
