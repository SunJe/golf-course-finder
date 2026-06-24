# Cursor 프롬프트

GolfMap Korea의 SEO/OG 이미지를 500개 이상 페이지에 적용할 수 있도록, 이미지 레이어를 전부 SVG 코드 기반 템플릿으로 고정해 주세요.

중요한 요구사항:
- 내가 원하는 것은 디자인을 매번 새로 만드는 것이 아니라, 현재 최종 시안의 구도를 그대로 고정하고 글씨만 바꾸는 것입니다.
- 배경 골프장 이미지만 JPG/PNG로 사용합니다.
- 로고, 한국 지도, 외곽 프레임, 글래스 패널, 점 그리드, 깃발, 하단 아이콘은 모두 SVG 코드로 그립니다.
- 체크무늬 배경이 포함된 PNG asset은 절대 사용하지 않습니다.
- 모든 요소는 투명 배경 SVG여야 합니다.
- 페이지별로 바뀌는 값은 title, eyebrow, backgroundImage 정도입니다.

첨부/제공된 파일 구조를 프로젝트에 반영해 주세요:

```text
assets/golfmap-logo-mark.svg
assets/korea-map-overlay.svg
assets/outer-frame.svg
assets/glass-panel.svg
assets/golf-flag-white.svg
assets/decorative-dots.svg
assets/icons/location.svg
assets/icons/phone.svg
assets/icons/homepage.svg
assets/icons/price.svg
src/generateGolfMapOgSvg.ts
```

구현 목표:
1. `generateGolfMapOgSvg.ts`를 프로젝트의 적절한 위치로 옮깁니다.
   예: `lib/seo-images/generateGolfMapOgSvg.ts`
2. 기존 `generateSeoImages.ts`가 있다면 이 함수를 사용하도록 바꿉니다.
3. 1200x1200 정사각형 PNG를 생성합니다.
4. 배경 이미지는 기존 밝은 골프장 배경을 사용합니다.
5. 컬렉션/지역/코스 페이지 모두 같은 템플릿을 사용합니다.
6. title만 바꿔도 이미지가 생성되어야 합니다.

데이터 예시:

```ts
type GolfMapOgData = {
  title: string;
  eyebrow?: string;
  brand?: string;
  domain?: string;
  backgroundImageHref: string;
};
```

타이틀 예시:
```text
나인홀 골프장
백돌이 골프장
초보자 골프장
저렴한 골프장
대중제 골프장
서울 근교 골프장
비에이비스타CC
```

폰트:
- 한글 제목: Pretendard Black 또는 ExtraBold
- fallback: Noto Sans KR, Apple SD Gothic Neo, Malgun Gothic
- 영어: Inter 또는 Pretendard
- 폰트 파일이 없다고 중단하지 말고, CSS font-family fallback으로 처리하세요.

작업 후 실행:

```bash
npm run generate:seo-images
npm run check:seo-images
npm run build
```

완료 보고:
- 수정/추가한 파일
- 기존 PNG asset을 제거하고 SVG 코드 기반으로 전환했는지
- title만 바꿔 전체 이미지가 생성되는지
- 생성된 샘플 이미지 목록
- build 결과

절대 하지 말 것:
- 체크무늬 배경 PNG 사용 금지
- 모든 페이지 이미지를 수동 편집 금지
- 디자인 구도 변경 금지
- 한국 지도 삭제 금지
- 하단 아이콘 삭제 금지
- 외부 이미지 생성 API 요구 금지
