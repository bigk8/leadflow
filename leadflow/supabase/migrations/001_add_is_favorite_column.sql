-- Add is_favorite column to leads table for starring/favoriting leads
ALTER TABLE public.leads ADD COLUMN is_favorite boolean NOT NULL DEFAULT false;

-- Create index for efficient filtering of favorite leads
CREATE INDEX idx_leads_is_favorite ON public.leads(user_id, is_favorite) WHERE is_favorite = true;

-- Comment for documentation
COMMENT ON COLUMN public.leads.is_favorite IS 'Whether the lead is marked as favorite/starred by the user';
