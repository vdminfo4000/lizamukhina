-- Add name column to plots table
ALTER TABLE plots ADD COLUMN name TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN plots.name IS 'Name of the plot for display purposes';