-- Run once in Supabase SQL Editor BEFORE using the new pop-ups
alter table public.orders add column if not exists budget text;
alter table public.orders add column if not exists order_type text default 'service';
