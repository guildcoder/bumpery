-- Run once in the SQL editor of a free Supabase project.
-- Then enable Authentication > Sign In / Providers > Anonymous Sign-Ins.
-- Public clients can only call the three narrow RPC functions below.
begin;
create schema if not exists getaway_private;
revoke all on schema getaway_private from public, anon, authenticated;
create table if not exists getaway_private.runs (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  finished_at timestamptz,
  score bigint,
  nickname text,
  seconds numeric
);
create index if not exists getaway_runs_owner_created on getaway_private.runs(owner,created_at desc);
create table if not exists getaway_private.best_scores (
  owner uuid primary key references auth.users(id) on delete cascade,
  nickname text not null check(nickname ~ '^[A-Za-z0-9 _-]{2,16}$'),
  score bigint not null check(score between 1 and 100000000),
  achieved_at timestamptz not null default now()
);
create index if not exists getaway_best_ranking on getaway_private.best_scores(score desc,achieved_at,owner);
alter table getaway_private.runs enable row level security;
alter table getaway_private.best_scores enable row level security;
revoke all on all tables in schema getaway_private from public, anon, authenticated;

create or replace function public.getaway_start_run() returns uuid
language plpgsql security definer set search_path='' as $$
declare who uuid := auth.uid(); result uuid;
begin
  if who is null then raise exception 'Player session required.'; end if;
  -- Serialize starts for each player so concurrent requests cannot bypass limits.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(who::text,0));
  if (select count(*) from getaway_private.runs where owner=who and created_at>now()-interval '1 hour')>=30 then
    raise exception 'Too many voyages. Please try again later.';
  end if;
  if exists(select 1 from getaway_private.runs where owner=who and created_at>now()-interval '3 seconds') then
    raise exception 'Please wait a moment before starting another voyage.';
  end if;
  delete from getaway_private.runs where owner=who and created_at<now()-interval '1 day';
  insert into getaway_private.runs(owner) values(who) returning id into result;
  return result;
end $$;

create or replace function public.getaway_submit_score(p_run_id uuid,p_nickname text,p_score bigint,p_seconds numeric) returns jsonb
language plpgsql security definer set search_path='' as $$
declare who uuid:=auth.uid(); voyage getaway_private.runs%rowtype; name text:=btrim(p_nickname); elapsed numeric;
begin
  if who is null then raise exception 'Player session required.'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(who::text,0));
  select * into voyage from getaway_private.runs where id=p_run_id and owner=who for update;
  if not found then raise exception 'Voyage not found for this player.'; end if;
  if voyage.finished_at is not null then
    return jsonb_build_object('accepted',true,'score',voyage.score,'alreadySubmitted',true);
  end if;
  if name is null or name !~ '^[A-Za-z0-9 _-]{2,16}$' then raise exception 'Use a callsign of 2–16 letters, numbers, spaces, underscores or hyphens.'; end if;
  elapsed:=extract(epoch from now()-voyage.created_at);
  if elapsed>86400 then raise exception 'This voyage has expired. Start a new game.'; end if;
  if p_seconds is null or p_seconds::text in ('NaN','Infinity','-Infinity') or p_seconds<3 or p_seconds>7200 or p_seconds>elapsed+10 then
    raise exception 'Invalid voyage duration.';
  end if;
  if p_score is null or p_score<1 or p_score>100000000 or p_score%25<>0 or p_score>p_seconds*100000 then
    raise exception 'Invalid voyage score.';
  end if;
  update getaway_private.runs set finished_at=now(),score=p_score,nickname=name,seconds=p_seconds where id=p_run_id;
  insert into getaway_private.best_scores(owner,nickname,score) values(who,name,p_score)
  on conflict(owner) do update set nickname=excluded.nickname,score=excluded.score,achieved_at=now()
  where excluded.score>getaway_private.best_scores.score;
  return jsonb_build_object('accepted',true,'score',p_score,'alreadySubmitted',false);
end $$;

create or replace function public.getaway_leaderboard() returns table(rank bigint,nickname text,score bigint)
language sql stable security definer set search_path='' as $$
  select row_number() over(order by b.score desc,b.achieved_at,b.owner),b.nickname,b.score
  from getaway_private.best_scores b order by b.score desc,b.achieved_at,b.owner limit 50;
$$;
revoke all on function public.getaway_start_run() from public,anon;
revoke all on function public.getaway_submit_score(uuid,text,bigint,numeric) from public,anon;
revoke all on function public.getaway_leaderboard() from public;
grant execute on function public.getaway_start_run() to authenticated;
grant execute on function public.getaway_submit_score(uuid,text,bigint,numeric) to authenticated;
grant execute on function public.getaway_leaderboard() to anon,authenticated;
commit;
