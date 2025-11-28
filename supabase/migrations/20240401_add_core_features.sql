-- Add is_favorite and notes columns to business_cards table

ALTER TABLE business_cards 
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update RLS policies if necessary (usually not needed for new columns if "all" is allowed, but good to check)
-- Assuming existing policies cover "update" for authenticated users.
