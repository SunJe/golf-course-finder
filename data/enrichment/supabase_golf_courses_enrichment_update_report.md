# Supabase golf_courses enrichment update report

Generated: 2026-06-21T08:32:00.043Z

## CSV validation

- Row count: **532**
- Unique ids: **532**
- Empty id rows: **0**
- Duplicate ids: **0**
- Missing columns: **none**
- change_name_to applied: **186**
- address filled: **532**
- phone filled: **531**
- homepage_url filled: **523**
- price_text filled: **161**
- price_min filled: **216**
- price_max filled: **216**
- Empty final name rows: **0**

## SQL columns

- Included: **name, address, phone, homepage_url, price_text, price_min, price_max, price_type**
- Excluded by policy: **avg_score, difficulty, scraped_avg_score, scraped_difficulty, scraped_difficulty_text**

## Generated files

- Preview (20 rows): `data/enrichment/supabase_golf_courses_enrichment_update_preview.sql`
- Full safe (532 rows): `data/enrichment/supabase_golf_courses_enrichment_update.sql`
- Full overwrite (532 rows): `data/enrichment/supabase_golf_courses_enrichment_update_full_overwrite.sql`

## Supabase run order

1. Run preview SQL and verify a few courses on the site
2. Run full safe SQL
3. Use full overwrite SQL only when you intentionally want empty CSV cells to clear DB values
