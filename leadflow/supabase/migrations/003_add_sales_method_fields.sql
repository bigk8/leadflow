-- שיטת המכירה: מצב אתר, תחום, מה נשלח, קישור דמו
-- הוחל על הפרויקט המרוחק ב-2026-08-19 (apply_migration: add_sales_method_fields)

alter table public.leads
  add column if not exists website_status text check (website_status in ('none','old','has')) default null,
  add column if not exists industry text default null,
  add column if not exists sent_asset text check (sent_asset in ('site_a','site_b','demo')) default null,
  add column if not exists demo_url text default null;

comment on column public.leads.website_status is 'מצב האתר של הליד: none=אין אתר, old=אתר ישן, has=יש אתר';
comment on column public.leads.industry is 'תחום העסק (רופא, עו"ד, אינסטלטור...)';
comment on column public.leads.sent_asset is 'מה נשלח לליד: site_a, site_b, demo';
comment on column public.leads.demo_url is 'קישור לדמו האישי שנבנה לליד';
