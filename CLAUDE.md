# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Agents

프로젝트에 특화된 서브에이전트가 `.claude/agents/`에 정의되어 있습니다. Task 도구로 호출하세요.

| Agent | 파일 | 역할 |
|---|---|---|
| `requirement-planner` | `requirement-planner.md` | 모호한 요구사항을 구체화하고 단계별 실행 계획 수립 |
| `senior-clean-architect` | `senior-clean-architect.md` | PRD 기반 프론트엔드 기능 구현 (컴포넌트, 상태관리, API 연동) |
| `backend-developer` | `backend-developer.md` | API 설계, DB 스키마, 인증/인가, 서버 로직 구현 |
| `framer-ui-designer` | `framer-ui-designer.md` | 반응형 UI 디자인, 애니메이션, Framer 기반 폴리싱 |

**사용 순서 (PRD Section 2.2 기준)**: `requirement-planner` → `senior-clean-architect` / `backend-developer` → `framer-ui-designer`

스킬(slash commands)은 `.claude/skills/`에 정의됩니다: `frontend-development`, `skill-creator`.

## Commands

```bash
pnpm dev          # Start development server
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

No test suite is configured yet.

## Architecture Overview

**AnimeSommelier** is an AI-powered anime recommendation service. The current codebase is a **frontend-only MVP with mock data** — no real backend or external APIs are integrated yet. The PRD (`PRD.md`) describes the full target architecture with Supabase, Claude API, and Jikan API.

### Tech Stack

- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v3, always-dark theme (`html` has `.dark` class applied globally in `globals.css`)
- **Animation**: Framer Motion
- **State**: Zustand (stores in `lib/stores/`)
- **Package manager**: pnpm

### Route Structure

Two Next.js route groups:
- `(auth)` — `/login`, `/signup` — public pages
- `(app)` — `/chat/select`, `/chat` — requires authentication, redirects to `/login` if not authenticated

The flow for authenticated users: `/chat/select` → choose persona or resume conversation → `/chat`.

`/chat` requires `currentConversationId` to be set in `useConversationStore`; if missing, it redirects to `/chat/select`.

### Mock Layer (Current State)

All backend logic is mocked — replace these when integrating real services:

| Mock file | Purpose | Target replacement |
|---|---|---|
| `lib/auth/mockAuth.ts` | Auth via `localStorage` | Supabase Auth |
| `lib/mock/aiResponses.ts` | Keyword-matched fake AI replies | Claude API (`@anthropic-ai/sdk`) |
| `lib/mock/anime.ts` | Hardcoded anime data | Jikan API v4 |
| `lib/mock/personas.ts` | Persona definitions | `lib/ai/prompts.ts` (planned) |
| `lib/mock/conversations.ts` | Seed conversation data | Supabase DB |

### State Management

Three Zustand stores:

- `useAuthStore` — user session; calls `mockAuth`, initializes from `localStorage` on mount via `initialize()`
- `useConversationStore` — conversation list and per-conversation messages; **persisted** to `localStorage` via `zustand/middleware persist` (key: `conversation-storage`)
- `useChatStore` — lightweight store for standalone chat state; less used than `useConversationStore` in the current app pages

`AuthProvider` (`components/providers/AuthProvider.tsx`) calls `useAuthStore.initialize()` on mount to restore session. `Providers` wraps the app with `AuthProvider` and `QueryClientProvider`.

### Design System

- Background: `#04050e`, primary accent: `#03f7b5` (mint/cyan)
- CSS utility classes defined in `globals.css`: `.card-dark`, `.card-flat`, `.gradient-text`, `.bg-orb`, `.glow-primary`
- Reusable animation wrappers: `components/ui/FadeIn.tsx`, `components/ui/StaggerChildren.tsx`
- `lib/utils/cn.ts` — combines `clsx` + `tailwind-merge` for conditional class merging

### External API Plans (from PRD)

When integrating real services, the required environment variables are:
```
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
OPENAI_API_KEY          # for text-embedding-3-small
UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
NEXT_PUBLIC_APP_URL
```

`next.config.ts` already allows images from `cdn.myanimelist.net` for anime poster images.
