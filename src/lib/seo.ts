export const SITE_URL = "https://solversanctuary.com";

/**
 * Bump this whenever /public/og-image.jpg (or any share metadata tied to it)
 * changes. The version is appended as a query parameter so Facebook, X,
 * LinkedIn, Slack, etc. treat it as a brand-new image URL and re-scrape it
 * instead of serving their cached copy.
 */
export const OG_IMAGE_VERSION = "2026-07-30";

export const OG_IMAGE_URL = `${SITE_URL}/og-image.jpg?v=${OG_IMAGE_VERSION}`;
