# GolfMap OG SVG Assets

목표: 배경 골프장 이미지만 JPG/PNG로 두고, 나머지 모든 요소는 SVG 코드로 고정해서 500개+ 페이지의 제목만 바꿔 재생성하는 구조입니다.

## 파일 설명
- `assets/golfmap-logo-mark.svg`: 투명 배경 로고 마크
- `assets/korea-map-overlay.svg`: 투명 배경 한국 지도 오버레이
- `assets/outer-frame.svg`: 투명 배경 외곽 프레임
- `assets/glass-panel.svg`: 투명 배경 하단 글래스 패널
- `assets/golf-flag-white.svg`: 투명 배경 흰색 깃발 장식
- `assets/decorative-dots.svg`: 투명 배경 점 그리드
- `assets/icons/*.svg`: 하단 아이콘 4종
- `src/generateGolfMapOgSvg.ts`: 제목만 바꿔 전체 OG SVG를 생성하는 함수

## 폰트
권장 폰트: `Pretendard`
fallback: `Noto Sans KR`, `Apple SD Gothic Neo`, `Malgun Gothic`, sans-serif

폰트 파일은 여기 포함하지 않았습니다. 프로젝트에서 이미 쓰는 웹폰트/시스템 폰트를 그대로 사용하세요.

## 핵심 사용 방식
1. 배경 이미지를 `public/promo-assets/backgrounds/default-golf-course.jpg` 같은 경로에 둡니다.
2. `generateGolfMapOgSvg({ title, backgroundImageHref })`로 SVG 문자열을 만듭니다.
3. sharp/resvg/satori 등으로 PNG로 렌더링합니다.
4. title만 바꿔 500개+ 페이지를 일괄 생성합니다.

## 중요한 원칙
- 체크무늬가 들어간 PNG asset은 쓰지 마세요.
- 배경만 이미지 파일로 사용하세요.
- 로고, 지도, 프레임, 패널, 아이콘은 SVG 코드로 그립니다.
- 디자인 좌표는 고정하고, title/eyebrow만 바꾸세요.
