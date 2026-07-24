import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * Preview deploy without R2 incremental cache.
 * Pages using `export const revalidate` will not get durable ISR
 * revalidation on Workers until an official OpenNext R2 cache
 * adapter is added in a later PR. SSG/SSR still work for smoke QA.
 */
export default defineCloudflareConfig({});
