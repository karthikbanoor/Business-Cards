-- Add tags column to business_cards table

ALTER TABLE business_cards 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Update RLS policies if necessary (usually not needed for new columns if "all" is allowed)
