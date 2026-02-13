-- WasteSense Complete Database Setup
-- Run this entire file in phpMyAdmin or MySQL Workbench
-- This creates the database, all tables, and inserts sample data

-- ============================================
-- CREATE DATABASE
-- ============================================
CREATE DATABASE IF NOT EXISTS wastesense_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE wastesense_db;

-- ============================================
-- TABLE: locations
-- Stores geographic areas (barangays, zones, streets)
-- ============================================
CREATE TABLE IF NOT EXISTS locations (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    barangay_name VARCHAR(100) NOT NULL,
    municipality VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    zone_or_street VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_barangay (barangay_name),
    INDEX idx_municipality (municipality)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- TABLE: users
-- Stores all user accounts (residents, collectors, admins)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('resident', 'collector', 'admin') NOT NULL,
    phone_number VARCHAR(20),
    address TEXT,
    barangay_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_barangay (barangay_id),
    FOREIGN KEY (barangay_id) REFERENCES locations(location_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- TABLE: schedules
-- Stores garbage collection schedules by area
-- ============================================
CREATE TABLE IF NOT EXISTS schedules (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    location_id INT NOT NULL,
    collection_day ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    collection_time TIME NOT NULL,
    waste_type ENUM('biodegradable', 'non-biodegradable', 'recyclable', 'mixed') NOT NULL DEFAULT 'mixed',
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_location (location_id),
    INDEX idx_day (collection_day),
    INDEX idx_active (is_active),
    FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- TABLE: waste_submissions
-- Stores resident waste upload records
-- ============================================
CREATE TABLE IF NOT EXISTS waste_submissions (
    submission_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    image_path VARCHAR(500),
    predicted_category VARCHAR(50),
    confirmed_category VARCHAR(50),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    address_description TEXT,
    collection_status ENUM('pending', 'scheduled', 'collected') DEFAULT 'pending',
    scheduled_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    collected_at TIMESTAMP NULL,
    INDEX idx_user (user_id),
    INDEX idx_status (collection_status),
    INDEX idx_scheduled_date (scheduled_date),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- TABLE: notifications
-- Stores notification log
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    schedule_id INT,
    notification_type ENUM('reminder', 'schedule_change', 'system') NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_read (is_read),
    INDEX idx_type (notification_type),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_id) REFERENCES schedules(schedule_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- TABLE: performance_tracking
-- Stores collection performance metrics
-- ============================================
CREATE TABLE IF NOT EXISTS performance_tracking (
    tracking_id INT AUTO_INCREMENT PRIMARY KEY,
    schedule_id INT NOT NULL,
    collector_id INT,
    planned_date DATE NOT NULL,
    actual_date DATE,
    status ENUM('completed', 'missed', 'delayed') DEFAULT 'missed',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_schedule (schedule_id),
    INDEX idx_collector (collector_id),
    INDEX idx_status (status),
    INDEX idx_planned_date (planned_date),
    FOREIGN KEY (schedule_id) REFERENCES schedules(schedule_id) ON DELETE CASCADE,
    FOREIGN KEY (collector_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- SAMPLE DATA INSERTION
-- ============================================

-- Insert sample locations
INSERT INTO locations (barangay_name, municipality, province, zone_or_street) VALUES
('Barangay Poblacion', 'Sample Municipality', 'Sample Province', 'Zone 1'),
('Barangay San Jose', 'Sample Municipality', 'Sample Province', 'Zone 2'),
('Barangay Santa Maria', 'Sample Municipality', 'Sample Province', 'Zone 3');

-- Insert admin user
-- Password: admin123 (bcrypt hash)
-- This hash is for "admin123" with 10 salt rounds
INSERT INTO users (email, password_hash, full_name, role, phone_number, address, barangay_id) VALUES
('admin@wastesense.ph', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'System Administrator', 'admin', '09123456789', 'Admin Office', NULL);

-- Insert sample schedules
-- Note: These assume location_id 1, 2, 3 and user_id 1 (admin) exist
INSERT INTO schedules (location_id, collection_day, collection_time, waste_type, created_by) VALUES
(1, 'Monday', '08:00:00', 'biodegradable', 1),
(1, 'Wednesday', '08:00:00', 'non-biodegradable', 1),
(1, 'Friday', '08:00:00', 'recyclable', 1),
(2, 'Tuesday', '09:00:00', 'biodegradable', 1),
(2, 'Thursday', '09:00:00', 'non-biodegradable', 1),
(3, 'Monday', '10:00:00', 'mixed', 1),
(3, 'Thursday', '10:00:00', 'mixed', 1);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify setup:

-- SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'wastesense_db';
-- SELECT * FROM users;
-- SELECT * FROM locations;
-- SELECT * FROM schedules;
