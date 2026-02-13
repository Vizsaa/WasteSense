-- Verify Admin User Setup
-- Run this in phpMyAdmin to check if admin user exists and view details

USE wastesense_db;

-- Check if admin user exists
SELECT 
    user_id,
    email,
    full_name,
    role,
    is_active,
    created_at
FROM users 
WHERE email = 'admin@wastesense.ph';

-- View all users (to see what's in the database)
SELECT 
    user_id,
    email,
    full_name,
    role,
    is_active
FROM users;

-- Check password hash length (should be 60 characters for bcrypt)
SELECT 
    email,
    LENGTH(password_hash) as hash_length,
    LEFT(password_hash, 7) as hash_prefix
FROM users 
WHERE email = 'admin@wastesense.ph';
