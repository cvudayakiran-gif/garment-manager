-- Add status column to items table
ALTER TABLE items ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- Create index for status
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
