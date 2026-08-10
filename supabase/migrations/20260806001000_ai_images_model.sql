-- ===========================================================================
-- Records which model produced each generation.
--
-- A separate migration rather than an edit to 20260806000000: that one has
-- already run against the cloud project, and rewriting an applied migration
-- leaves the file and the database saying different things.
--
-- Needed because the generator now tries the free-tier model first and only
-- steps up to a paid one when GEMINI_IMAGE_MODEL_FALLBACK is set. Without
-- this column, cost_usd_millis is a number with no way to tell whether it
-- was actually charged or covered by the free allowance.
-- ===========================================================================

alter table public.ai_image_generations
  add column model text;
