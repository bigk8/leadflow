-- Add is_irrelevant column to leads table
alter table public.leads
add column is_irrelevant boolean not null default false;

-- Create index for efficient filtering
create index idx_leads_is_irrelevant on public.leads(user_id, is_irrelevant) where is_irrelevant = true;
