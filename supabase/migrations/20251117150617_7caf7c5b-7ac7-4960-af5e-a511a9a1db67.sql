-- Create market_listings table for exchange module
CREATE TABLE public.market_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  crop TEXT NOT NULL,
  quality TEXT,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL DEFAULT 'т',
  price NUMERIC NOT NULL,
  location TEXT,
  harvest_year INTEGER,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'closed')),
  views INTEGER NOT NULL DEFAULT 0,
  inquiries INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.market_listings ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view active listings
CREATE POLICY "Users can view active listings"
ON public.market_listings
FOR SELECT
TO authenticated
USING (status = 'active' OR user_id = auth.uid());

-- Policy: Users can insert their own listings
CREATE POLICY "Users can create their own listings"
ON public.market_listings
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() AND company_id = get_user_company_id(auth.uid()));

-- Policy: Users can update their own listings
CREATE POLICY "Users can update their own listings"
ON public.market_listings
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy: Users can delete their own listings
CREATE POLICY "Users can delete their own listings"
ON public.market_listings
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_market_listings_updated_at
BEFORE UPDATE ON public.market_listings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better query performance
CREATE INDEX idx_market_listings_status ON public.market_listings(status);
CREATE INDEX idx_market_listings_company_id ON public.market_listings(company_id);
CREATE INDEX idx_market_listings_user_id ON public.market_listings(user_id);