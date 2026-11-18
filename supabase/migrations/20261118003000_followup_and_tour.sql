-- ===========================================================================
-- Trial follow-up for the superadmin, and the first-run tour for staff.
--
-- Gastón installs every local himself, for free, and charges the subscription
-- by hand after a 15-day trial. He needs to see, per local: when it started,
-- when the trial ends, and whether anybody is actually using it — and to get
-- a push on his own phone when a trial is about to end or has ended.
-- ===========================================================================

-- --- Trial dates and notification markers ----------------------------------

alter table public.subscriptions
  add column trial_ends_at date not null default (current_date + 15),
  -- Set once the "ends tomorrow" push went out, so the daily cron never
  -- repeats it.
  add column trial_reminder_sent_at timestamptz,
  -- Set once the "trial ended, follow up" push went out.
  add column trial_ended_notified_at timestamptz;

-- Existing rows: the trial is counted from when the business was created.
-- They are the two seeded demo businesses (no real customers on 2026-11-18),
-- so both markers are pre-set: the first cron run must not page Gastón about
-- demos whose trial "ended" in August.
update public.subscriptions
set trial_ends_at = (created_at at time zone 'America/Argentina/Buenos_Aires')::date + 15,
    trial_reminder_sent_at = now(),
    trial_ended_notified_at = now();

-- --- Last time somebody used the panel -------------------------------------

alter table public.businesses
  add column last_activity_at timestamptz;

-- Called from the panel layout on every render. Throttled in SQL so a busy
-- Friday is one write per half hour, not one per click. SECURITY DEFINER
-- because staff have no update policy on businesses beyond the owner; it can
-- only ever touch the caller's own business (auth_business_id()).
create or replace function public.touch_business_activity()
returns void
language sql
security definer
set search_path = public
as $$
  update public.businesses
  set last_activity_at = now()
  where id = public.auth_business_id()
    and (last_activity_at is null or last_activity_at < now() - interval '30 minutes');
$$;

revoke all on function public.touch_business_activity() from public;
grant execute on function public.touch_business_activity() to authenticated;

-- --- First-run tour ---------------------------------------------------------

alter table public.profiles
  add column tour_completed_at timestamptz;

-- Own row only, one column only. A direct profiles update would need a
-- policy wide enough to also let staff edit their own role.
create or replace function public.set_tour_completed(p_completed boolean)
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles
  set tour_completed_at = case when p_completed then now() else null end
  where id = auth.uid();
$$;

revoke all on function public.set_tour_completed(boolean) from public;
grant execute on function public.set_tour_completed(boolean) to authenticated;

-- --- Superadmin push devices ------------------------------------------------

-- Separate from push_subscriptions, which is per business (business_id is
-- NOT NULL) and is what order alerts fan out to. A superadmin has no business.
create table public.admin_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.admin_push_subscriptions enable row level security;

create policy admin_push_subscriptions_superadmin on public.admin_push_subscriptions
  for all to authenticated
  using (public.is_superadmin())
  with check (public.is_superadmin() and profile_id = auth.uid());
