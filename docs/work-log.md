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
- [x] 백엔드 `.env` 파일 작성 (variables/ 폴더)
- [x] 프론트엔드 `.env.local` 파일 작성
- [x] 로컬 dev 서버 실행 테스트
- [x] Render 배포 (backend)
- [x] Vercel 배포 (frontend)
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

---

## 세션 3 — 환경변수 세팅 · 로컬 테스트 · 배포

### 🔑 환경변수 세팅

`variables/supabase.md`의 키를 그대로 주입해 두 파일 생성:

- `backend/.env` — PORT, SUPABASE_URL, SUPABASE_SERVICE_KEY, FRONTEND_URL
- `frontend/.env.local` — NEXT_PUBLIC_API_URL

두 파일 모두 각 폴더 `.gitignore`에 포함 확인 완료.

---

### 🐛 버그 2개 발견 및 수정

**버그 1 — CORS 포트 충돌**

- 원인: 다른 프로젝트(world-flag-quiz)가 3000 포트를 점유하고 있어 mbti-balance 프론트가 3002에서 기동
- `backend/.env`의 `FRONTEND_URL=http://localhost:3000`이 실제와 불일치 → `Failed to fetch`
- 수정: `allowedOrigins` 배열에 3000~3003 전체 허용, origin이 배열 중 하나로 시작하면 통과

```typescript
// 수정 전
origin: process.env.FRONTEND_URL || 'http://localhost:3000'

// 수정 후
const allowedOrigins = [process.env.FRONTEND_URL, 'http://localhost:3000', ..., 'http://localhost:3003']
origin: (origin, callback) => {
  if (!origin || allowedOrigins.some((o) => origin.startsWith(o))) callback(null, true)
  else callback(new Error(`CORS 차단: ${origin}`))
}
```

**버그 2 — SSE stats 업데이트 안 됨**

- 원인: SSE 콜백의 조건 `prev?.question_id === newStats.question_id`
  - `prev`가 `null`이면 → `undefined === question_id` → `false` → stats가 영원히 null
- 수정: 조건 제거, `setStats(newStats)`로 단순화
  - UI 단에서 이미 `stats.question_id === question.id`로 필터링하므로 콜백에서 조건 불필요

---

### 🚀 배포

**GitHub 레포 생성 중 서브모듈 이슈**

`create-next-app`이 `frontend/` 안에 `.git` 폴더를 자동 생성 → 부모 레포에서 서브모듈(160000 mode)로 인식됨.

해결:
```bash
rm -rf frontend/.git
git rm --cached frontend
git add frontend/
```

**Render API 자동화**

대시보드 클릭 없이 API로 전부 처리:
```
GET  /v1/owners                → ownerId 확보
POST /v1/services              → 웹 서비스 생성 (rootDir: backend)
PUT  /v1/services/:id/env-vars → 환경변수 주입
POST /v1/services/:id/deploys  → 재배포 트리거
```

**Vercel 배포 중 TypeScript 빌드 에러**

`ResultClient.tsx`에서 `mbti`가 `null`일 수 있음에도 `MBTI_EMOJI[mbti]` 접근 → early return 이후 변수로 분리해 해결.

**최종 배포 URL:**

| | URL |
|--|--|
| 프론트엔드 | https://frontend-rouge-kappa-81.vercel.app |
| 백엔드 | https://mbti-balance-backend.onrender.com |
| GitHub | https://github.com/rickykimjongwook/mbti-balance |

---

### 🤔 배운 것 / 의사결정

1. **Render API로 완전 자동화 가능**: `rnd_` API 키 하나면 서비스 생성부터 배포까지 Claude Code가 처리. 대시보드에서 클릭할 일이 없어진다.

2. **Supabase MCP도 자동화**: `claude mcp add --transport http supabase` 한 줄 설정 후, 다음 세션에서 프로젝트 생성 → SQL 실행 → 시드 삽입까지 대화로 완료.

3. **create-next-app의 git init 주의**: 부모 레포가 있는 상태에서 create-next-app 실행하면 내부에 `.git` 생성 → 서브모듈 문제. 이후 프로젝트에서는 `--no-git` 플래그 사용 또는 설치 후 `.git` 즉시 제거.

4. **분리 아키텍처의 디버깅 포인트**: 모놀리스에서 없던 이슈들 — CORS, 포트 충돌, 환경변수 2벌 관리. 각각 한 번씩 겪어봤으니 다음엔 선제 대응 가능.

---

## 세션 4 — UX 개선 · Vercel GitHub 연동

### ✨ SSE 로딩 인디케이터 + 버튼 비활성화

**문제**: 선택 후 SSE 결과가 뜨기까지 약 1초 지연 → 유저가 결과를 못 보고 다음 질문으로 넘어감

**해결**: `statsLoading` 상태 추가

- 선택 시 `statsLoading = true` → SSE 수신 시 `false`
- 로딩 중: 바운스 점 3개 애니메이션 + "결과 집계 중..." 표시
- 로딩 중: "다음 질문" 버튼 `disabled` (회색 처리)
- SSE 수신 완료 후 버튼 활성화

```typescript
// handleChoice
setStatsLoading(true)

// SSE 콜백
esRef.current = createSSEConnection((newStats) => {
  setStats(newStats)
  setStatsLoading(false)  // ← 버튼 활성화
})
```

---

### 🔗 Vercel GitHub 연동

CLI로 배포(`npx vercel --prod`)하면 GitHub 연동이 없는 상태로 배포됨 → push 시 자동 배포 안 됨.

Vercel API로 해결:
```
GET  /v1/integrations/git-namespaces  → GitHub installationId 확인
POST /v9/projects/:id/link            → GitHub 레포 연결
PATCH /v9/projects/:id               → 프로젝트명 변경(frontend → mbti-balance), rootDirectory: frontend 설정
```

이후 `master` 브랜치 push → Vercel 자동 배포 트리거.

---

### 🤔 배운 것 / 의사결정

1. **CLI 배포 vs GitHub 연동 배포**: `npx vercel --prod`는 수동 배포. GitHub 자동 배포는 별도 연동 필요. 다음 프로젝트부터는 초기 설정 시 API로 연동까지 한 번에.

2. **UX 피드백의 중요성**: SSE 지연 1초는 기술적으로 문제없지만 유저 경험상 치명적. "기다려야 한다"는 시각적 신호(로딩 + 버튼 비활성화)가 필수.
