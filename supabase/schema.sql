-- Run this in your Supabase SQL editor

create table campaigns (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  active      boolean default true,
  created_at  timestamptz default now()
);

create table keywords (
  id          uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns(id) on delete cascade,
  keyword     text not null,
  created_at  timestamptz default now()
);

create table scrape_runs (
  id           uuid primary key default gen_random_uuid(),
  campaign_id  uuid references campaigns(id) on delete cascade,
  apify_run_id text,
  status       text default 'pending', -- pending | running | completed | failed
  posts_found  int default 0,
  started_at   timestamptz default now(),
  completed_at timestamptz
);

create table posts (
  id               text primary key,  -- tweet ID from X
  campaign_id      uuid references campaigns(id) on delete cascade,
  scrape_run_id    uuid references scrape_runs(id),
  matched_keyword  text,
  text             text,
  author_handle    text,
  author_name      text,
  author_followers int,
  posted_at        timestamptz,
  likes            int default 0,
  retweets         int default 0,
  replies          int default 0,
  views            int default 0,
  url              text,
  scraped_at       timestamptz default now()
);

-- Indexes for common queries
create index on posts(campaign_id);
create index on posts(posted_at desc);
create index on scrape_runs(campaign_id);

-- Seed the first campaign
insert into campaigns (name, slug, description) values
  ('Fableborne', 'fableborne', 'Tracking Fableborne and $POWER token mentions on X');

-- Seed its keywords (get the campaign id from above)
insert into keywords (campaign_id, keyword)
select id, unnest(array['Fableborne', '$POWER'])
from campaigns where slug = 'fableborne';
