-- ===========================================================================
-- Floor plan: where each table physically sits, and what shape it is.
--
-- Coordinates are stored as PERCENTAGES of the plan area (0-100), not pixels.
-- The same plan has to be readable on a waiter's phone and on the counter
-- tablet; pixels would mean a layout arranged on one device lands off-screen
-- on the other. Percentages scale with whatever box the plan is drawn into.
--
-- All three columns are nullable and default to nothing on purpose: every
-- table that already exists keeps working exactly as before, and the list
-- view stays the source of truth until someone drags a table for the first
-- time. A business that never opens the plan never notices this migration.
-- ===========================================================================

alter table public.restaurant_tables
  add column position_x numeric(5, 2) check (position_x is null or position_x between 0 and 100),
  add column position_y numeric(5, 2) check (position_y is null or position_y between 0 and 100),
  -- Round vs square is how a waiter tells two tables apart at a glance when
  -- the numbers are small on a phone. Not decoration.
  add column shape text not null default 'square' check (shape in ('round', 'square'));
