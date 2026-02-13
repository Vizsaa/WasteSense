-- WasteSense Sample Data
-- Insert sample data for testing and development

USE wastesense_db;

-- ============================================
-- SAMPLE LOCATIONS (Barangays)
-- ============================================
INSERT INTO locations (barangay_name, municipality, province, zone_or_street) VALUES
('Barangay Poblacion', 'Sample Municipality', 'Sample Province', 'Zone 1'),
('Barangay San Jose', 'Sample Municipality', 'Sample Province', 'Zone 2'),
('Barangay Santa Maria', 'Sample Municipality', 'Sample Province', 'Zone 3');

-- ============================================
-- SAMPLE ADMIN USER
-- Password: admin123 (hashed with bcrypt)
-- ============================================
-- Note: The password hash below is for "admin123"
-- Generated using bcrypt with 10 salt rounds
-- Password: admin123
INSERT INTO users (email, password_hash, full_name, role, phone_number, address, barangay_id) VALUES
('admin@wastesense.ph', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'System Administrator', 'admin', '09123456789', 'Admin Office', NULL);

-- ============================================
-- SAMPLE COLLECTION SCHEDULES
-- ============================================
-- Get location_id for Barangay Poblacion (assuming it's location_id = 1)
INSERT INTO schedules (location_id, collection_day, collection_time, waste_type, created_by) VALUES
(1, 'Monday', '08:00:00', 'biodegradable', 1),
(1, 'Wednesday', '08:00:00', 'non-biodegradable', 1),
(1, 'Friday', '08:00:00', 'recyclable', 1),
(2, 'Tuesday', '09:00:00', 'biodegradable', 1),
(2, 'Thursday', '09:00:00', 'non-biodegradable', 1),
(3, 'Monday', '10:00:00', 'mixed', 1),
(3, 'Thursday', '10:00:00', 'mixed', 1);

-- ============================================
-- SAMPLE NOTIFICATIONS (Optional)
-- ============================================
-- These can be populated by the notification system later
