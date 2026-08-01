# GolfMap Analytics — 운영자 1페이지

Production: https://golfmap.kr  
Worker: `golfmap-korea-preview`  
GA4: `G-FMY10PMHEB`

Cloudflare = 서버/인프라 건강  
GA4 = 사용자·콘텐츠 성장  

숫자는 서로 같아지지 않습니다.

---

## 매일 1분

1. Cloudflare → Workers → `golfmap-korea-preview` → **Metrics / Observability**
2. 기간: **Last 24 hours**
3. 확인:
   - **리소스 초과(exceededResources / exceededCpu)가 0인가**
   - **5xx가 0인가**
   - **CPU p95 / p99**가 전날보다 튀지 않았는가 (Free는 ~10ms 예산이 빡셈)
4. GA4 → `GolfMap 콘텐츠 성장` (또는 Explore)
   - 네이버 유입 사용자가 유지되는가
   - 인기 `/blog/*` 글이 비정상적으로 사라지지 않았는가

CLI로 같은 요약을 보려면 (개발자):

```bash
npm run cf:health:24h
```

리포트: `reports/analytics/YYYY-MM-DD-cloudflare-health.md`

---

## 오류가 보이면

1. Workers → Observability / Logs 열기
2. 시간 범위를 오류 구간으로 좁히기 (UTC / 서울 둘 다 확인)
3. outcome / status 필터:
   - `exceededResources` / `exceededCpu` / `exceededMemory`
   - `scriptThrewException`
4. CPU가 높은 path 확인 — 특히 `/map`, `/courses/*`
5. Ray ID가 있으면 검색 (예: `a2439b786f5afc92`)
6. **Vercel rollback 기준** (DNS는 운영 승인 후):
   - 반복 5xx / 1102 클러스터
   - map 데이터 붕괴
   - `exceededMemory` 확정
   - 주요 CTA 불능

상세 대시보드 클릭 경로: `reports/analytics/cloudflare-dashboard-setup.md`  
1102 사건 메모: `reports/analytics/1102-dashboard-confirmation.md`

---

## Cloudflare 숫자와 GA4 숫자가 다른 이유

| | Cloudflare | GA4 |
|---|---|---|
| 무엇을 세나 | HTTP requests (봇·asset 포함 가능) | JS가 실행된 사용자 이벤트 |
| 누락 원인 | 캐시 HIT면 Worker 미실행일 수 있음 | ad blocker, 동의, 미로드 |
| 용도 | CPU·5xx·장애 | 유입·콘텐츠·퍼널 |

같게 맞추려 하지 말고, **각각의 정상 범위**만 봅니다.

---

## 역할 분리 (고정)

- **Cloudflare**: Worker 요청, CPU/wall/memory, invocation status, 5xx, 캐시, Production vs workers.dev
- **GA4**: 사용자/세션, 네이버·구글 유입, 인기 글/코스, 검색·필터·CTA 이벤트
- **Vercel Analytics / Speed Insights**: 레이아웃에 남아 있으면 클라이언트 성능 보조 신호일 뿐. Production 호스팅 판정 근거로 쓰지 않음.

---

## 관련 문서

- Cloudflare 대시보드 설정: `reports/analytics/cloudflare-dashboard-setup.md`
- GA4 대시보드 설정: `reports/analytics/ga4-dashboard-setup.md`
- 알림 가능 범위: `reports/analytics/alerts-audit.md`
- CLI: `npm run cf:health:24h` / `7d` / `incident`
