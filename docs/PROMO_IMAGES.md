# GolfMap Promo Image Template

고정 마스터 시안(1:1) 위에 **배경·타이틀·설명만** 바꿔 500개+ 페이지 이미지를 생성합니다.

## 구조

| 경로 | 역할 |
|------|------|
| `components/og/GolfMapPromoTemplate.tsx` | 브라우저 미리보기용 React 템플릿 |
| `scripts/lib/promo/promoTemplateSvg.ts` | PNG 생성용 고정 SVG 오버레이 |
| `scripts/lib/promo/renderGolfMapPromo.ts` | 배경 + 오버레이 sharp 합성 |
| `lib/og/promoTypes.ts` | `PromoPageData` 타입 |
| `lib/og/promoPageData.ts` | 컬렉션 → promo 데이터 변환 |
| `public/promo-assets/backgrounds/` | 배경 이미지 |
| `public/promo-images/collections/` | 생성된 PNG 출력 |

## 텍스트 수정

### 컬렉션 자동 생성 (기본)

`lib/og/promoPageData.ts`의 `SHORT_DESCRIPTIONS` 또는 `collectionLandingPages`의 `h1` / `seoDescription`을 수정합니다.

### JSON으로 직접 지정

`data/promo/pages.json` 예시:

```json
[
  {
    "slug": "nine-hole",
    "title": "나인홀 골프장",
    "eyebrow": "전국을 연결하는 골프 정보 플랫폼",
    "description": "전국 나인홀 골프장 정보를 한눈에"
  }
]
```

## 배경 이미지

- 기본: `public/promo-assets/backgrounds/default.jpg`
- 페이지별: `public/promo-assets/backgrounds/{slug}.jpg` (있으면 우선 사용)
- 시안 참고: `public/promo-assets/master-reference.png`

밝은 대낮·청명한 하늘·깨끗한 페어웨이 톤을 유지하세요.

## 생성 명령 (기본: 시안 픽셀 합성 `sample` 모드)

```bash
# 나인홀·백돌이·초보자 등 — sample 모드(기본), 1200×1200
npm run generate:promo-images -- --slug nine-hole --slug baekdori --slug beginner

# 전체 컬렉션
npm run generate:promo-images:all

# 구 마스터 텍스트 교체 방식
npm run generate:promo-images -- --mode master --sample

# 구 SVG 오버레이 방식 (레거시)
npm run generate:promo-images -- --mode svg --sample
```

### `sample` 모드 (권장)

| 자산 | 경로 |
|------|------|
| 배경 사진 | `public/promo-assets/backgrounds/default.png` (또는 `{slug}.png`) |
| 시안 원본 | `public/promo-assets/master-sample.png` |

1. 배경 사진을 1200×1200으로 리사이즈
2. 글래스 패널은 **현재 배경을 블러** 후 반투명 틴트 (시안과 동일한 유리 효과)
3. 로고·지도·프레임·아이콘·eyebrow·타이틀(나인홀)은 **시안 PNG에서 영역 잘라 그대로 붙임** — SVG로 다시 그리지 않음
4. 다른 컬렉션 타이틀만 SVG로 교체 (유일한 변수)

`master` / `svg` 모드는 이전 실험용. 시안과 100% 일치가 목표면 `sample`을 사용하세요.

## 고정 요소 (변경 금지)

- 1:1 비율, 프레임 장식선
- 좌상단 GolfMap Korea + golfmap.kr
- 우상단 FIND YOUR NEXT ROUND + 대한민국 지도 실루엣
- 중앙 글래스 패널
- 하단 4아이콘: 위치 / 연락처 / 홈페이지 / 실시간 요금
