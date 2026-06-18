# Geocoding Manual Review

> Generated: 2026-06-18T02:11:25.314Z

## 개요

- **failure 총 27건** (multiple_candidates 21, no_result 6)
- **자동 좌표 반영 없음** — `manual_geocoding_decisions.csv`에 decision 입력 후 `npm run apply:manual-geocoding`

## decision 값

- `use_candidate` — 후보 좌표 사용 (selected_* 또는 추천 후보 rank 1)
- `manual_coordinate` — selected_latitude/longitude 직접 입력
- `retry_with_query` — 추가 query 재시도 (수동)
- `keep_unresolved` — 좌표 없이 유지
- `exclude_from_import` — 최종 import 제외

## multiple_candidates

### 휘닉스 컨트리클럽

- **id:** gc-98e23645d4c7
- **region / city:** 강원 / 평창군
- **original address:** 평창군 봉평면 태기로 227-84
- **query:** 휘닉스 컨트리클럽 평창군

#### 후보

- **후보 1**
  - place_name: 휘닉스평창 휘닉스CC
  - address_name: 강원특별자치도 평창군 봉평면 면온리 1018-2
  - road_address_name: 강원특별자치도 평창군 봉평면 태기로 227
  - latitude: 37.589263238945314
  - longitude: 128.33557675866044
  - confidence: 110
  - query: 휘닉스 컨트리클럽 평창군 (keyword)
  - 이유: query="휘닉스 컨트리클럽 평창군" score=110

- **후보 2**
  - place_name: 휘닉스평창 태기산CC
  - address_name: 강원특별자치도 평창군 봉평면 면온리 1120
  - road_address_name: 강원특별자치도 평창군 봉평면 태기로 174
  - latitude: 37.58525889377292
  - longitude: 128.3231539238482
  - confidence: 110
  - query: 휘닉스 컨트리클럽 평창군 (keyword)
  - 이유: query="휘닉스 컨트리클럽 평창군" score=110

- **후보 3**
  - place_name: 휘닉스평창휘닉스CC 전기차충전소
  - address_name: 강원특별자치도 평창군 봉평면 면온리 1120
  - road_address_name: 강원특별자치도 평창군 봉평면 태기로 174
  - latitude: 37.5825419589855
  - longitude: 128.326740890725
  - confidence: 110
  - query: 휘닉스 컨트리클럽 평창군 (keyword)
  - 이유: query="휘닉스 컨트리클럽 평창군" score=110

- **후보 4**
  - place_name: 휘닉스평창태기산CC 전기차충전소
  - address_name: 강원특별자치도 평창군 봉평면 면온리 1120
  - road_address_name: 강원특별자치도 평창군 봉평면 태기로 174
  - latitude: 37.5825419589855
  - longitude: 128.326740890725
  - confidence: 110
  - query: 휘닉스 컨트리클럽 평창군 (keyword)
  - 이유: query="휘닉스 컨트리클럽 평창군" score=110

#### Cursor 추천

- **추천 후보 1:** 휘닉스평창 휘닉스CC
- **추천 이유:** 동점/근접 score (110 vs 110) — 자동 확정 불가
- **사용자 선택 필요:** 예

### 로제비앙GC

- **id:** gc-4cbc2f4feecc
- **region / city:** 경기 / 광주시
- **original address:** 경기도 광주시 곤지암읍 오항길 180
- **query:** 로제비앙GC 광주시

#### 후보

- **후보 1**
  - place_name: 로제비앙 GC 곤지암
  - address_name: 경기 광주시 곤지암읍 오향리 156-1
  - road_address_name: 경기 광주시 곤지암읍 오향길 180
  - latitude: 37.3855718887826
  - longitude: 127.373011089799
  - confidence: 110
  - query: 로제비앙GC 광주시 (keyword)
  - 이유: query="로제비앙GC 광주시" score=110

- **후보 2**
  - place_name: 경기광주 대광로제비앙GC 1 전기차충전소
  - address_name: 경기 광주시 곤지암읍 오향리 156-1
  - road_address_name: 경기 광주시 곤지암읍 오향길 180
  - latitude: 37.38019947596288
  - longitude: 127.37232396233195
  - confidence: 110
  - query: 로제비앙GC 광주시 (keyword)
  - 이유: query="로제비앙GC 광주시" score=110

- **후보 3**
  - place_name: 경기광주 대광로제비앙GC 3 전기차충전소
  - address_name: 경기 광주시 곤지암읍 오향리 156-1
  - road_address_name: 경기 광주시 곤지암읍 오향길 180
  - latitude: 37.3801987470484
  - longitude: 127.372555421865
  - confidence: 110
  - query: 로제비앙GC 광주시 (keyword)
  - 이유: query="로제비앙GC 광주시" score=110

- **후보 4**
  - place_name: 경기광주 대광로제비앙GC 2 전기차충전소
  - address_name: 경기 광주시 곤지암읍 오향리 156-1
  - road_address_name: 경기 광주시 곤지암읍 오향길 180
  - latitude: 37.3799910533423
  - longitude: 127.372701175534
  - confidence: 110
  - query: 로제비앙GC 광주시 (keyword)
  - 이유: query="로제비앙GC 광주시" score=110

#### Cursor 추천

- **추천 후보 1:** 로제비앙 GC 곤지암
- **추천 이유:** 동점/근접 score (110 vs 110) — 자동 확정 불가
- **사용자 선택 필요:** 예

### 의령 리온컨트리클럽

- **id:** gc-f2927c01eff1
- **region / city:** 경상 / 의령군
- **original address:** 의령군 칠곡면 지굴산로 101-33
- **query:** 의령 리온컨트리클럽 의령군

#### 후보

- **후보 1**
  - place_name: 의령리온CC
  - address_name: 경남 의령군 칠곡면 외조리 740
  - road_address_name: 경남 의령군 칠곡면 자굴산로 101-33
  - latitude: 35.34950866638445
  - longitude: 128.1903049827595
  - confidence: 110
  - query: 의령 리온컨트리클럽 의령군 (keyword)
  - 이유: query="의령 리온컨트리클럽 의령군" score=110

- **후보 2**
  - place_name: 의령리온컨트리클럽 전기차충전소
  - address_name: 경남 의령군 칠곡면 외조리 740
  - road_address_name: 경남 의령군 칠곡면 자굴산로 101-33
  - latitude: 35.3495086663845
  - longitude: 128.190304982759
  - confidence: 110
  - query: 의령 리온컨트리클럽 의령군 (keyword)
  - 이유: query="의령 리온컨트리클럽 의령군" score=110

- **후보 3**
  - place_name: 롯데ATM BNK경남은행 리온CC
  - address_name: 경남 의령군 칠곡면 내조리 산 113
  - road_address_name: (none)
  - latitude: 35.3541772724271
  - longitude: 128.190117164796
  - confidence: 80
  - query: 의령 리온컨트리클럽 의령군 (keyword)
  - 이유: query="의령 리온컨트리클럽 의령군" score=80

- **후보 4**
  - place_name: BNK경남은행 365코너 리온CC
  - address_name: 경남 의령군 칠곡면 외조리 산 740
  - road_address_name: 경남 의령군 칠곡면 자굴산로 101-33
  - latitude: 35.35475271812024
  - longitude: 128.18860743910514
  - confidence: 80
  - query: 의령 리온컨트리클럽 의령군 (keyword)
  - 이유: query="의령 리온컨트리클럽 의령군" score=80

#### Cursor 추천

- **추천 후보 1:** 의령리온CC
- **추천 이유:** 동점/근접 score (110 vs 110) — 자동 확정 불가
- **사용자 선택 필요:** 예

### 칠곡아이위시C.C

- **id:** gc-bc41a2489944
- **region / city:** 경상 / 칠곡군
- **original address:** 경상북도 칠곡군 기산면 노석1길 49-112
- **query:** 칠곡아이위시C.C 칠곡군

#### 후보

- **후보 1**
  - place_name: 칠곡아이위시CC
  - address_name: 경북 칠곡군 기산면 노석리 992
  - road_address_name: 경북 칠곡군 기산면 도고산길 109
  - latitude: 35.94606901238291
  - longitude: 128.3769487092413
  - confidence: 110
  - query: 칠곡아이위시C.C 칠곡군 (keyword)
  - 이유: query="칠곡아이위시C.C 칠곡군" score=110

- **후보 2**
  - place_name: 아이위시 컨트리클럽 전기차충전소
  - address_name: 경북 칠곡군 기산면 노석리 992
  - road_address_name: 경북 칠곡군 기산면 도고산길 109
  - latitude: 35.9466391846033
  - longitude: 128.377835227037
  - confidence: 110
  - query: 칠곡아이위시C.C 칠곡군 (keyword)
  - 이유: query="칠곡아이위시C.C 칠곡군" score=110

#### Cursor 추천

- **추천 후보 1:** 칠곡아이위시CC
- **추천 이유:** 동점/근접 score (110 vs 110) — 자동 확정 불가
- **사용자 선택 필요:** 예

### 부산컨트리클럽

- **id:** gc-485bb35864fb
- **region / city:** 경상 / 금정구
- **original address:** 부산광역시 금정구 중앙대로2327번길 11
- **query:** 부산컨트리클럽 금정구

#### 후보

- **후보 1**
  - place_name: 부산컨트리클럽
  - address_name: 부산 금정구 노포동 368
  - road_address_name: 부산 금정구 중앙대로2327번길 112
  - latitude: 35.2995211598539
  - longitude: 129.094333596075
  - confidence: 110
  - query: 부산컨트리클럽 금정구 (keyword)
  - 이유: query="부산컨트리클럽 금정구" score=110

- **후보 2**
  - place_name: 부산컨트리클럽 15홀티매점
  - address_name: 부산 금정구 노포동 368
  - road_address_name: 부산 금정구 중앙대로2327번길 112
  - latitude: 35.2995423968092
  - longitude: 129.094356127647
  - confidence: 110
  - query: 부산컨트리클럽 금정구 (keyword)
  - 이유: query="부산컨트리클럽 금정구" score=110

- **후보 3**
  - place_name: 부산CC 주차장
  - address_name: 부산 금정구 노포동 368
  - road_address_name: 부산 금정구 중앙대로2327번길 112
  - latitude: 35.3002288070106
  - longitude: 129.094474949344
  - confidence: 80
  - query: 부산컨트리클럽 금정구 (keyword)
  - 이유: query="부산컨트리클럽 금정구" score=80

- **후보 4**
  - place_name: 홈씨씨인테리어 부산금정점
  - address_name: 부산 금정구 부곡동 269-1
  - road_address_name: 부산 금정구 중앙대로 1628
  - latitude: 35.2295056744682
  - longitude: 129.091438097471
  - confidence: 80
  - query: 부산컨트리클럽 금정구 (keyword)
  - 이유: query="부산컨트리클럽 금정구" score=80

- **후보 5**
  - place_name: 웰메이드 부산CC점
  - address_name: 부산 금정구 노포동 368
  - road_address_name: 부산 금정구 중앙대로2327번길 112
  - latitude: 35.2956397105586
  - longitude: 129.094972187835
  - confidence: 80
  - query: 부산컨트리클럽 (keyword)
  - 이유: query="부산컨트리클럽" score=80

#### Cursor 추천

- **추천 후보 1:** 부산컨트리클럽
- **추천 이유:** 동점/근접 score (110 vs 110) — 자동 확정 불가
- **사용자 선택 필요:** 예

### 기장동원로얄컨트리클럽

- **id:** gc-80348568c7d7
- **region / city:** 경상 / 기장군
- **original address:** 부산광역시 기장군 기장읍 반송로 1345-52
- **query:** 기장동원로얄컨트리클럽 기장군

#### 후보

- **후보 1**
  - place_name: 기장동원로얄CC
  - address_name: 부산 기장군 기장읍 만화리 104-5
  - road_address_name: 부산 기장군 기장읍 반송로 1345
  - latitude: 35.25254245153413
  - longitude: 129.18922395097297
  - confidence: 110
  - query: 기장동원로얄컨트리클럽 기장군 (keyword)
  - 이유: query="기장동원로얄컨트리클럽 기장군" score=110

- **후보 2**
  - place_name: 기장동원로얄CC 전기차충전소
  - address_name: 부산 기장군 기장읍 만화리 산 104-5
  - road_address_name: 부산 기장군 기장읍 반송로 1345
  - latitude: 35.2524996702654
  - longitude: 129.188699891132
  - confidence: 110
  - query: 기장동원로얄컨트리클럽 기장군 (keyword)
  - 이유: query="기장동원로얄컨트리클럽 기장군" score=110

- **후보 3**
  - place_name: 롯데ATM BNK부산은행 동원로얄CC
  - address_name: 부산 기장군 기장읍 만화리 산 104-5
  - road_address_name: (none)
  - latitude: 35.2525389680757
  - longitude: 129.189217265991
  - confidence: 110
  - query: 기장동원로얄컨트리클럽 기장군 (keyword)
  - 이유: query="기장동원로얄컨트리클럽 기장군" score=110

#### Cursor 추천

- **추천 후보 1:** 기장동원로얄CC
- **추천 이유:** 동점/근접 score (110 vs 110) — 자동 확정 불가
- **사용자 선택 필요:** 예

### 오렌지듄스 영종골프클럽

- **id:** gc-496303f3c77c
- **region / city:** 경기 / 인천시
- **original address:** 인천시 중구 운서동 2850-43번지 일원
- **query:** 오렌지듄스 영종골프클럽 인천시

#### 후보

- **후보 1**
  - place_name: 오렌지듄스영종GC
  - address_name: 인천 중구 운서동 3215
  - road_address_name: 인천 중구 영종해안남로321번길 184
  - latitude: 37.43446486081986
  - longitude: 126.455114630229
  - confidence: 110
  - query: 오렌지듄스 영종골프클럽 인천시 (keyword)
  - 이유: query="오렌지듄스 영종골프클럽 인천시" score=110

- **후보 2**
  - place_name: 오렌지듄스영종GC 주차장
  - address_name: 인천 중구 운서동 3215
  - road_address_name: 인천 중구 영종해안남로321번길 184
  - latitude: 37.4350165903157
  - longitude: 126.45557389119
  - confidence: 110
  - query: 오렌지듄스 영종골프클럽 인천시 (keyword)
  - 이유: query="오렌지듄스 영종골프클럽 인천시" score=110

#### Cursor 추천

- **추천 후보 1:** 오렌지듄스영종GC
- **추천 이유:** 동점/근접 score (110 vs 110) — 자동 확정 불가
- **사용자 선택 필요:** 예

### 파인힐스CC

- **id:** gc-95d86b96417d
- **region / city:** 전라 / 전남
- **original address:** 전남 순천시 주암면 송강사길 99
- **query:** 파인힐스CC 전남

#### 후보

- **후보 1**
  - place_name: 파인힐스골프&호텔
  - address_name: 전남 순천시 주암면 복다리 산 27
  - road_address_name: 전남 순천시 주암면 송광사길 99
  - latitude: 35.03465131087175
  - longitude: 127.27219789537146
  - confidence: 110
  - query: 파인힐스CC 전남 (keyword)
  - 이유: query="파인힐스CC 전남" score=110

- **후보 2**
  - place_name: 파인힐스CC 주차장
  - address_name: 전남 순천시 주암면 복다리 산 27
  - road_address_name: 전남 순천시 주암면 송광사길 99
  - latitude: 35.0341474781283
  - longitude: 127.271779789068
  - confidence: 110
  - query: 파인힐스CC 전남 (keyword)
  - 이유: query="파인힐스CC 전남" score=110

- **후보 3**
  - place_name: 런던로스트볼 순천신대점
  - address_name: 전남 순천시 해룡면 신대리 1988
  - road_address_name: 전남 순천시 해룡면 향매로 109
  - latitude: 34.93336603851472
  - longitude: 127.55135032586809
  - confidence: 80
  - query: 파인힐스CC 전남 (keyword)
  - 이유: query="파인힐스CC 전남" score=80

- **후보 4**
  - place_name: 신동파인힐스
  - address_name: 경북 칠곡군 지천면 송정리 산 7-18
  - road_address_name: 경북 칠곡군 지천면 송정원곡길 8
  - latitude: 35.9618849825189
  - longitude: 128.47582017358823
  - confidence: 50
  - query: 파인힐스CC (keyword)
  - 이유: query="파인힐스CC" score=50

#### Cursor 추천

- **추천 후보 1:** 파인힐스골프&호텔
- **추천 이유:** 동점/근접 score (110 vs 110) — 자동 확정 불가
- **사용자 선택 필요:** 예

### 나주CC

- **id:** gc-dcb20414b48e
- **region / city:** 전라 / 전남
- **original address:** 전남 나주시 공산면 상방신포길 154-32
- **query:** 나주CC 전남

#### 후보

- **후보 1**
  - place_name: 나주컨트리클럽
  - address_name: 전남 나주시 공산면 상방리 1-1
  - road_address_name: 전남 나주시 공산면 상방신포길 160-27
  - latitude: 34.9420110168019
  - longitude: 126.63987065885
  - confidence: 80
  - query: 나주CC 전남 (keyword)
  - 이유: query="나주CC 전남" score=80

- **후보 2**
  - place_name: 나주힐스컨트리클럽
  - address_name: 전남 나주시 세지면 성산리 820
  - road_address_name: 전남 나주시 세지면 신지로 806
  - latitude: 34.8939024354908
  - longitude: 126.725676551784
  - confidence: 80
  - query: 나주CC 전남 (keyword)
  - 이유: query="나주CC 전남" score=80

- **후보 3**
  - place_name: 나주 남평 파크골프장
  - address_name: 전남 나주시 남평읍 서산리 103-1
  - road_address_name: (none)
  - latitude: 35.0327195226274
  - longitude: 126.856715232195
  - confidence: 80
  - query: 나주CC 전남 (keyword)
  - 이유: query="나주CC 전남" score=80

- **후보 4**
  - place_name: 나주 영산포 파크골프장
  - address_name: 전남 나주시 안창동 573
  - road_address_name: (none)
  - latitude: 35.00327889283726
  - longitude: 126.68739334249261
  - confidence: 80
  - query: 나주CC 전남 (keyword)
  - 이유: query="나주CC 전남" score=80

- **후보 5**
  - place_name: 나주상생파크골프장
  - address_name: 전남 나주시 금천면 원곡리 958
  - road_address_name: (none)
  - latitude: 35.0365213615384
  - longitude: 126.737900242208
  - confidence: 80
  - query: 나주CC 전남 (keyword)
  - 이유: query="나주CC 전남" score=80

#### Cursor 추천

- **추천 후보 1:** 나주컨트리클럽
- **추천 이유:** 동점/근접 score (80 vs 80) — 자동 확정 불가
- **사용자 선택 필요:** 예

### 나주힐스CC

- **id:** gc-2042973e4c2d
- **region / city:** 전라 / 전남
- **original address:** 전남 나주시 공산면 삼방신포길 160-27
- **query:** 나주힐스CC 전남

#### 후보

- **후보 1**
  - place_name: 나주힐스컨트리클럽
  - address_name: 전남 나주시 세지면 성산리 820
  - road_address_name: 전남 나주시 세지면 신지로 806
  - latitude: 34.8939024354908
  - longitude: 126.725676551784
  - confidence: 110
  - query: 나주힐스CC 전남 (keyword)
  - 이유: query="나주힐스CC 전남" score=110

- **후보 2**
  - place_name: 나주힐스cc 전기차충전소
  - address_name: 전남 나주시 세지면 성산리 810
  - road_address_name: 전남 나주시 세지면 신지로 806
  - latitude: 34.893881663995856
  - longitude: 126.72565911655782
  - confidence: 110
  - query: 나주힐스CC 전남 (keyword)
  - 이유: query="나주힐스CC 전남" score=110

#### Cursor 추천

- **추천 후보 1:** 나주힐스컨트리클럽
- **추천 이유:** 동점/근접 score (110 vs 110) — 자동 확정 불가
- **사용자 선택 필요:** 예

### 보성에덴CC

- **id:** gc-2d39844d8485
- **region / city:** 전라 / 전남
- **original address:** 전남 보성군 보성읍 쾌상리 1385
- **query:** 보성에덴CC 전남

#### 후보

- **후보 1**
  - place_name: 보성에덴CC
  - address_name: 전남 보성군 보성읍 쾌상리 산 251
  - road_address_name: (none)
  - latitude: 34.75212858802739
  - longitude: 127.05449058625757
  - confidence: 110
  - query: 보성에덴CC 전남 (keyword)
  - 이유: query="보성에덴CC 전남" score=110

- **후보 2**
  - place_name: 보성에덴CC 주차장
  - address_name: 전남 보성군 보성읍 쾌상리 산 164-1
  - road_address_name: (none)
  - latitude: 34.7518167772383
  - longitude: 127.054310177578
  - confidence: 110
  - query: 보성에덴CC 전남 (keyword)
  - 이유: query="보성에덴CC 전남" score=110

#### Cursor 추천

- **추천 후보 1:** 보성에덴CC
- **추천 이유:** 동점/근접 score (110 vs 110) — 자동 확정 불가
- **사용자 선택 필요:** 예

### 군산CC

- **id:** gc-14ba1ad9ac28
- **region / city:** 전라 / 전북특별자치도
- **original address:** 전북특별자치도 군산시 옥서면 남산군로 1685
- **query:** 군산CC 전북특별자치도

#### 후보

- **후보 1**
  - place_name: 군산CC
  - address_name: 전북특별자치도 군산시 옥서면 옥봉리 1741-1
  - road_address_name: 전북특별자치도 군산시 옥서면 남군산로 1685-53
  - latitude: 35.89445103834057
  - longitude: 126.6550889348115
  - confidence: 110
  - query: 군산CC 전북특별자치도 (keyword)
  - 이유: query="군산CC 전북특별자치도" score=110

- **후보 2**
  - place_name: 군산CC 골프텔
  - address_name: 전북특별자치도 군산시 옥구읍 어은리 1541
  - road_address_name: 전북특별자치도 군산시 옥구읍 남군산로 1685
  - latitude: 35.897278416437864
  - longitude: 126.66084643456863
  - confidence: 110
  - query: 군산CC 전북특별자치도 (keyword)
  - 이유: query="군산CC 전북특별자치도" score=110

- **후보 3**
  - place_name: 군산CC 주차장
  - address_name: 전북특별자치도 군산시 옥서면 옥봉리 1715-4
  - road_address_name: (none)
  - latitude: 35.89499509546097
  - longitude: 126.65655860338312
  - confidence: 110
  - query: 군산CC 전북특별자치도 (keyword)
  - 이유: query="군산CC 전북특별자치도" score=110

- **후보 4**
  - place_name: GS25 군산CC골프장점
  - address_name: 전북특별자치도 군산시 옥구읍 어은리 1541
  - road_address_name: 전북특별자치도 군산시 옥구읍 남군산로 1685
  - latitude: 35.8973354445063
  - longitude: 126.66061579929
  - confidence: 110
  - query: 군산CC (keyword)
  - 이유: query="군산CC" score=110

- **후보 5**
  - place_name: 군산수송공원 파크골프장
  - address_name: 전북특별자치도 군산시 수송동 851
  - road_address_name: (none)
  - latitude: 35.9651599531782
  - longitude: 126.721123721399
  - confidence: 80
  - query: 군산CC 전북특별자치도 (keyword)
  - 이유: query="군산CC 전북특별자치도" score=80

#### Cursor 추천

- **추천 후보 1:** 군산CC
- **추천 이유:** 동점/근접 score (110 vs 110) — 자동 확정 불가
- **사용자 선택 필요:** 예

### 골드리버CC

- **id:** gc-46caa66a0c89
- **region / city:** 충청 / 공주시
- **original address:** 공주시 의당면 신정말길 67-133(청룡리)
- **query:** 골드리버CC 공주시

#### 후보

- **후보 1**
  - place_name: 골드리버CC
  - address_name: 충남 공주시 의당면 청룡리 220-2
  - road_address_name: 충남 공주시 의당면 신성말길 67-38
  - latitude: 36.5036543820055
  - longitude: 127.163327403034
  - confidence: 110
  - query: 골드리버CC 공주시 (keyword)
  - 이유: query="골드리버CC 공주시" score=110

- **후보 2**
  - place_name: 골드리버CC 주차장
  - address_name: 충남 공주시 의당면 청룡리 220-2
  - road_address_name: 충남 공주시 의당면 신성말길 67-38
  - latitude: 36.50339891221129
  - longitude: 127.16299199750617
  - confidence: 110
  - query: 골드리버CC 공주시 (keyword)
  - 이유: query="골드리버CC 공주시" score=110

- **후보 3**
  - place_name: 골드리버CC 전기차충전소
  - address_name: 충남 공주시 의당면 청룡리 221-3
  - road_address_name: (none)
  - latitude: 36.5034576091728
  - longitude: 127.162902822095
  - confidence: 110
  - query: 골드리버CC 공주시 (keyword)
  - 이유: query="골드리버CC 공주시" score=110

- **후보 4**
  - place_name: 골드리버골프클럽
  - address_name: 부산 사상구 엄궁동 143-4
  - road_address_name: 부산 사상구 낙동대로 672-42
  - latitude: 35.12314203659
  - longitude: 128.966512890514
  - confidence: 50
  - query: 골드리버CC (keyword)
  - 이유: query="골드리버CC" score=50

- **후보 5**
  - place_name: 골드리버골프클럽 전기차충전소
  - address_name: 부산 사상구 엄궁동 143-4
  - road_address_name: 부산 사상구 낙동대로 672-42
  - latitude: 35.1231411535528
  - longitude: 128.966511772424
  - confidence: 50
  - query: 골드리버CC (keyword)
  - 이유: query="골드리버CC" score=50

#### Cursor 추천

- **추천 후보 1:** 골드리버CC
- **추천 이유:** 동점/근접 score (110 vs 110) — 자동 확정 불가
- **사용자 선택 필요:** 예

### 골든베이골프&리조트

- **id:** gc-b21ce78f76ca
- **region / city:** 충청 / 태안군
- **original address:** 태안군 근흥면 정선포로 217
- **query:** 골든베이골프&리조트 태안군

#### 후보

- **후보 1**
  - place_name: 골든베이골프&리조트
  - address_name: 충남 태안군 근흥면 정죽리 386-1
  - road_address_name: 충남 태안군 근흥면 정산포로 217
  - latitude: 36.710103009972
  - longitude: 126.172537879751
  - confidence: 110
  - query: 골든베이골프&리조트 태안군 (keyword)
  - 이유: query="골든베이골프&리조트 태안군" score=110

- **후보 2**
  - place_name: 골든베이골프&리조트 클럽하우스
  - address_name: 충남 태안군 근흥면 정죽리 386-1
  - road_address_name: 충남 태안군 근흥면 정산포로 217
  - latitude: 36.710913031258
  - longitude: 126.172009888817
  - confidence: 110
  - query: 골든베이골프&리조트 태안군 (keyword)
  - 이유: query="골든베이골프&리조트 태안군" score=110

#### Cursor 추천

- **추천 후보 1:** 골든베이골프&리조트
- **추천 이유:** 동점/근접 score (110 vs 110) — 자동 확정 불가
- **사용자 선택 필요:** 예

### 스톤비치컨트리클럽

- **id:** gc-2abf3143e489
- **region / city:** 충청 / 태안군
- **original address:** 태안군 근흥면 갈음이길 88
- **query:** 스톤비치컨트리클럽 태안군

#### 후보

- **후보 1**
  - place_name: 스톤비치
  - address_name: 충남 태안군 근흥면 정죽리 2261-1
  - road_address_name: 충남 태안군 근흥면 갈음이길 77
  - latitude: 36.68774457239597
  - longitude: 126.1540277230728
  - confidence: 110
  - query: 스톤비치컨트리클럽 태안군 (keyword)
  - 이유: query="스톤비치컨트리클럽 태안군" score=110

- **후보 2**
  - place_name: BMW차징스테이션 스톤비치CC 전기차충전소
  - address_name: 충남 태안군 근흥면 정죽리 2261-1
  - road_address_name: 충남 태안군 근흥면 갈음이길 77
  - latitude: 36.6878280494335
  - longitude: 126.154362465317
  - confidence: 110
  - query: 스톤비치컨트리클럽 태안군 (keyword)
  - 이유: query="스톤비치컨트리클럽 태안군" score=110

#### Cursor 추천

- **추천 후보 1:** 스톤비치
- **추천 이유:** 동점/근접 score (110 vs 110) — 자동 확정 불가
- **사용자 선택 필요:** 예

### 그랜드cc

- **id:** gc-81f36c789316
- **region / city:** 충청 / 청주시
- **original address:** 청주시 청원군 오창읍 꽃화산길 14
- **query:** 그랜드cc 청주시

#### 후보

- **후보 1**
  - place_name: 그랜드CC
  - address_name: 충북 청주시 청원구 오창읍 화산리 163-2
  - road_address_name: 충북 청주시 청원구 오창읍 꽃화산길 51-20
  - latitude: 36.72191611326156
  - longitude: 127.38337956461453
  - confidence: 110
  - query: 그랜드cc 청주시 (keyword)
  - 이유: query="그랜드cc 청주시" score=110

- **후보 2**
  - place_name: 그랜드CC 주차장
  - address_name: 충북 청주시 청원구 오창읍 화산리 163-2
  - road_address_name: 충북 청주시 청원구 오창읍 꽃화산길 51-20
  - latitude: 36.722659758436
  - longitude: 127.383030653235
  - confidence: 110
  - query: 그랜드cc 청주시 (keyword)
  - 이유: query="그랜드cc 청주시" score=110

- **후보 3**
  - place_name: 그랜드골프클럽
  - address_name: 충북 청주시 청원구 율량동 500-3
  - road_address_name: 충북 청주시 청원구 충청대로 114
  - latitude: 36.6665552337471
  - longitude: 127.494490071993
  - confidence: 110
  - query: 그랜드cc 청주시 (keyword)
  - 이유: query="그랜드cc 청주시" score=110

- **후보 4**
  - place_name: 청주 그랜드 CC 전기차충전소
  - address_name: 충북 청주시 청원구 오창읍 화산리 163-2
  - road_address_name: 충북 청주시 청원구 오창읍 꽃화산길 51-20
  - latitude: 36.72191611324295
  - longitude: 127.38337956461218
  - confidence: 110
  - query: 그랜드cc 청주시 (keyword)
  - 이유: query="그랜드cc 청주시" score=110

- **후보 5**
  - place_name: 인천그랜드CC
  - address_name: 인천 서구 원창동 380
  - road_address_name: 인천 서구 원석로 195
  - latitude: 37.51374380990363
  - longitude: 126.64118062962669
  - confidence: 50
  - query: 그랜드cc (keyword)
  - 이유: query="그랜드cc" score=50

#### Cursor 추천

- **추천 후보 1:** 그랜드CC
- **추천 이유:** 동점/근접 score (110 vs 110) — 자동 확정 불가
- **사용자 선택 필요:** 예

### 썬밸리cc

- **id:** gc-ac8ec878e912
- **region / city:** 충청 / 음성군
- **original address:** 음성군 삼성면 법말길 49
- **query:** 썬밸리cc 음성군

#### 후보

- **후보 1**
  - place_name: 썬밸리CC
  - address_name: 충북 음성군 삼성면 대사리 392
  - road_address_name: 충북 음성군 삼성면 범말길 49
  - latitude: 37.03597543990849
  - longitude: 127.4648736095017
  - confidence: 110
  - query: 썬밸리cc 음성군 (keyword)
  - 이유: query="썬밸리cc 음성군" score=110

- **후보 2**
  - place_name: 썬밸리CC 주차장
  - address_name: 충북 음성군 삼성면 대사리 392
  - road_address_name: 충북 음성군 삼성면 범말길 49
  - latitude: 37.0354016361298
  - longitude: 127.465288224489
  - confidence: 110
  - query: 썬밸리cc 음성군 (keyword)
  - 이유: query="썬밸리cc 음성군" score=110

- **후보 3**
  - place_name: 하나은행365 썬밸리CC클럽하우스
  - address_name: 충북 음성군 삼성면 대사리 392
  - road_address_name: 충북 음성군 삼성면 범말길 49
  - latitude: 37.0359921678546
  - longitude: 127.464973744619
  - confidence: 110
  - query: 썬밸리cc 음성군 (keyword)
  - 이유: query="썬밸리cc 음성군" score=110

- **후보 4**
  - place_name: 썬밸리컨트리클럽 전기차충전소
  - address_name: 충북 음성군 삼성면 대사리 392
  - road_address_name: 충북 음성군 삼성면 범말길 49
  - latitude: 37.03570784008521
  - longitude: 127.4644089051695
  - confidence: 110
  - query: 썬밸리cc 음성군 (keyword)
  - 이유: query="썬밸리cc 음성군" score=110

- **후보 5**
  - place_name: 하나은행365 썬밸리CC클럽하우스2
  - address_name: 충북 음성군 삼성면 대사리 392
  - road_address_name: 충북 음성군 삼성면 범말길 49
  - latitude: 37.0359921678546
  - longitude: 127.464973744619
  - confidence: 110
  - query: 썬밸리cc 음성군 (keyword)
  - 이유: query="썬밸리cc 음성군" score=110

#### Cursor 추천

- **추천 후보 1:** 썬밸리CC
- **추천 이유:** 동점/근접 score (110 vs 110) — 자동 확정 불가
- **사용자 선택 필요:** 예

### 골드나인cc

- **id:** gc-663ebcd52f5e
- **region / city:** 충청 / 청주시
- **original address:** 청주시 청원구 낭성면 산성로 1520-17
- **query:** 골드나인cc 청주시

#### 후보

- **후보 1**
  - place_name: 골드나인CC
  - address_name: 충북 청주시 상당구 낭성면 호정리 170-1
  - road_address_name: 충북 청주시 상당구 낭성면 산성로 1520-71
  - latitude: 36.61643622861368
  - longitude: 127.618228034197
  - confidence: 110
  - query: 골드나인cc 청주시 (keyword)
  - 이유: query="골드나인cc 청주시" score=110

- **후보 2**
  - place_name: 골드나인CC 주차장
  - address_name: 충북 청주시 상당구 낭성면 호정리 170-1
  - road_address_name: 충북 청주시 상당구 낭성면 산성로 1520-71
  - latitude: 36.6168833153253
  - longitude: 127.618376923684
  - confidence: 110
  - query: 골드나인cc 청주시 (keyword)
  - 이유: query="골드나인cc 청주시" score=110

- **후보 3**
  - place_name: 골드나인컨트리클럽 그늘집
  - address_name: 충북 청주시 상당구 낭성면 호정리 170-1
  - road_address_name: 충북 청주시 상당구 낭성면 산성로 1520-71
  - latitude: 36.61389720231298
  - longitude: 127.61729228371952
  - confidence: 110
  - query: 골드나인cc 청주시 (keyword)
  - 이유: query="골드나인cc 청주시" score=110

- **후보 4**
  - place_name: 청주골드나인cc 전기차충전소
  - address_name: 충북 청주시 상당구 낭성면 호정리 170-1
  - road_address_name: 충북 청주시 상당구 낭성면 산성로 1520-71
  - latitude: 36.61712865592231
  - longitude: 127.61919938435796
  - confidence: 110
  - query: 골드나인cc 청주시 (keyword)
  - 이유: query="골드나인cc 청주시" score=110

#### Cursor 추천

- **추천 후보 1:** 골드나인CC
- **추천 이유:** 동점/근접 score (110 vs 110) — 자동 확정 불가
- **사용자 선택 필요:** 예

### 일레븐cc

- **id:** gc-e14661a32922
- **region / city:** 충청 / 충주시
- **original address:** 충주시 앙성면 본평리 산 43-1
- **query:** 일레븐cc 충주시

#### 후보

- **후보 1**
  - place_name: 일레븐CC
  - address_name: 충북 충주시 앙성면 본평리 984
  - road_address_name: 충북 충주시 앙성면 북부로 980
  - latitude: 37.09362079025461
  - longitude: 127.73566843596551
  - confidence: 110
  - query: 일레븐cc 충주시 (keyword)
  - 이유: query="일레븐cc 충주시" score=110

- **후보 2**
  - place_name: 일레븐컨트리클럽(충주) 전기차충전소
  - address_name: 충북 충주시 앙성면 본평리 984
  - road_address_name: 충북 충주시 앙성면 북부로 980
  - latitude: 37.0936620405979
  - longitude: 127.735700329267
  - confidence: 110
  - query: 일레븐cc 충주시 (keyword)
  - 이유: query="일레븐cc 충주시" score=110

- **후보 3**
  - place_name: 앙성상촌식당
  - address_name: 충북 충주시 앙성면 지당리 695-2
  - road_address_name: 충북 충주시 앙성면 상대촌2길 1
  - latitude: 37.0882031932627
  - longitude: 127.708370751763
  - confidence: 80
  - query: 일레븐cc 충주시 (keyword)
  - 이유: query="일레븐cc 충주시" score=80

- **후보 4**
  - place_name: 정가네명태 앙성점
  - address_name: 충북 충주시 앙성면 본평리 879
  - road_address_name: 충북 충주시 앙성면 구장터길 32
  - latitude: 37.107590703060474
  - longitude: 127.74216096650923
  - confidence: 80
  - query: 일레븐cc 충주시 (keyword)
  - 이유: query="일레븐cc 충주시" score=80

- **후보 5**
  - place_name: 세븐일레븐 용인화산CC점
  - address_name: 경기 용인시 처인구 이동읍 화산리 441-1
  - road_address_name: 경기 용인시 처인구 이동읍 화산로 114
  - latitude: 37.1456452726322
  - longitude: 127.21368464812
  - confidence: 50
  - query: 일레븐cc (keyword)
  - 이유: query="일레븐cc" score=50

#### Cursor 추천

- **추천 후보 1:** 일레븐CC
- **추천 이유:** 동점/근접 score (110 vs 110) — 자동 확정 불가
- **사용자 선택 필요:** 예

### 킹스데일cc

- **id:** gc-8d9ee33d1f22
- **region / city:** 충청 / 충주시
- **original address:** 충주시 주덕면 기업도시3로 2
- **query:** 킹스데일cc 충주시

#### 후보

- **후보 1**
  - place_name: 킹스데일GC
  - address_name: 충북 충주시 주덕읍 화곡리 1097
  - road_address_name: 충북 충주시 주덕읍 기업도시3로 2
  - latitude: 37.01791643665307
  - longitude: 127.81649261557968
  - confidence: 110
  - query: 킹스데일cc 충주시 (keyword)
  - 이유: query="킹스데일cc 충주시" score=110

- **후보 2**
  - place_name: 킹스데일GC 주차장
  - address_name: 충북 충주시 주덕읍 화곡리 1097
  - road_address_name: 충북 충주시 주덕읍 기업도시3로 2
  - latitude: 37.0184081905964
  - longitude: 127.81704848437593
  - confidence: 110
  - query: 킹스데일cc 충주시 (keyword)
  - 이유: query="킹스데일cc 충주시" score=110

- **후보 3**
  - place_name: 제주하르방해장국
  - address_name: 충북 충주시 중앙탑면 용전리 770
  - road_address_name: 충북 충주시 중앙탑면 원앙길 7
  - latitude: 37.01732163769424
  - longitude: 127.823938438196
  - confidence: 60
  - query: 킹스데일cc 충주시 (keyword)
  - 이유: query="킹스데일cc 충주시" score=60

#### Cursor 추천

- **추천 후보 1:** 킹스데일GC
- **추천 이유:** 동점/근접 score (110 vs 110) — 자동 확정 불가
- **사용자 선택 필요:** 예

### 청통골프장

- **id:** gc-01d6a94bf335
- **region / city:** 경상 / 영천시
- **original address:** 경상북도 영천시 청통면 청통로 733
- **query:** 청통골프장 영천시

#### 후보

- **후보 1**
  - place_name: 청통CC교차로
  - address_name: 경북 영천시 청통면 계포리 291
  - road_address_name: (none)
  - latitude: 35.99486749092
  - longitude: 128.814660293665
  - confidence: 80
  - query: 청통골프장 영천시 (keyword)
  - 이유: query="청통골프장 영천시" score=80

- **후보 2**
  - place_name: 시엘골프클럽
  - address_name: 경북 영천시 청통면 우천리 1270
  - road_address_name: 경북 영천시 청통면 청통로 334-41
  - latitude: 35.9932866998431
  - longitude: 128.857176241203
  - confidence: 80
  - query: 청통골프장 영천시 (keyword)
  - 이유: query="청통골프장 영천시" score=80

- **후보 3**
  - place_name: 시엘골프클럽 주차장
  - address_name: 경북 영천시 청통면 보성리 32-3
  - road_address_name: 경북 영천시 청통면 청통로 334-41
  - latitude: 35.9930929615949
  - longitude: 128.856652772548
  - confidence: 80
  - query: 청통골프장 영천시 (keyword)
  - 이유: query="청통골프장 영천시" score=80

- **후보 4**
  - place_name: 골프존카운티 청통
  - address_name: 경북 영천시 청통면 송천리 661-1
  - road_address_name: 경북 영천시 청통면 은해사로 49-77
  - latitude: 35.98803009926189
  - longitude: 128.8119113885776
  - confidence: 80
  - query: 청통골프장 영천시 (keyword)
  - 이유: query="청통골프장 영천시" score=80

- **후보 5**
  - place_name: 골프존카운티(청통CC) 전기차충전소
  - address_name: 경북 영천시 청통면 송천리 산 42
  - road_address_name: 경북 영천시 청통면 관방길 43-1
  - latitude: 35.972562432982
  - longitude: 128.816641483056
  - confidence: 80
  - query: 청통골프장 영천시 (keyword)
  - 이유: query="청통골프장 영천시" score=80

#### Cursor 추천

- **추천 후보 1:** 청통CC교차로
- **추천 이유:** 동점/근접 score (80 vs 80) — 자동 확정 불가
- **사용자 선택 필요:** 예

## no_result retry

### 휘닉스대중골프장

- **id:** gc-716264430902
- **region / city:** 강원 / 평창군
- **original address:** 평창군 봉평면 태기로 227-84
- **retry queries (26):** 휘닉스대중골프장 | 휘닉스대중골프장 골프장 | 휘닉스대중골프장 CC | 휘닉스대중골프장 컨트리클럽 | 휘닉스대중골프장 평창군 | 휘닉스대중골프장 강원 | 평창군 휘닉스대중골프장 | 휘닉스대중골프장 강원특별자치도 평창군 봉평면 태기로 227-84 | ...
- **retry status:** no_result
- **winning query:** (none)
- **confidence:** 0
- **자동 반영:** 불가

### 몽베르 컨트리클럽(비회원제)

- **id:** gc-9d709ff43c33
- **region / city:** 경기 / 포천시
- **original address:** 경기도 포천시 영북면 산정호수로 359-13
- **retry queries (49):** 몽베르 컨트리클럽(비회원제) | 몽베르 컨트리클럽(비회원제) 골프장 | 몽베르 컨트리클럽(비회원제) CC | 몽베르 컨트리클럽(비회원제) 컨트리클럽 | 몽베르 컨트리클럽(비회원제) 포천시 | 몽베르 컨트리클럽(비회원제) 경기 | 포천시 몽베르 컨트리클럽(비회원제) | 몽베르 컨트리클럽(비회원제) 경기도 포천시 영북면 산정호수로 359-13 | ...
- **retry status:** multiple_candidates
- **winning query:** 몽베르 컨트리클럽
- **confidence:** 110
- **자동 반영:** 불가

#### retry 후보

- **후보 1**
  - place_name: 몽베르컨트리클럽
  - address_name: 경기 포천시 영북면 산정리 산 60
  - road_address_name: 경기 포천시 영북면 산정호수로 359-12
  - latitude: 38.08433182966815
  - longitude: 127.3117509555886
  - confidence: 110
  - query: 몽베르 컨트리클럽 (keyword)
  - 이유: retry keyword query="몽베르 컨트리클럽"

- **후보 2**
  - place_name: 몽베르CC 퍼블릭코스
  - address_name: 경기 포천시 영북면 산정리 558-1
  - road_address_name: 경기 포천시 영북면 산정호수로 359-12
  - latitude: 38.07979193981106
  - longitude: 127.30977698625205
  - confidence: 110
  - query: 몽베르 컨트리클럽 (keyword)
  - 이유: retry keyword query="몽베르 컨트리클럽"

- **후보 3**
  - place_name: 몽베르CC 클럽하우스
  - address_name: 경기 포천시 영북면 산정리 558-1
  - road_address_name: 경기 포천시 영북면 산정호수로 359-12
  - latitude: 38.0843001922228
  - longitude: 127.311790715412
  - confidence: 110
  - query: 몽베르 컨트리클럽 (keyword)
  - 이유: retry keyword query="몽베르 컨트리클럽"

- **후보 4**
  - place_name: 몽베르CC 주차장
  - address_name: 경기 포천시 영북면 산정리 558-1
  - road_address_name: 경기 포천시 영북면 산정호수로 359-12
  - latitude: 38.08351543819254
  - longitude: 127.31215212550507
  - confidence: 110
  - query: 몽베르 컨트리클럽 (keyword)
  - 이유: retry keyword query="몽베르 컨트리클럽"

- **후보 5**
  - place_name: BMW차징스테이션 몽베르CC 전기차충전소
  - address_name: 경기 포천시 영북면 산정리 산 60
  - road_address_name: 경기 포천시 영북면 산정호수로 359-12
  - latitude: 38.073341301517104
  - longitude: 127.3056823194369
  - confidence: 110
  - query: 몽베르 컨트리클럽 (keyword)
  - 이유: retry keyword query="몽베르 컨트리클럽"

### 로얄링스1

- **id:** gc-bf183cd699c7
- **region / city:** 충청 / 태안군
- **original address:** 태안군 태안읍 반곡길 284
- **retry queries (9):** 로얄링스1 | 로얄링스1 골프장 | 로얄링스1 CC | 로얄링스1 컨트리클럽 | 로얄링스1 태안군 | 로얄링스1 충청 | 태안군 로얄링스1 | 로얄링스1 태안군 태안읍 반곡길 284 | ...
- **retry status:** no_result
- **winning query:** (none)
- **confidence:** 0
- **자동 반영:** 불가

### 로얄링스2

- **id:** gc-dbaa28f7b44e
- **region / city:** 충청 / 태안군
- **original address:** 태안군 태안읍 반곡길 284
- **retry queries (9):** 로얄링스2 | 로얄링스2 골프장 | 로얄링스2 CC | 로얄링스2 컨트리클럽 | 로얄링스2 태안군 | 로얄링스2 충청 | 태안군 로얄링스2 | 로얄링스2 태안군 태안읍 반곡길 284 | ...
- **retry status:** no_result
- **winning query:** (none)
- **confidence:** 0
- **자동 반영:** 불가

### 솔라고CC1

- **id:** gc-167a7f95d402
- **region / city:** 충청 / 태안군
- **original address:** 태안군 태안읍 소곳이길 92-234
- **retry queries (9):** 솔라고CC1 | 솔라고CC1 골프장 | 솔라고CC1 CC | 솔라고CC1 컨트리클럽 | 솔라고CC1 태안군 | 솔라고CC1 충청 | 태안군 솔라고CC1 | 솔라고CC1 태안군 태안읍 소곳이길 92-234 | ...
- **retry status:** no_result
- **winning query:** (none)
- **confidence:** 0
- **자동 반영:** 불가

### 솔라고CC2

- **id:** gc-d3a3acc83c4d
- **region / city:** 충청 / 태안군
- **original address:** 태안군 태안읍 소곳이길 92-234
- **retry queries (9):** 솔라고CC2 | 솔라고CC2 골프장 | 솔라고CC2 CC | 솔라고CC2 컨트리클럽 | 솔라고CC2 태안군 | 솔라고CC2 충청 | 태안군 솔라고CC2 | 솔라고CC2 태안군 태안읍 소곳이길 92-234 | ...
- **retry status:** no_result
- **winning query:** (none)
- **confidence:** 0
- **자동 반영:** 불가
