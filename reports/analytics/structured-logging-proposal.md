# Proposal only — structured Worker logs (do not implement in this PR)

If path-level CPU diagnosis remains hard after Dashboard Query Builder setup, consider a **separate** PR that adds low-cardinality JSON logs from OpenNext/request middleware.

## Allowed fields

| field | example | purpose |
|---|---|---|
| `route_group` | `home` / `map` / `course` / `blog` / `collection` / `other` | aggregate CPU by surface |
| `data_source` | `supabase` / `static` / `unknown` | see full-catalog loads |
| `course_count` | `532` | detect full-table paths |
| `phase` | `middleware` / `ssr` / `asset` | where time is spent |
| `duration_ms` | `42` | wall slice |
| `cache_mode` | `dynamic` / `static-asset` | correlate with HIT/MISS |

## Forbidden

- Supabase URL / anon / service keys  
- User IP / geolocation precision  
- Raw search query strings  
- Cookies / Authorization headers  
- Full request header dumps  
- Email / phone / personal names  

## Rollout

1. Feature-flag or sample ≤10% after approval  
2. Keep observability head_sampling_rate decision separate  
3. Never block UX on logging failures
