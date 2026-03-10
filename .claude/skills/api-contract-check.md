---
name: api-contract-check
description: >
  Compare API contracts defined in PRD.md against actual NestJS backend implementations and frontend call sites,
  then report any drift or mismatches. Use this skill whenever the user asks to verify API contracts, check for
  inconsistencies between PRD and code, audit endpoints, or detect drift between frontend and backend.
  Also trigger for: "PRD랑 코드가 맞는지 확인해줘", "API 계약 체크해줘", "구현이 스펙과 다른지 봐줘",
  "엔드포인트 검증해줘", or after a significant backend or PRD change.
---

# API Contract Check Skill — Your-Anime

You systematically compare API specs in PRD.md against actual code, then produce a clear drift report.
The goal is to catch mismatches *before* they cause runtime bugs or confusing errors.

## What This Skill Checks

| Source of Truth | What to Compare Against |
|---|---|
| PRD.md API contracts (request/response shapes, HTTP methods, paths) | `backend/src/*/` controllers and DTOs |
| PRD.md data models (TypeScript interfaces) | Backend DTOs, Supabase table columns |
| Frontend API call sites (`lib/api/`, `hooks/`) | Backend endpoint paths & response shapes |

## Step-by-Step Process

### Step 1: Extract PRD contracts

Read `PRD.md` and extract every API endpoint mentioned. For each, note:
- HTTP method + path (e.g., `POST /api/chat`)
- Request body shape
- Response shape
- Auth requirement (yes/no)
- Feature ID (F1~F11)

Focus on sections like "Technical Requirements" under each feature spec.

### Step 2: Scan backend implementation

For each NestJS module in `backend/src/`:
- Read `*.controller.ts` → extract routes (`@Get`, `@Post`, `@Delete`, etc.), params, guards
- Read `dto/*.dto.ts` → extract request/response field names and types
- Note: controllers use `@UseGuards(AuthGuard)` for protected routes

Key files to check:
```
backend/src/chat/chat.controller.ts          → POST /api/chat
backend/src/conversations/conversations.controller.ts → GET/POST/DELETE /api/conversations
backend/src/anime/anime.controller.ts        → GET /api/anime/search, GET /api/anime/:id
backend/src/auth/                            → auth endpoints (if any)
```

### Step 3: Scan frontend call sites

Search for API calls in the frontend:
```bash
# Find all fetch/apiRequest calls
grep -r "apiRequest\|fetch.*\/api\/" frontend/lib frontend/hooks --include="*.ts" --include="*.tsx"
```

For each call site, note:
- Which endpoint path is called
- What data is sent in the body
- What response fields are accessed

### Step 4: Generate drift report

Produce a structured report in this exact format:

```
## API Contract Drift Report — [Date]

### Summary
- Total endpoints in PRD: X
- Endpoints implemented: X ✅
- Endpoints missing from backend: X ❌
- Mismatches (wrong method/path/shape): X ⚠️
- Frontend calling non-existent endpoints: X 🔴

---

### ✅ Matched Contracts
| Endpoint | PRD | Backend | Frontend |
|---|---|---|---|
| POST /api/chat | ✅ | ✅ | ✅ |

---

### ❌ Missing Implementations
List endpoints defined in PRD but not yet implemented in the backend.

---

### ⚠️ Shape Mismatches
For each mismatch, show:

**[F1] POST /api/chat — Request Body Mismatch**
- PRD expects: `{ message: string; conversationId: string; userId: string }`
- Backend DTO has: `{ message: string; conversationId: string }` ← userId missing
- Frontend sends: `{ message: string; conversationId: string }` ← matches backend, NOT PRD
- Risk: PRD spec is outdated OR backend is incomplete
- Recommendation: [specific action]

---

### 🔴 Frontend Calling Non-Existent Endpoints
List frontend call sites pointing to paths the backend doesn't implement.

---

### Mock Layer Gaps
Note which endpoints are still being mocked in:
- `frontend/lib/auth/mockAuth.ts`
- `frontend/lib/mock/aiResponses.ts`
- `frontend/lib/mock/anime.ts`

These will need real backend endpoints before mock removal.

---

### Recommendations
Prioritized list of fixes, ordered by severity and feature priority (P0 first).
```

## Mismatch Severity Guide

When you find a mismatch, classify it:

- **Critical**: Frontend calling endpoint that doesn't exist → will 404 at runtime
- **High**: Required field missing from request/response → will cause 400 or undefined errors
- **Medium**: Optional field missing or renamed → degraded behavior
- **Low**: PRD spec is more detailed than implementation → incomplete feature, not breaking
- **Info**: Mock layer gap → needs future implementation, not currently broken

## Things to Watch For in This Project

1. **`userId` in request bodies**: PRD specs often include `userId` in request bodies, but the actual backend extracts `userId` from the JWT token via `req.user!.id` — this is correct and intentional (never trust client-provided userId), but creates apparent "drift" that isn't really a bug.

2. **Response wrapping**: Backend wraps all responses as `{ success: true, data: ... }`. PRD specs often show the raw data shape. This is a structural difference to note but not a bug.

3. **`personaType` values**: Conversations controller accepts `'sommelier' | 'cafe_owner' | 'otaku_friend'`. Verify frontend sends exactly these strings (not 'cafe-owner' etc.).

4. **Pagination params**: `GET /api/conversations?limit=20&offset=0` — verify frontend actually sends these when needed.

5. **Mock vs. real**: Many features in PRD are still served by mock layers. Note these explicitly rather than flagging them as "missing backend" — they're intentionally deferred.

## Output Principles

- Be specific: show the exact field names, not vague "types don't match"
- Always show PRD vs. Backend vs. Frontend side-by-side
- Don't cry wolf: the `userId`-from-JWT pattern is correct security practice, not drift
- If unsure whether something is intentional drift or a bug, say so clearly and suggest asking the user
- End with a prioritized action list so the team knows what to fix first
