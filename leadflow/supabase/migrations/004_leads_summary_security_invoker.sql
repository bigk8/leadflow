-- leads_summary ran with its creator's permissions and bypassed leads RLS.
-- security_invoker makes the view apply the querying user's RLS policies.
alter view public.leads_summary set (security_invoker = true);
