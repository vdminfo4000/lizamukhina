-- Add additional_info field to market_listings
ALTER TABLE public.market_listings 
ADD COLUMN additional_info text;

-- Create monitoring_zones table
CREATE TABLE public.monitoring_zones (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  plot_id uuid REFERENCES public.plots(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for monitoring_zones
ALTER TABLE public.monitoring_zones ENABLE ROW LEVEL SECURITY;

-- RLS policies for monitoring_zones
CREATE POLICY "Users can view zones in their company"
ON public.monitoring_zones
FOR SELECT
USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert zones in their company"
ON public.monitoring_zones
FOR INSERT
WITH CHECK (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can update zones in their company"
ON public.monitoring_zones
FOR UPDATE
USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete zones in their company"
ON public.monitoring_zones
FOR DELETE
USING (company_id = get_user_company_id(auth.uid()));

-- Create monitoring_sensors table
CREATE TABLE public.monitoring_sensors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id uuid NOT NULL REFERENCES public.monitoring_zones(id) ON DELETE CASCADE,
  name text NOT NULL,
  sensor_type text NOT NULL,
  serial_number text,
  status text DEFAULT 'active'::text,
  last_reading jsonb,
  battery_level integer,
  calibration_date timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for monitoring_sensors
ALTER TABLE public.monitoring_sensors ENABLE ROW LEVEL SECURITY;

-- RLS policies for monitoring_sensors
CREATE POLICY "Users can view sensors in their company zones"
ON public.monitoring_sensors
FOR SELECT
USING (zone_id IN (
  SELECT id FROM public.monitoring_zones 
  WHERE company_id = get_user_company_id(auth.uid())
));

CREATE POLICY "Users can insert sensors in their company zones"
ON public.monitoring_sensors
FOR INSERT
WITH CHECK (zone_id IN (
  SELECT id FROM public.monitoring_zones 
  WHERE company_id = get_user_company_id(auth.uid())
));

CREATE POLICY "Users can update sensors in their company zones"
ON public.monitoring_sensors
FOR UPDATE
USING (zone_id IN (
  SELECT id FROM public.monitoring_zones 
  WHERE company_id = get_user_company_id(auth.uid())
));

CREATE POLICY "Users can delete sensors in their company zones"
ON public.monitoring_sensors
FOR DELETE
USING (zone_id IN (
  SELECT id FROM public.monitoring_zones 
  WHERE company_id = get_user_company_id(auth.uid())
));

-- Add triggers for updated_at
CREATE TRIGGER update_monitoring_zones_updated_at
BEFORE UPDATE ON public.monitoring_zones
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_monitoring_sensors_updated_at
BEFORE UPDATE ON public.monitoring_sensors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();