---
name: playwright-test
description: >
  Generate production-ready Playwright E2E test code for the Your-Anime monorepo (Next.js 15 frontend + NestJS backend).
  Use this skill whenever the user asks to write, generate, or add E2E tests, integration tests, or Playwright tests —
  or whenever a feature is completed and needs validation. Also trigger when the user says things like
  "테스트 코드 짜줘", "E2E 테스트 추가해줘", "이 기능 테스트해줘", or "Playwright로 검증해줘".
---

# Playwright E2E Test Skill — Your-Anime

You generate **Playwright test files** that test real user flows across the full stack.
Before writing a single line, understand what's real vs. mocked, then write tests that reflect the actual system state.

## Project Context

- **Frontend**: `http://localhost:3000` — Next.js 15 App Router
- **Backend**: `http://localhost:3001` — NestJS, proxied via `/api/*`
- **Auth**: Supabase Auth (PKCE flow). `useAuthStore` holds session in Zustand.
- **Route groups**:
  - `(auth)` → `/login`, `/signup` — public
  - `(app)` → `/chat/select`, `/chat` — requires auth, redirects to `/login` if unauthenticated
- **Mock layers** (may still be active — check before testing):
  - `frontend/lib/auth/mockAuth.ts` → Supabase Auth
  - `frontend/lib/mock/aiResponses.ts` → Claude API
  - `frontend/lib/mock/anime.ts` → Jikan API

## Step-by-Step Approach

### 1. Identify scope
Ask yourself (or the user if unclear):
- Which feature from PRD.md are we testing? (F1~F11)
- Which layers are involved? Frontend-only / Full-stack / DB?
- Are mock layers active or are we testing real integrations?

### 2. Read before writing
Before generating test code:
- Read the relevant feature spec in `/PRD.md`
- Read the actual component/page files that will be exercised
- Check if Playwright is already installed (`frontend/package.json`, `frontend/playwright.config.ts`)

### 3. Set up Playwright if not present

If Playwright isn't configured yet:

```bash
cd frontend
pnpm add -D @playwright/test
npx playwright install chromium
```

Create `frontend/playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 4. Test file structure

Place tests in `frontend/e2e/`:
```
frontend/e2e/
├── auth.spec.ts           # F5: Login, signup, route guards
├── chat.spec.ts           # F1: Chat interface
├── persona-select.spec.ts # F3: Persona selection (/chat/select)
├── conversation.spec.ts   # F4: History, persistence
└── helpers/
    ├── auth.ts            # Reusable login helper
    └── fixtures.ts        # Test data
```

### 5. Core test patterns for this project

#### Auth helper (always create this first)
```typescript
// e2e/helpers/auth.ts
import { Page } from '@playwright/test';

export async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
  await page.click('[data-testid="login-button"]');
  await page.waitForURL(/\/(chat|chat\/select)/);
}

// For tests that need auth but don't test the login flow:
// Use storageState to skip re-login every test
```

#### Route guard tests (always include)
```typescript
test('unauthenticated user is redirected to /login from /chat', async ({ page }) => {
  await page.goto('/chat');
  await expect(page).toHaveURL('/login');
});

test('unauthenticated user is redirected to /login from /chat/select', async ({ page }) => {
  await page.goto('/chat/select');
  await expect(page).toHaveURL('/login');
});
```

#### Chat flow test (F1)
```typescript
test('user can send a message and receive AI response', async ({ page }) => {
  await loginAs(page, TEST_EMAIL, TEST_PASSWORD);
  // After login, should land on /chat/select or /chat
  await page.waitForURL(/\/chat/);

  const input = page.getByTestId('chat-input');
  await input.fill('액션 장르 애니메이션 추천해줘');
  await input.press('Enter');

  // Wait for AI response (mock or real)
  await expect(page.getByTestId('message-list')).toContainText(/추천/, { timeout: 15000 });
});
```

#### API integration test (backend direct)
```typescript
// Test backend directly when testing API contracts
import { request } from '@playwright/test';

test('POST /api/chat requires auth', async ({ request }) => {
  const res = await request.post('http://localhost:3001/chat', {
    data: { message: 'test', conversationId: 'xxx', userId: 'yyy' },
  });
  expect(res.status()).toBe(401);
});
```

### 6. What to annotate in each test

Every test should clearly state:
- **Layer**: Frontend / Backend / Full-Stack
- **Mock status**: Whether mocks are active
- **PRD reference**: Which feature (F1~F11)

```typescript
// [F1] Conversational Chat Interface
// Layer: Full-Stack (Frontend + Backend + Claude API)
// Mock status: aiResponses mock ACTIVE — real Claude API not tested here
test.describe('F1: Chat Interface', () => { ... });
```

### 7. After generating tests

Always tell the user:
1. Which `data-testid` attributes need to be added to components (if missing)
2. Which env vars are needed (`TEST_EMAIL`, `TEST_PASSWORD`, `NEXT_PUBLIC_SUPABASE_URL`)
3. How to run: `cd frontend && npx playwright test` or `npx playwright test --ui`
4. Whether mock layers will affect test results

## Common Pitfalls to Avoid

- Don't use `page.waitForTimeout()` — use `waitForURL`, `waitForSelector`, or `expect().toContainText()`
- Don't hardcode test credentials in files — use `process.env.TEST_EMAIL`
- Don't test mock behavior as if it's real — clearly annotate mock-dependent tests
- Supabase auth sessions expire — use `storageState` or re-login in `beforeEach` for auth-dependent suites
