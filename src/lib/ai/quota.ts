/**
 * Monthly AI photo allowance per business.
 *
 * Shared by the Server Action (which enforces it) and the panel (which shows
 * the counter), so the number a owner reads is always the number that blocks
 * them. At US$0.067 an image this caps a location at roughly US$2/month —
 * enough to load a full menu with retries, small enough that one business
 * cannot drain the credit in an afternoon.
 */
export const AI_IMAGES_MONTHLY_QUOTA = 30;
