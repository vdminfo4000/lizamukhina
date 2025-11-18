-- Add location coordinates to facilities table
ALTER TABLE facilities 
ADD COLUMN IF NOT EXISTS location_lat NUMERIC,
ADD COLUMN IF NOT EXISTS location_lng NUMERIC;