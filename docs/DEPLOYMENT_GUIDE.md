# GolfMap Korea — 배포 가이드 (Vercel)

전제
- Supabase `golf_courses` 532행 연동 완료
- mock fallback 유지
- Kakao Map provider 유지, Naver 구조 변경 없음

---

## 1) GitHub에 push

- 로컬에서 변경사항 커밋 후 원격 저장소로 push
- `.env.local`은 **커밋 금지**
- (권장) `.next/`는 `.gitignore`로 관리

---

## 2) Vercel 프로젝트 생성

1. Vercel 대시보드에서 **New Project**
2. GitHub 저장소 연결
3. Framework: **Next.js**
4. Build Command: 기본값(`next build`) 사용

---

## 3) 환경변수 설정 (Vercel)

Vercel Project Settings → Environment Variables에 아래 값을 설정합니다.

### 필수 Public Env

- `NEXT_PUBLIC_MAP_PROVIDER`
- `NEXT_PUBLIC_KAKAO_MAP_APP_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_CONTACT_EMAIL`
- `NEXT_PUBLIC_NAVER_SITE_VERIFICATION`

권장 값 예시
- `NEXT_PUBLIC_MAP_PROVIDER=kakao`
- `NEXT_PUBLIC_SITE_URL=https://golfmap.kr`
- `NEXT_PUBLIC_CONTACT_EMAIL=golfmap.kr@gmail.com`
- `NEXT_PUBLIC_NAVER_SITE_VERIFICATION=53952bdb168063a9886fe7d056af1061aa692392`

### 보안 주의 (절대 넣지 말 것)

- `KAKAO_REST_API_KEY`: **geocoding 스크립트용** (로컬 전용). Vercel에 넣지 않음.
- Supabase `service_role` key: **절대 금지**

---

## 4) Kakao Map 도메인 등록

Kakao Developers 콘솔에서 **JavaScript 키 사용 도메인**(또는 플랫폼 설정)에 배포 도메인을 등록해야 합니다.

예시
- `https://<your-vercel-project>.vercel.app`
- 커스텀 도메인 사용 시 해당 도메인도 추가

등록이 누락되면 지도 로딩이 실패할 수 있습니다.

---

## 5) Supabase URL / anon key 설정

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon public key

주의
- RLS 정책이 공개 읽기(SELECT) 허용 상태여야 MVP가 정상 동작합니다.
- 키 값은 외부에 노출되지 않도록 관리(특히 service_role 금지).

---

## 6) Build 확인

로컬에서 다음을 확인합니다.

```bash
npm run build
```

기대 로그(예)
- `Loaded 532 course ids from Supabase`
- `Loaded 532 courses from Supabase`
- `Generating static pages (536/536)`
- `build success`

---

## 7) 배포 후 QA 체크

배포 완료 후 `docs/MVP_QA_CHECKLIST.md` 항목을 기준으로 확인합니다.

필수 확인 포인트
- Supabase 데이터 로드 성공(메인/상세)
- 지도 초기 화면/클러스터/확대 후 개별 pin
- 검색 1~3건에서 개별 pin 확실히 표시
- 외부 지도 링크(카카오/네이버) 검색어: **골프장명 우선**
- 모바일 UI

