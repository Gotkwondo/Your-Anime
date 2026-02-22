# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo 구조

```
Your-Anime/
├── frontend/     # Next.js 15 (App Router) — Vercel 배포
├── backend/      # NestJS — Railway/Render 배포
├── vercel.json   # Vercel 빌드 설정 (Root Directory = 프로젝트 루트)
├── PRD.md        # 제품 요구사항 문서 (기능 구현 시 반드시 참조)
└── .claude/      # Claude Code 에이전트/스킬 정의
```

## Agents

프로젝트에 특화된 서브에이전트가 `.claude/agents/`에 정의되어 있습니다. Task 도구로 호출하세요.

| Agent | 역할 |
|---|---|
| `requirement-planner` | 모호한 요구사항을 구체화하고 단계별 실행 계획 수립 |
| `senior-clean-architect` | PRD 기반 프론트엔드 기능 구현 (컴포넌트, 상태관리, API 연동) |
| `backend-developer` | NestJS API 설계, DB 스키마, 인증/인가, 서버 로직 구현 |
| `framer-ui-designer` | 반응형 UI 디자인, 애니메이션, Framer 기반 폴리싱 |

스킬(slash commands)은 `.claude/skills/`에 정의됩니다: `frontend-development`, `skill-creator`.

## Commands

### Frontend (`frontend/`)
```bash
cd frontend
pnpm dev          # 개발 서버 (localhost:3000)
pnpm build        # 프로덕션 빌드
pnpm start        # 프로덕션 서버
pnpm lint         # ESLint
```

### Backend (`backend/`)
```bash
cd backend
pnpm start:dev    # 개발 서버 with watch (localhost:3001)
pnpm build        # 프로덕션 빌드
pnpm start:prod   # 프로덕션 서버
pnpm test         # 단위 테스트
pnpm test:e2e     # E2E 테스트
pnpm lint         # ESLint
```

## Frontend 아키텍처

**Tech Stack**: Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion, Zustand, TanStack Query

**라우트 구조**
- `(auth)` 그룹 — `/login`, `/signup` (공개)
- `(app)` 그룹 — `/chat/select`, `/chat` (인증 필요, 미인증 시 `/login` 리다이렉트)
- `/chat`은 `useConversationStore`의 `currentConversationId`가 없으면 `/chat/select`로 리다이렉트

**상태관리 (Zustand)**
- `useAuthStore` — 사용자 세션
- `useConversationStore` — 대화 목록 및 메시지 (`persist` 미들웨어로 localStorage 영속화 — 백엔드 연동 시 제거 예정)
- `useChatStore` — 독립 채팅 상태

**Mock 레이어 (추후 교체 대상)**

| Mock 파일 | 교체 대상 |
|---|---|
| `lib/auth/mockAuth.ts` | Supabase Auth |
| `lib/mock/aiResponses.ts` | Backend `/api/chat` 호출 |
| `lib/mock/anime.ts` | Backend `/api/anime/*` 호출 |

**디자인 시스템**
- 다크 테마 고정 (`html`에 `.dark` 클래스 전역 적용)
- 주요 색상: 배경 `#04050e`, 액센트(민트) `#03f7b5`
- CSS 유틸리티: `.card-dark`, `.gradient-text`, `.bg-orb` (`globals.css` 정의)
- 애니메이션 래퍼: `components/ui/FadeIn.tsx`, `components/ui/StaggerChildren.tsx`
- 클래스 병합: `lib/utils/cn.ts` (`clsx` + `tailwind-merge`)

**API 프록시**
- 프론트에서 `/api/*` 호출 → `next.config.ts`의 rewrites가 백엔드(`NEXT_PUBLIC_BACKEND_URL`)로 전달
- CORS 우회 및 백엔드 URL 은닉 목적

## Backend 아키텍처

**Tech Stack**: NestJS, TypeScript, Supabase (PostgreSQL + pgvector), Anthropic Claude API, OpenAI API (embeddings), Jikan API

**예정 모듈 구조**
```
backend/src/
├── auth/           # Supabase Auth 연동, 미들웨어
├── chat/           # POST /api/chat (Claude API 연동)
├── conversations/  # 대화 CRUD
├── anime/          # Jikan API + anime_cache
├── user/           # 프로필, 선호도, 워치리스트
└── common/         # Guards, Pipes, Interceptors
```

**핵심 DB 테이블** (Supabase PostgreSQL)
- `user_profiles` — Supabase Auth 사용자 확장
- `conversations` — 대화 세션
- `messages` — 채팅 메시지 + vector(1536) embedding
- `anime_cache` — Jikan API 응답 7일 캐시
- `user_preferences` — 선호도 벡터 (Enhancement 단계)

**환경변수**

| 변수 | 위치 | 용도 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | frontend | Supabase 클라이언트 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | frontend | Supabase 클라이언트 (RLS 적용) |
| `NEXT_PUBLIC_BACKEND_URL` | frontend | 백엔드 서버 URL |
| `SUPABASE_URL` | backend | Supabase 서버 클라이언트 |
| `SUPABASE_SERVICE_ROLE_KEY` | backend | Supabase 서버 클라이언트 (RLS 우회) |
| `ANTHROPIC_API_KEY` | backend | Claude API |
| `OPENAI_API_KEY` | backend | Embedding 생성 |
| `UPSTASH_REDIS_REST_URL` | backend | Rate Limiting |
| `UPSTASH_REDIS_REST_TOKEN` | backend | Rate Limiting |

## 배포

- **Frontend**: Vercel — 루트의 `vercel.json`으로 `frontend/` 빌드
  - Vercel 대시보드에서 Root Directory를 별도 설정할 필요 없음
- **Backend**: Railway or Render — `backend/` 디렉터리를 Root Directory로 지정
