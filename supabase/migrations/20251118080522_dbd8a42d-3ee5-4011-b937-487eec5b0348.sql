-- Add threshold fields to monitoring_sensors table
ALTER TABLE monitoring_sensors
ADD COLUMN IF NOT EXISTS threshold_min numeric,
ADD COLUMN IF NOT EXISTS threshold_max numeric,
ADD COLUMN IF NOT EXISTS alert_enabled boolean DEFAULT false;

-- Add index for sensors with alerts enabled
CREATE INDEX IF NOT EXISTS idx_sensors_alert_enabled ON monitoring_sensors(alert_enabled) WHERE alert_enabled = true;