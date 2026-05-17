# 급식줄알리미 (School Cafeteria Queue Alert) — 프로젝트 계획서

> 작성일: 2026-05-16  
> 작성자: AI 수석 웹 개발자

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 프로젝트명 | 급식줄알리미 |
| 타겟 사용자 | 중·고등학생 |
| 핵심 가치 | 급식 줄 대기 인원을 실시간으로 확인해 학생들이 효율적으로 급식 시간을 활용할 수 있도록 한다. |
| 배포 환경 | Vercel |

---

## 2. 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 15 (App Router) |
| 스타일링 | Tailwind CSS |
| UI 컴포넌트 | shadcn/ui |
| 데이터베이스 | Firebase Realtime Database |
| 실시간 업데이트 | Polling (3초 간격) |
| 하드웨어 | Arduino ESP32 + Break Beam 적외선 센서 × 2 |
| 배포 | Vercel |
| 환경변수 관리 | `.env.local` |

---

## 3. 시스템 아키텍처

```
[급식실 입구]                          [배식 완료 지점]
Break Beam 센서 (입장 감지)            반사형 센서 (배식 완료 감지)
        ↓                                      ↓
   Arduino ESP32 ←——————————————————— Arduino ESP32
        ↓  HTTP GET 요청 (학교 WiFi)            ↓  HTTP GET 요청
        ↓                                      ↓
   /api/sensor?type=enter               /api/sensor?type=exit
        ↓                                      ↓
        └──────────────┬────────────────────────┘
                       ↓
              Next.js API Route
                       ↓
            Firebase Realtime Database
              { waitingCount: N, ... }
                       ↓
            Next.js 클라이언트 (3초 Polling)
                       ↓
              학생 브라우저 화면 갱신
```

---

## 4. 핵심 기능 명세

### 4-1. 센서 API

**엔드포인트:** `GET /api/sensor`

| 쿼리 파라미터 | 값 | 설명 |
|---|---|---|
| `type` | `enter` | 급식실 입구 통과 (대기 인원 +1) |
| `type` | `exit` | 배식 완료 통과 (대기 인원 -1) |
| `key` | `{API_KEY}` | 인증용 시크릿 키 (무단 호출 방지) |

- `waitingCount`는 최솟값 0으로 보정 (음수 방지)
- Firebase Realtime Database에 카운터 즉시 업데이트

### 4-2. 실시간 현황 조회

**엔드포인트:** `GET /api/status`

응답 예시:
```json
{
  "waitingCount": 23,
  "estimatedWaitSeconds": 345,
  "isOpen": true,
  "nextMealTime": null,
  "updatedAt": "2026-05-16T11:30:00.000Z"
}
```

- 클라이언트는 3초마다 이 API를 폴링
- `isOpen`이 false이면 `nextMealTime`(다음 급식 시작까지 남은 시간) 반환

### 4-3. 예상 대기 시간 계산

```
예상 대기 시간(초) = 대기 인원 × 15초
```

- 1인당 평균 배식 시간: **15초 (고정값)**
- 표시 형식: `약 N분 미만`

### 4-4. 급식 시간 운영

| 구분 | 기본 시간대 | 비고 |
|------|------------|------|
| 점심 | 11:30 ~ 13:30 | `.env`로 변경 가능 |
| 저녁 | 17:30 ~ 19:00 | `.env`로 변경 가능 |

- 급식 시간 외: 다음 급식 시작까지 남은 시간 카운트다운 표시
- 급식 시작 시 대기 카운터 자동 초기화 (선택적 설정)

---

## 5. 페이지 구성

### 메인 페이지 `/`

**급식 시간 중 표시 항목:**
1. 현재 대기 인원 (크고 굵은 숫자)
2. 예상 대기 시간
3. 대기 인원 게이지 (시각적 바 또는 색상 등급)
4. 상태 인디케이터 (실시간 동기화 중)

**색상 등급 (대기 인원 기준):**
| 단계 | 인원 | 색상 |
|------|------|------|
| 여유 | 0~10명 | 초록 |
| 보통 | 11~25명 | 노랑 |
| 혼잡 | 26~49명 | 주황 |
| 매우 혼잡 | 50명~ | 빨강 |

**급식 시간 외 표시 항목:**
- 다음 급식까지 남은 시간 (카운트다운)
- 점심/저녁 구분 안내

---

## 6. 환경변수 (.env.local)

```env
# Firebase
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=

# 학교 정보
NEXT_PUBLIC_SCHOOL_NAME=수완완고등학교

# 센서 API 인증키
SENSOR_API_KEY=

# 급식 시간 (HH:MM 형식)
NEXT_PUBLIC_LUNCH_START=11:30
NEXT_PUBLIC_LUNCH_END=13:30
NEXT_PUBLIC_DINNER_START=17:30
NEXT_PUBLIC_DINNER_END=19:00

# 1인당 평균 배식 시간(초)
NEXT_PUBLIC_AVG_SERVE_SECONDS=15
```

---

## 7. 프로젝트 디렉토리 구조

```
급식줄알리미/
├── app/
│   ├── layout.tsx              # 루트 레이아웃 (dark mode 지원)
│   ├── page.tsx                # 메인 페이지
│   ├── globals.css
│   └── api/
│       ├── sensor/
│       │   └── route.ts        # 센서 데이터 수신 API
│       └── status/
│           └── route.ts        # 현황 조회 API
├── components/
│   ├── WaitingCounter.tsx      # 대기 인원 표시 컴포넌트
│   ├── EstimatedTime.tsx       # 예상 시간 컴포넌트
│   ├── StatusBadge.tsx         # 혼잡도 배지
│   ├── CountdownTimer.tsx      # 급식 시간 외 카운트다운
│   └── ThemeToggle.tsx         # 다크/라이트 모드 토글
├── lib/
│   ├── firebase.ts             # Firebase Admin SDK 초기화
│   ├── mealSchedule.ts         # 급식 시간 계산 유틸
│   └── waitTime.ts             # 예상 대기 시간 계산 유틸
├── hooks/
│   └── useRealtimeStatus.ts    # 3초 Polling 커스텀 훅
├── .env.local
├── .env.example
└── README.md
```

---

## 8. Arduino 연동 가이드 (참고)

ESP32가 센서 감지 시 아래 URL을 호출:

```
# 입장 감지 시
GET https://{배포URL}/api/sensor?type=enter&key={SENSOR_API_KEY}

# 배식 완료 감지 시
GET https://{배포URL}/api/sensor?type=exit&key={SENSOR_API_KEY}
```

---

## 9. 개발 순서 (Task Order)

1. [ ] Next.js 프로젝트 초기화 (with Tailwind, shadcn/ui)
2. [ ] Firebase 프로젝트 생성 및 연동 설정
3. [ ] 센서 API 라우트 구현 (`/api/sensor`)
4. [ ] 현황 조회 API 구현 (`/api/status`)
5. [ ] 급식 시간 판단 유틸 구현
6. [ ] Polling 커스텀 훅 구현
7. [ ] 메인 UI 컴포넌트 구현
8. [ ] 다크 모드 적용
9. [ ] Vercel 배포 설정

---

## 10. 미결 사항 (개발 중 확인 필요)

- Firebase 프로젝트 및 서비스 계정 키는 개발자가 직접 발급 후 `.env.local`에 입력 필요
- 학교 WiFi 방화벽 설정에 따라 Arduino → Vercel HTTPS 통신 가능 여부 현장 테스트 필요
- 급식 시작 시 카운터 자동 초기화 여부는 추후 결정 (현재: 수동 초기화 없음)
