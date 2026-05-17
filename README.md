# 🍱 급식줄알리미

중·고등학교 급식 대기 인원을 실시간으로 보여주는 웹 앱입니다.  
Break Beam 적외선 센서(입구)와 반사형 적외선 센서(배식 완료 지점)를 Arduino/ESP32에 연결해 웹으로 데이터를 전송합니다.

---

## 기술 스택

- **Next.js 16** (App Router)
- **Tailwind CSS v4**
- **shadcn/ui** (CSS Variables, Neutral)
- **Firebase Realtime Database**
- **next-themes** (다크 모드)

---

## 로컬 실행 방법

### 1. 패키지 설치

```bash
npm install
```

### 2. 환경변수 설정

```bash
# .env.example을 복사해 .env.local 생성
cp .env.example .env.local
```

> **Firebase 없이 즉시 테스트하려면** `.env.local`의 `NEXT_PUBLIC_FIREBASE_PROJECT_ID` 값을  
> `demo-cafeteria` 로 유지하면 됩니다. 화면 하단의 **DEV ONLY 패널**로 인원을 조작할 수 있습니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

---

## Firebase 연동 방법

1. [Firebase 콘솔](https://console.firebase.google.com/)에서 새 프로젝트 생성
2. **Realtime Database** 활성화 (규칙: 테스트 모드로 시작)
3. **프로젝트 설정 > 서비스 계정 > 새 비공개 키 생성** 후 `.env.local`에 입력
4. **프로젝트 설정 > 내 앱 > 웹 앱 구성** 값을 `.env.local`에 입력
5. `NEXT_PUBLIC_FIREBASE_PROJECT_ID`를 실제 프로젝트 ID로 변경

---

## API 엔드포인트

### 센서 데이터 수신 (Arduino → 서버)

```
GET /api/sensor?type=enter&key={SENSOR_API_KEY}   # 입장 (대기 인원 +1)
GET /api/sensor?type=exit&key={SENSOR_API_KEY}    # 배식 완료 (대기 인원 -1)
```

### 현황 조회 (웹 → 서버, 3초 폴링)

```
GET /api/status
```

### 로컬 테스트용 데모 API (Firebase 불필요)

```
GET  /api/demo                            # 현재 상태 조회
POST /api/demo  { action: "enter" }       # +1
POST /api/demo  { action: "exit" }        # -1
POST /api/demo  { action: "reset" }       # 0으로 초기화
POST /api/demo  { action: "set", value: N } # N명으로 설정
```

---

## Arduino ESP32 예제 코드

```cpp
#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid     = "학교WiFi이름";
const char* password = "WiFi비밀번호";
const char* serverUrl = "https://your-vercel-app.vercel.app";
const char* apiKey    = "여기에SENSOR_API_KEY입력";

// 입구 센서 핀 (Break Beam)
const int ENTER_SENSOR_PIN = 14;
// 배식 완료 센서 핀 (반사형)
const int EXIT_SENSOR_PIN  = 27;

bool enterLastState = HIGH;
bool exitLastState  = HIGH;

void sendSensorEvent(const char* type) {
  if (WiFi.status() != WL_CONNECTED) return;
  HTTPClient http;
  String url = String(serverUrl) + "/api/sensor?type=" + type + "&key=" + apiKey;
  http.begin(url);
  int code = http.GET();
  http.end();
}

void setup() {
  Serial.begin(115200);
  pinMode(ENTER_SENSOR_PIN, INPUT_PULLUP);
  pinMode(EXIT_SENSOR_PIN,  INPUT_PULLUP);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) delay(500);
  Serial.println("WiFi 연결 완료");
}

void loop() {
  bool enterNow = digitalRead(ENTER_SENSOR_PIN);
  bool exitNow  = digitalRead(EXIT_SENSOR_PIN);

  // 신호 하강 엣지(빔 차단) 감지
  if (enterLastState == HIGH && enterNow == LOW) {
    sendSensorEvent("enter");
    delay(200); // 디바운스
  }
  if (exitLastState == HIGH && exitNow == LOW) {
    sendSensorEvent("exit");
    delay(200);
  }

  enterLastState = enterNow;
  exitLastState  = exitNow;
  delay(10);
}
```

---

## 혼잡도 기준

| 단계 | 대기 인원 | 색상 |
|------|----------|------|
| 여유 | 0 ~ 10명 | 초록 |
| 보통 | 11 ~ 25명 | 노랑 |
| 혼잡 | 26 ~ 49명 | 주황 |
| 매우 혼잡 | 50명 이상 | 빨강 |

---

## Vercel 배포

```bash
npm install -g vercel
vercel
```

배포 후 Vercel 대시보드 > Environment Variables에 `.env.local` 값 입력

---

## 프로젝트 구조

```
thirdproject/
├── app/
│   ├── layout.tsx              # 루트 레이아웃 (ThemeProvider)
│   ├── page.tsx                # 메인 페이지
│   ├── globals.css             # shadcn CSS 변수 + Tailwind
│   └── api/
│       ├── sensor/route.ts     # 센서 이벤트 수신
│       ├── status/route.ts     # 현황 조회 (Firebase)
│       └── demo/route.ts       # 로컬 테스트용 인메모리 API
├── components/
│   ├── WaitingCounter.tsx      # 대기 인원 + 게이지 바
│   ├── EstimatedTime.tsx       # 예상 대기 시간
│   ├── StatusBadge.tsx         # 혼잡도 배지
│   ├── CountdownTimer.tsx      # 급식 시간 외 카운트다운
│   ├── ThemeToggle.tsx         # 다크/라이트 토글
│   └── DemoPanel.tsx           # 로컬 테스트 조작 패널
├── hooks/
│   └── useRealtimeStatus.ts    # 3초 Polling 훅
├── lib/
│   ├── firebase-admin.ts       # Firebase Admin SDK
│   ├── firebase-client.ts      # Firebase 클라이언트 SDK
│   ├── mealSchedule.ts         # 급식 시간 판단 유틸
│   ├── waitTime.ts             # 예상 시간 + 혼잡도 유틸
│   └── utils.ts                # cn() 유틸
├── .env.local                  # 로컬 환경변수 (Git 제외)
├── .env.example                # 환경변수 템플릿
└── PROJECT_PLAN.md             # 프로젝트 계획서
```
