/** Local-only review admin — never enabled on production deploy. */
export function isReviewAdminEnabled(): boolean {
  if (process.env.NODE_ENV === "production") {
    return false;
  }
  return process.env.REVIEW_ADMIN_ENABLED === "true";
}
