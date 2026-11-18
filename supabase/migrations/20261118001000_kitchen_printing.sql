-- ===========================================================================
-- Kitchen ticket printing (module `kitchen_printing`).
--
-- Printing itself happens in the browser (src/lib/printing): the tablet or PC
-- prints to whatever thermal printer it already has. The database only keeps
-- the two preferences the board needs: paper width, and when to print on its
-- own.
-- ===========================================================================

alter table public.business_settings
  add column print_paper_mm integer not null default 80
    check (print_paper_mm in (58, 80)),
  add column print_auto text not null default 'off'
    check (print_auto in ('off', 'on_new', 'on_kitchen'));
