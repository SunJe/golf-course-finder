# GolfMap Korea ⛳

전국 골프장을 **지도 + 리스트**로 한눈에 검색·비교하는 서비스. 카카오맵/네이버지도 장소검색 스타일의
직관적인 UI에, 지역·가격·홀수·운영방식·태그 필터를 제공합니다.

> 참고 서비스(fga.purpleo.co.kr)를 단순 복제하지 않고, 더 현대적이고 정보가 풍부한 MVP로 구성했습니다.

## 기술 스택

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS**
- **지도 provider 추상화** — Kakao / Naver / Custom (환경변수로 전환)
- **Supabase** 연동 고려 구조 (현재는 mock data)
- 아이콘: lucide-react

## 시작하기

```bash
npm install
cp .env.local.example .env.local   # 키 입력 (선택)
npm run dev
```

`http://localhost:3000` 접속.

### 환경변수 (`.env.local`)

| 변수 | 설명 |
| --- | --- |
| `NEXT_PUBLIC_MAP_PROVIDER` | 지도 엔진: `kakao` \| `naver` \| `custom` (기본값 **kakao**) |
| `NEXT_PUBLIC_KAKAO_MAP_APP_KEY` | Kakao JavaScript App Key. 없으면 MapFallback 표시 |
| `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` | Naver Map v3 Client ID. 없으면 MapFallback 표시 |
| `NEXT_PUBLIC_SUPABASE_URL` | (선택) 추후 Supabase 연동용 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (선택) 추후 Supabase 연동용 |
| `NEXT_PUBLIC_SITE_URL` | 공식 도메인 (canonical/sitemap). Production: `https://golfmap.kr` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | 정보 수정 제보 mailto (기본값 `golfmap.kr@gmail.com`) |
| `NEXT_PUBLIC_NAVER_SITE_VERIFICATION` | 네이버 서치어드바이저 소유 확인 meta content |

```env
NEXT_PUBLIC_MAP_PROVIDER=kakao
NEXT_PUBLIC_KAKAO_MAP_APP_KEY=your_kakao_map_app_key
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=your_naver_map_client_id
NEXT_PUBLIC_SITE_URL=https://golfmap.kr
NEXT_PUBLIC_CONTACT_EMAIL=golfmap.kr@gmail.com
NEXT_PUBLIC_NAVER_SITE_VERIFICATION=53952bdb168063a9886fe7d056af1061aa692392
```

**Vercel Production**에도 `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_NAVER_SITE_VERIFICATION`을 동일하게 설정하세요.

### 지도 provider 변경 방법

`.env.local`에서 `NEXT_PUBLIC_MAP_PROVIDER` 값만 바꾸고 dev 서버를 재시작합니다.

| 값 | 렌더링 컴포넌트 |
|---|---|
| `kakao` (기본) | `KakaoCourseMap` |
| `naver` | `NaverCourseMap` |
| `custom` | `CustomKoreaMap` (SVG/GeoJSON 확장 placeholder) |

API 키가 없거나 script 로드 실패 시 `MapFallback`이 표시됩니다.

## 폴더 구조

```
components/maps/
  CourseMap.tsx           # provider wrapper (지도 구현 없음)
  KakaoCourseMap.tsx      # Kakao Map SDK
  NaverCourseMap.tsx      # Naver Map SDK v3
  CustomKoreaMap.tsx      # 커스텀 한국 지도 placeholder
  MapFallback.tsx         # API 키 없을 때 공통 fallback
  CourseMarkerPopup.tsx   # 공통 마커 팝업
lib/
  mapConfig.ts            # getMapProvider()
  kakaoLoader.ts          # Kakao SDK 로더
  naverLoader.ts          # Naver SDK 로더
  externalMapLinks.ts     # 카카오/네이버 외부 검색 URL
  mapProjection.ts        # fallback/custom 좌표 투영
  courseMapBindings.ts    # props 정규화
types/
  course.ts               # Course (골프장 데이터)
  map.ts                  # MapProvider, NearbyPlace (추후 맛집/숙소용)
```

## 설계 원칙

- **지도 provider** (kakao/naver/custom)와 **장소 데이터 provider** (naver/kakao/manual/public)는 분리
- 골프장 데이터는 자체 `Course` 타입 / mock data 기준
- 외부 지도 링크는 카카오·네이버 **둘 다** 제공 (`externalMapLinks.ts`)
- 추후 맛집/숙소/카페는 `NearbyPlace` 타입 (`types/map.ts`)으로 별도 관리

## Supabase로 전환하기

1. `courses` 테이블 생성 (스키마는 `lib/supabase.ts` 주석 참고).
2. `.env.local` 에 URL / anon key 입력.
3. `lib/data.ts` 의 `getCourses` / `getCourseById` 를 Supabase 쿼리로 교체.

## 주요 기능

- 검색어 + 지역/홀수/운영방식/가격대/태그 **복합 필터**
- 리스트 클릭 → 지도 중심 이동 / 마커 클릭 → 팝업
- 카드·상세 페이지에서 **카카오맵 / 네이버지도** 외부 링크
- 반응형: 데스크탑 split / 모바일 지도·리스트 + 바텀시트 필터

---

이미지는 Unsplash 데모 URL을 사용합니다. 실제 데이터로 교체해 사용하세요.
