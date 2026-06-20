# GolfMap SEO 체크리스트

공개 전 `https://golfmap.kr` 기준으로 아래 항목을 확인합니다.

---

## 1. 사이트 접속

- [ ] `https://golfmap.kr` 정상 접속
- [ ] HTTPS 인증서 정상
- [ ] 메인 지도·검색·필터 동작

## 2. Kakao Map

- [ ] Kakao Developers에 `golfmap.kr` 도메인 등록
- [ ] 메인·상세 페이지 지도 로딩 정상

## 3. SEO 파일

- [ ] `https://golfmap.kr/sitemap.xml` 접속 — 메인 1 + 상세 532 ≈ **533 URL**
- [ ] `https://golfmap.kr/robots.txt` 접속
- [ ] robots에 `Sitemap: https://golfmap.kr/sitemap.xml` 포함
- [ ] robots에 `/admin`, `/api/admin` **Disallow** 확인

## 4. 메타데이터

- [ ] 메인 title: `GolfMap | 전국 골프장 지도`
- [ ] 메인 canonical: `https://golfmap.kr`
- [ ] 상세 title: `{골프장명} | 요금·위치·전화번호 | GolfMap`
- [ ] 상세 canonical: `https://golfmap.kr/courses/{id}`
- [ ] Vercel 기본 URL(`*.vercel.app`)이 canonical로 잡히지 않음

## 5. OG 이미지 (선택)

- [ ] `public/og-image.png` 추가 시 Open Graph/Twitter image 자동 포함
- [ ] 파일 없으면 metadata에 broken image URL 없음 (현재 동작)

## 6. Google Search Console

- [ ] 속성 추가: `https://golfmap.kr`
- [ ] 소유권 확인 (DNS 또는 HTML)
- [ ] Sitemap 제출: `https://golfmap.kr/sitemap.xml`
- [ ] URL 검사로 메인·대표 상세 페이지 색인 요청

## 7. 네이버 서치어드바이저

- [ ] 사이트 등록: `https://golfmap.kr`
- [ ] 소유권 확인
- [ ] 사이트맵 제출: `https://golfmap.kr/sitemap.xml`
- [ ] 수집 요청 (주요 상세 페이지 URL)

## 8. Vercel Production 환경변수

```text
NEXT_PUBLIC_SITE_URL=https://golfmap.kr
NEXT_PUBLIC_CONTACT_EMAIL=golfmap.kr@gmail.com
NEXT_PUBLIC_MAP_PROVIDER=kakao
NEXT_PUBLIC_KAKAO_MAP_APP_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 9. 샘플 확인 URL

- 메인: `https://golfmap.kr/`
- 상세 예: `https://golfmap.kr/courses/gc-fa86c43067e7`
- sitemap: `https://golfmap.kr/sitemap.xml`
- robots: `https://golfmap.kr/robots.txt`

## 10. admin 비색인

- [ ] `/admin/naver-review` 등 admin 페이지 `noindex`
- [ ] robots.txt에서 admin 경로 차단
