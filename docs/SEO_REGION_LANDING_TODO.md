# 지역 랜딩 페이지 SEO — TODO

상세페이지 SEO 이후 2단계로 지역별 인덱스 페이지를 추가한다.

## 목표 URL (예시)

| 경로 | title 예시 |
|------|------------|
| `/regions/gyeonggi` | 경기 골프장 지도 \| GolfMap Korea |
| `/regions/gangwon` | 강원 골프장 지도 \| GolfMap Korea |
| `/regions/jeju` | 제주 골프장 지도 \| GolfMap Korea |
| `/regions/busan` | 부산 골프장 지도 \| GolfMap Korea |
| `/regions/incheon` | 인천 골프장 지도 \| GolfMap Korea |

## description 템플릿

`{지역명} 지역 골프장의 위치, 주소, 전화번호, 홈페이지, 참고 요금을 GolfMap Korea에서 확인하세요.`

## 구현 시 체크리스트

- [ ] `app/regions/[slug]/page.tsx` — region slug → Course.region 필터
- [ ] `generateStaticParams` — 고유 region 목록
- [ ] `generateMetadata` — 지역별 title/description/canonical
- [ ] 본문: 지역 소개 1문단 + 골프장 `<Link>` 리스트 (CourseCard 재사용)
- [ ] `sitemap.ts`에 `/regions/*` URL 추가
- [ ] 메인/상세에서 지역 페이지로 내부 링크 (breadcrumb 또는 footer)

## 우선순위

1. 상세페이지 SEO (완료)
2. Search Console / Naver 서치어드바이저 색인 모니터링
3. 상위 트래픽 지역 3~5개부터 랜딩 페이지 파일럿
