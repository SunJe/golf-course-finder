/**
 * Local-only review admin — never enabled on production deploy.
 * Requires REVIEW_ADMIN_ENABLED=true AND non-production runtime.
 * Vercel production is blocked even if the env var is set by mistake.
 */
export function isReviewAdminEnabled(): boolean {
  if (process.env.NODE_ENV === "production") {
    return false;
  }
  if (process.env.VERCEL_ENV === "production") {
    return false;
  }
  return process.env.REVIEW_ADMIN_ENABLED === "true";
}
