# GolfMap Korea title-only OG image kit

이 묶음은 현재 확정된 GolfMap OG 디자인에서 **제목만 바꿔서** PNG를 만드는 구성입니다.

## 포함 파일
- `golfmap_og_base_no_title.png` : 제목만 제거한 고정 베이스 이미지
- `generate_golfmap_title_og.py` : 제목만 얹는 생성 스크립트
- `sample_titles.csv` : 샘플 title 목록
- `*.png` : 샘플 생성 결과

## 원칙
- 배경/로고/지도/프레임/패널/아이콘은 모두 고정
- 페이지별로 바뀌는 것은 title 하나
- 1200x1200 PNG

## 단일 생성
```bash
python generate_golfmap_title_og.py --title "나인홀 골프장" --out nine-hole.png
```

## CSV 일괄 생성
```bash
python generate_golfmap_title_og.py --csv sample_titles.csv --out-dir ./out
```

## 폰트
- Linux: `/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc`
- Windows: `C:/Windows/Fonts/malgunbd.ttf`

Cursor에는 이 파일들을 프로젝트에 넣고, 기존 `generateSeoImages`에서 title 목록만 읽어 이 스크립트 로직과 같은 방식으로 적용시키면 됩니다.
