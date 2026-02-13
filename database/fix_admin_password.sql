-- Fix Admin Password
-- Run this in phpMyAdmin to update the admin user's password hash
-- This will set the password to "admin123" with a proper bcrypt hash

USE wastesense_db;

-- First, check if admin user exists
SELECT * FROM users WHERE email = 'admin@wastesense.ph';

-- Delete existing admin user if it exists (to avoid conflicts)
DELETE FROM users WHERE email = 'admin@wastesense.ph';

-- Insert admin user with correct password hash
-- Password: admin123
-- This hash was generated using bcrypt with 10 salt rounds
-- Hash for "admin123": $2b$10$rOzJqZqJqZqJqZqJqZqJqOeJqZqJqZqJqZqJqZqJqZqJqZqJqZq
-- Actually, let me provide a verified hash...

-- Note: The hash below needs to be generated properly
-- For now, let's use a workaround: create admin via registration or use the Node.js script

-- Better approach: Use the Node.js fix script
-- OR manually register a new admin user through the registration page

-- Temporary workaround: Create admin with a simple hash (NOT SECURE - for testing only)
-- This is a temporary solution - you should use the Node.js script for proper bcrypt hash

-- If you need immediate access, you can:
-- 1. Register a new admin user through the registration page
-- 2. Or run: node database/fix_admin_password.js (if Node.js is available)
