-- Update waste_submissions table to include additional fields
-- Run this in phpMyAdmin if the table already exists

USE wastesense_db;

-- Add new columns if they don't exist
ALTER TABLE waste_submissions 
ADD COLUMN IF NOT EXISTS waste_adjective VARCHAR(50) AFTER confirmed_category,
ADD COLUMN IF NOT EXISTS barangay_id INT AFTER address_description,
ADD COLUMN IF NOT EXISTS waste_description TEXT AFTER waste_adjective,
ADD COLUMN IF NOT EXISTS collector_id INT NULL AFTER user_id;

-- Add foreign key for barangay if it doesn't exist
-- Note: This might fail if foreign key already exists, that's okay
ALTER TABLE waste_submissions 
ADD CONSTRAINT fk_waste_submission_barangay 
FOREIGN KEY (barangay_id) REFERENCES locations(location_id) ON DELETE SET NULL;

-- Add foreign key for collector if it doesn't exist
ALTER TABLE waste_submissions 
ADD CONSTRAINT fk_waste_submission_collector 
FOREIGN KEY (collector_id) REFERENCES users(user_id) ON DELETE SET NULL;

-- Update confirmed_category to allow more values
ALTER TABLE waste_submissions 
MODIFY COLUMN confirmed_category ENUM('biodegradable', 'non-biodegradable', 'recyclable', 'special', 'hazardous', 'mixed') DEFAULT NULL;
