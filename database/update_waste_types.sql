-- Update waste_submissions to support multiple waste types (tags)
-- Run this in phpMyAdmin

USE wastesense_db;

-- Add waste_types column to store multiple types as JSON
ALTER TABLE waste_submissions 
ADD COLUMN IF NOT EXISTS waste_types JSON AFTER confirmed_category;

-- Update existing records to migrate confirmed_category to waste_types
UPDATE waste_submissions 
SET waste_types = JSON_ARRAY(confirmed_category) 
WHERE confirmed_category IS NOT NULL AND (waste_types IS NULL OR waste_types = '[]');

-- Keep confirmed_category for backward compatibility but make it nullable
-- waste_types will be the primary field going forward
