-- Run this in your Supabase SQL editor (Dashboard → SQL Editor)
alter table campaigns
  add column if not exists scrape_days    int default 7,
  add column if not exists min_engagement int default 0,
  add column if not exists max_engagement int;
