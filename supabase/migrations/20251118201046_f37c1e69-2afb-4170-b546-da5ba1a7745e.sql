-- Add new fields to market_listings table for expanded functionality
ALTER TABLE market_listings 
  ADD COLUMN IF NOT EXISTS listing_type TEXT DEFAULT 'supply' CHECK (listing_type IN ('supply', 'demand', 'operator')),
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'crops' CHECK (category IN ('crops', 'equipment', 'transport', 'facilities')),
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS contact_info JSONB;

-- Migrate existing data to new structure
UPDATE market_listings 
SET 
  title = COALESCE(crop, 'Без названия'),
  listing_type = 'supply',
  category = 'crops',
  description = additional_info
WHERE title IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_market_listings_category ON market_listings(category);
CREATE INDEX IF NOT EXISTS idx_market_listings_listing_type ON market_listings(listing_type);