# Work Log — mbti-balance

## 2026-04-06

### 세션 1 — 아이디에이션 → 구조 설계 → 초기 구현

---

### 🧭 시작점: 기술적 도전 설정

**프롬프트 흐름:**
> "백엔드와 프론트엔드가 분리된 정도의 기술적 도전을 해보고 싶어"

기존 Next.js 모놀리스(API Routes 포함) 구조에서 벗어나, 독립된 Express 서버를 운영하는 구조로 레벨업 결정.

**인지 과정:**
- 현재까지는 Next.js 하나로 모든 걸 해결 → 배포도 Vercel 하나
- 분리하면: 프론트(Vercel) ↔ 백엔드(별도 서버) 통신 구조 학습
- WebSocket/SSE 같은 실시간 기능이 "분리의 이유"로 가장 명확함

---

### 💡 아이디에이션: 폐기 아이디어 부활

**폐기된 아이디어 중 백엔드 분리로 가능해지는 것:**

| 아이디어 | 폐기 이유 | 부활 방법 |
|---------|---------|---------|
| 멀티플레이어 퀴즈 | WebSocket 기준 초과 | 백엔드 WebSocket 룸 |
| 그룹 채팅 앱 | WebSocket 기준 초과 | 동일 |
| 소셜 로그인 댓글 | OAuth + 실시간 | 백엔드 OAuth |
| 음악 차트 위젯 | 스크래핑 복잡도 | 백엔드 크론잡 |

→ **MBTI 주제 + 바이럴 가능성**으로 방향 전환

---

### 🎯 방향 확정: MBTI 실시간 밸런스 게임

**선택 이유:**
1. 실시간(SSE) → 백엔드 분리의 핵심 이유
2. MBTI별 통계 → 사회 비교 심리 → 바이럴 메커니즘
3. 밸런스 게임 포맷 → 검증된 콘텐츠 구조

**과금 문제 해결:**
- Railway 대신 **Render 무료 티어** 사용
- 슬립 방지: UptimeRobot으로 5분마다 핑

---

### 🏗️ 기술 스택 결정

```
Frontend: Next.js 16 + TypeScript + Tailwind → Vercel
Backend:  Express + TypeScript → Render (무료)
DB:       Supabase (PostgreSQL)
실시간:   SSE (Server-Sent Events)
```

**SSE vs WebSocket 선택 이유:**
- 투표 집계는 서버→클라이언트 **단방향** 스트림으로 충분
- SSE가 WebSocket보다 구현 단순, HTTP 기반
- 연결 해제 자동 처리(`req.on('close')`)

---

### 🔨 구현 내용 (Day 1)

#### 백엔드 구조
```
backend/src/
├── db/supabase.ts      ← Supabase 클라이언트 초기화
├── types/index.ts      ← 공통 타입 (Question, Vote, QuestionStats, SseClient)
├── routes/
│   ├── questions.ts    ← GET /questions, GET /questions/:id/stats
│   ├── votes.ts        ← POST /votes (투표 후 SSE 브로드캐스트 트리거)
│   └── stream.ts       ← GET /stream (SSE 연결 관리, broadcast() 함수)
└── index.ts            ← Express 서버, CORS 설정
```

**핵심 로직 — SSE 브로드캐스트:**
```typescript
// stream.ts
const clients: SseClient[] = []

export function broadcast(stats: QuestionStats) {
  const data = `data: ${JSON.stringify(stats)}\n\n`
  for (const client of clients) {
    client.res.write(data)
  }
}
```
- `POST /votes` 처리 후 통계 재계산 → `broadcast()` 호출
- 모든 연결된 클라이언트에게 실시간 푸시

#### 프론트엔드 구조
```
frontend/
├── app/
│   ├── page.tsx          ← 홈 (MBTI 선택)
│   ├── play/page.tsx     ← 게임 (Suspense 래퍼)
│   └── result/page.tsx   ← 결과 (Suspense 래퍼)
├── components/
│   ├── MbtiSelector.tsx  ← 16개 MBTI 그리드 선택
│   ├── PlayClient.tsx    ← 게임 진행 (SSE 구독, 투표)
│   ├── StatsBar.tsx      ← 실시간 통계 바 (전체 + MBTI별)
│   └── ResultClient.tsx  ← 결과 카드 + 공유 기능
├── lib/
│   ├── api.ts            ← 백엔드 호출 함수 + SSE 연결
│   └── mbti.ts           ← MBTI 목록, 색상, 이모지
└── types/index.ts        ← 공통 타입
```

**Next.js 16 주의사항:**
- `params`가 Promise로 변경됨 → `await params` 필요
- `useSearchParams`는 Suspense 안에서만 → `page.tsx`에서 Suspense로 래핑

**SSE 클라이언트 연결 패턴:**
```typescript
// lib/api.ts
export function createSSEConnection(onStats: (stats: QuestionStats) => void): EventSource {
  const es = new EventSource(`${API_URL}/stream`)
  es.onmessage = (event) => {
    const data = JSON.parse(event.data)
    if (data.type === 'connected') return
    onStats(data as QuestionStats)
  }
  return es
}
```
- `useEffect` cleanup에서 `es.close()` 호출 → 메모리 누수 방지

---

### 📊 데이터 설계

**Supabase 테이블:**
- `questions`: id, option_a, option_b, category, active
- `votes`: id, question_id, mbti, choice(A/B)

**30개 시드 데이터 카테고리:**
- 연애 (5), 일상 (5), 직장 (5), 음식 (5), 취향 (5), MBTI 특성 (5)

---

### 📋 다음 할 일

- [x] Supabase 프로젝트 생성 + schema.sql 실행
- [ ] 백엔드 `.env` 파일 작성 (variables/ 폴더)
- [ ] 프론트엔드 `.env.local` 파일 작성
- [ ] 로컬 dev 서버 실행 테스트 (`backend: npm run dev`, `frontend: npm run dev`)
- [ ] Render 배포 (backend)
- [ ] Vercel 배포 (frontend)
- [ ] UptimeRobot으로 슬립 방지 설정

---

## 세션 2 — Supabase 셋업

### 🗄️ Supabase 프로젝트 생성

**작업 내용:**
- Supabase MCP로 `mbti-balance` 프로젝트 생성 (리전: ap-northeast-2 서울)
- `schema.sql` 적용: `questions`, `votes` 테이블 + 인덱스 2개 + RLS 비활성화
- 시드 데이터 30개 INSERT (연애/일상/직장/음식/취향/MBTI 각 5개)
- `variables/supabase.md`에 Project URL, Anon Key, Service Key 저장

**Supabase 프로젝트 정보:**
- Project ID: `vdratxdcdqmnlwyyqcnk`
- Region: `ap-northeast-2` (서울)
- URL: `https://vdratxdcdqmnlwyyqcnk.supabase.co`

**RLS 비활성화 이유:**
- 백엔드 Express 서버가 `service_role` 키로 직접 접근하는 구조
- 클라이언트(브라우저)가 Supabase에 직접 붙지 않으므로 RLS 불필요

---

### 🤔 배운 것 / 의사결정

1. **SSE가 WebSocket보다 실시간 집계에 적합**: 단방향 스트림이면 충분할 때 SSE가 훨씬 구현이 간단하다.

2. **분리의 비용**: CORS 설정, 환경변수 2벌(backend/.env, frontend/.env.local), 배포 플랫폼 2개. Next.js 모놀리스 대비 복잡도가 확실히 올라감.

3. **Next.js 16의 변경사항**: `params`가 Promise로 변경. `useSearchParams`를 Suspense 없이 쓰면 빌드 에러.

4. **Render 무료 티어의 현실**: 15분 비활동 시 슬립 → UptimeRobot ping으로 우회. 개인 프로젝트에는 충분.
