-- Update waste_submissions to support multiple waste adjectives (tags)
-- Run this in phpMyAdmin

USE wastesense_db;

-- Add waste_adjectives column to store multiple adjectives as JSON
ALTER TABLE waste_submissions 
ADD COLUMN IF NOT EXISTS waste_adjectives JSON AFTER waste_adjective;

-- Update existing records to migrate waste_adjective to waste_adjectives
UPDATE waste_submissions 
SET waste_adjectives = JSON_ARRAY(waste_adjective) 
WHERE waste_adjective IS NOT NULL AND (waste_adjectives IS NULL OR waste_adjectives = '[]');

-- Keep waste_adjective for backward compatibility
-- waste_adjectives will be the primary field going forward
