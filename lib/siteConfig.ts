export const siteConfig = {
  contactEmail:
    process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "golfmap.kr@gmail.com",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL?.trim() || "",
} as const;
