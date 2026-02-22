# Product Requirements Document (PRD)
# AI-Powered Anime Recommendation Service

**Version:** 2.0
**Last Updated:** February 15, 2026
**Project Code Name:** AnimeSommelier
**Development Tool:** Claude Code

---

## 1. Executive Summary

### 1.1 Product Vision
AnimeSommelier is a conversational AI-powered anime recommendation service that acts as a virtual anime sommelier. Unlike algorithm-based recommendation systems, it engages users in natural dialogue to understand their preferences, mood, and viewing context, then provides personalized anime recommendations with deep understanding and empathy.

### 1.2 Target Users
- **Primary:** Anime fans aged 18-35 seeking personalized recommendations
- **Secondary:** Casual viewers looking to discover new anime
- **Tertiary:** Content creators researching anime for reviews/videos

### 1.3 Success Metrics
- **User Engagement:** Average 5+ conversations per user per week
- **Recommendation Quality:** >70% of users watch recommended anime within 7 days
- **Retention:** 60% week-1 retention, 40% month-1 retention
- **Response Time:** <3 seconds for AI responses

---

## 2. Core Features & Requirements

### 2.1 Feature Overview & Priority Matrix

| Feature ID | Feature Name | Priority | Phase | Dependencies |
|------------|-------------|----------|-------|-------------|
| F1 | Conversational Chat Interface | P0 | MVP | F5 |
| F2 | Anime Recommendation Cards | P0 | MVP | F1 |
| F3 | Persona Selection | P1 | MVP | F1 |
| F4 | Conversation History | P2 | MVP | F1, F5 |
| F5 | User Authentication | P1 | MVP | - |
| F6 | Smart Anime Search | P2 | Enhancement | F1, F2 |
| F7 | User Preferences Learning | P2 | Enhancement | F1, F5 |
| F8 | Recommendation Explanations | P2 | Enhancement | F2 |
| F9 | Multi-Turn Refinement | P1 | Advanced | F1, F3 |
| F10 | Watchlist Integration | P2 | Advanced | F2, F5 |
| F11 | Seasonal Anime Discovery | P2 | Advanced | F2 |

### 2.2 Implementation Order

에이전트는 아래 순서에 따라 기능을 구현합니다. 각 단계는 이전 단계의 완료를 전제합니다.

```
Step 1: F5 (User Authentication) — 모든 기능의 기반
Step 2: F1 (Chat Interface) — 핵심 사용자 경험
Step 3: F2 (Anime Cards) — 추천 결과 표시
Step 4: F3 (Persona Selection) — 차별화 기능
Step 5: F4 (Conversation History) — 사용자 편의
Step 6: F6~F8 (Search, Preferences, Explanations) — 순서 무관, 병렬 가능
Step 7: F9~F11 (Refinement, Watchlist, Seasonal) — 순서 무관, 병렬 가능
```

---

### 2.3 Feature Specifications

#### F1: Conversational Chat Interface
**Priority:** P0 (Critical)
**Dependencies:** F5 (Authentication)
**Phase:** MVP

**User Story:**
> As a user, I want to chat naturally with an AI anime expert so that I can get personalized recommendations without filling out forms.

**Acceptance Criteria:**
- [ ] User can send text messages in a chat interface
- [ ] AI responds within 3 seconds with contextual replies
- [ ] Chat history is preserved within a conversation session
- [ ] User can see typing indicator while AI is generating response
- [ ] Support for markdown formatting in AI responses
- [ ] Mobile-responsive chat interface (works on 320px+ width)

**Technical Requirements:**
```typescript
// API Endpoint
POST /api/chat
Request: {
  message: string;
  conversationId: string;
  userId: string;
}
Response: {
  message: string;
  conversationId: string;
  recommendations?: AnimeRecommendation[];
}

// Data Model
interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  embedding?: number[]; // 1536-dim vector
}
```

**UI Components:**
- `ChatInterface.tsx` - Main chat container
- `MessageBubble.tsx` - Individual message display
- `ChatInput.tsx` - Message input with send button
- `TypingIndicator.tsx` - Animated typing dots

**Edge Cases:**
- Empty message submission → Show error "Please enter a message"
- Network error → Show retry button with error message
- API timeout (>30s) → Cancel request and show timeout message
- Very long messages (>5000 chars) → Truncate and warn user

---

#### F2: Anime Recommendation Cards
**Priority:** P0 (Critical)
**Dependencies:** F1 (Chat Interface)
**Phase:** MVP

**User Story:**
> As a user, I want to see detailed information about recommended anime so that I can decide if I want to watch it.

**Acceptance Criteria:**
- [ ] Display anime title (English and Japanese)
- [ ] Show poster image (from MyAnimeList)
- [ ] Display rating (MyAnimeList score)
- [ ] Show genre tags
- [ ] Display episode count and status (Finished Airing, Airing, etc.)
- [ ] Include brief synopsis (2-3 sentences)
- [ ] Provide "More Info" button linking to MyAnimeList
- [ ] Show "Add to Watchlist" button (future feature placeholder)

**Technical Requirements:**
```typescript
// Data Model
interface AnimeRecommendation {
  malId: number;
  title: string;
  titleJapanese: string;
  imageUrl: string;
  score: number;
  genres: string[];
  episodes: number;
  status: 'Finished Airing' | 'Currently Airing' | 'Not yet aired';
  synopsis: string;
  url: string; // MyAnimeList URL
  aiReasoning?: string; // Why AI recommended this
}

// Jikan API Integration
GET https://api.jikan.moe/v4/anime/{id}
```

**UI Components:**
- `AnimeCard.tsx` - Card component with image and details
- `AnimeGrid.tsx` - Grid layout for multiple recommendations
- `GenreTag.tsx` - Pill-shaped genre badges
- `RatingDisplay.tsx` - Star rating visualization

**Edge Cases:**
- Missing poster image → Use placeholder image
- No synopsis available → Show "Synopsis not available"
- Score = null → Show "Not rated yet"
- Very long title → Truncate with ellipsis

---

#### F3: Persona Selection
**Priority:** P1 (High)
**Dependencies:** F1 (Chat Interface)
**Phase:** MVP

**User Story:**
> As a user, I want to choose different AI personalities so that I can have varied recommendation experiences.

**Acceptance Criteria:**
- [ ] User can select from 3 personas before starting chat
- [ ] Persona selection appears on first visit or via settings
- [ ] Each persona has distinct personality and recommendation style
- [ ] User can switch personas mid-conversation (starts new conversation)
- [ ] Persona indicator visible in chat interface

**Personas:**

1. **Anime Sommelier** (Default)
   - Tone: Professional, sophisticated, knowledgeable
   - Style: Asks about mood, themes, and emotional preferences
   - Example: "Ah, you're in the mood for something uplifting? Let me think... have you considered March Comes in Like a Lion? It's a beautiful exploration of finding hope through hardship."

2. **Manga Cafe Owner**
   - Tone: Friendly, casual, like talking to a friend
   - Style: Relates to personal experiences, asks about viewing context
   - Example: "Oh nice! So you've got a free weekend coming up? Perfect time for a binge! How about something that'll make you laugh till you cry?"

3. **Otaku Friend**
   - Tone: Enthusiastic, informal, uses anime slang
   - Style: Deep dives into genres, references anime culture
   - Example: "Yooo you haven't seen Steins;Gate yet?! Bruh, you're in for a RIDE. Time travel done RIGHT. Get ready to have your mind blown!"

**Technical Requirements:**
```typescript
// System Prompts
const PERSONA_PROMPTS = {
  sommelier: `You are a refined anime sommelier with 20 years of experience...`,
  cafe_owner: `You are a warm, friendly manga cafe owner who treats customers like family...`,
  otaku_friend: `You are an enthusiastic anime fan who loves sharing recommendations...`
};

// Data Model
interface Conversation {
  id: string;
  userId: string;
  personaType: 'sommelier' | 'cafe_owner' | 'otaku_friend';
  title: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**UI Components:**
- `PersonaSelector.tsx` - Modal with 3 persona cards
- `PersonaCard.tsx` - Individual persona display
- `PersonaIndicator.tsx` - Small badge showing current persona

---

#### F4: Conversation History
**Priority:** P2 (Medium)
**Dependencies:** F1 (Chat Interface), F5 (Authentication)
**Phase:** MVP

**User Story:**
> As a user, I want to access my past conversations so that I can revisit recommendations I received.

**Acceptance Criteria:**
- [ ] Sidebar shows list of past conversations (most recent first)
- [ ] Each conversation shows title (auto-generated from first message)
- [ ] Clicking a conversation loads its full history
- [ ] User can start a new conversation via "+ New Chat" button
- [ ] Conversations are grouped by date (Today, Yesterday, This Week, Older)
- [ ] User can delete conversations (with confirmation)

**Technical Requirements:**
```typescript
// API Endpoints
GET /api/conversations?userId={userId}&limit=20&offset=0
DELETE /api/conversations/{conversationId}

// Data Model
interface ConversationListItem {
  id: string;
  title: string;
  personaType: string;
  lastMessage: string;
  lastMessageAt: Date;
  messageCount: number;
}
```

**UI Components:**
- `ConversationSidebar.tsx` - Sidebar with conversation list
- `ConversationItem.tsx` - Individual conversation preview
- `NewChatButton.tsx` - Button to start new conversation

**Edge Cases:**
- No conversations yet → Show onboarding message
- Deleted conversation is currently open → Redirect to new conversation
- Very long conversation titles → Truncate with ellipsis

---

#### F5: User Authentication
**Priority:** P1 (High)
**Dependencies:** None (Foundation)
**Phase:** MVP

**User Story:**
> As a user, I want to create an account so that my conversations and preferences are saved.

**Acceptance Criteria:**
- [ ] User can sign up with email + password
- [ ] User can log in with email + password
- [ ] User can log in with Google OAuth
- [ ] User stays logged in across sessions (refresh token)
- [ ] User can log out
- [ ] Protected routes redirect to login if not authenticated
- [ ] User profile shows email and join date

**Technical Requirements:**
```typescript
// Using Supabase Auth
import { createClient } from '@supabase/supabase-js';

// Sign Up
await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});

// Sign In
await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// OAuth
await supabase.auth.signInWithOAuth({
  provider: 'google'
});

// Session Management
const { data: { session } } = await supabase.auth.getSession();
```

**UI Components:**
- `LoginPage.tsx` - Login form
- `SignupPage.tsx` - Registration form
- `AuthProvider.tsx` - Context provider for auth state
- `ProtectedRoute.tsx` - Route wrapper for auth-required pages

**Edge Cases:**
- Email already exists → Show error "Email already registered"
- Weak password → Show requirements (8+ chars, 1 number, 1 special)
- OAuth popup blocked → Show instructions to enable popups
- Session expired → Refresh token or redirect to login

---

#### F6: Smart Anime Search
**Priority:** P2 (Medium)
**Dependencies:** F1 (Chat Interface), F2 (Anime Cards)
**Phase:** Enhancement

**User Story:**
> As a user, I want to search for specific anime so that I can ask the AI about them.

**Acceptance Criteria:**
- [ ] Search bar in chat interface
- [ ] Autocomplete suggestions as user types (debounced 300ms)
- [ ] Shows top 5 matching anime from Jikan API
- [ ] User can click anime to add to conversation context
- [ ] Search by title (English or Japanese)
- [ ] Search results show poster + title + year

**Technical Requirements:**
```typescript
// API Endpoint
GET /api/anime/search?q={query}&limit=5

// Jikan API Call
GET https://api.jikan.moe/v4/anime?q={query}&limit=5&order_by=members&sort=desc
```

**UI Components:**
- `AnimeSearchBar.tsx` - Search input with autocomplete
- `SearchResults.tsx` - Dropdown list of results
- `SearchResultItem.tsx` - Individual result card

---

#### F7: User Preferences Learning
**Priority:** P2 (Medium)
**Dependencies:** F1 (Chat Interface), F5 (Authentication)
**Phase:** Enhancement

**User Story:**
> As a user, I want the AI to remember my preferences so that recommendations improve over time.

**Acceptance Criteria:**
- [ ] AI extracts preferences from conversations (genres, themes, moods)
- [ ] Preferences stored as embeddings in database
- [ ] Similar past preferences retrieved via vector search
- [ ] User can view and edit preferences in settings
- [ ] Preferences influence future recommendations

**Technical Requirements:**
```typescript
// Preference Extraction (in AI prompt)
const systemPrompt = `
When user expresses preferences, extract them in this format:
{
  "preferences": {
    "genres": ["action", "psychological"],
    "themes": ["time travel", "character growth"],
    "mood": "thought-provoking",
    "avoid": ["excessive violence"]
  }
}
`;

// Data Model
interface UserPreference {
  id: string;
  userId: string;
  preferenceText: string;
  embedding: number[];
  category: 'genre' | 'theme' | 'mood' | 'avoid';
  createdAt: Date;
}
```

**UI Components:**
- `PreferencesPage.tsx` - User preferences dashboard
- `PreferenceTag.tsx` - Editable preference chips
- `PreferenceCategory.tsx` - Grouped preferences

---

#### F8: Recommendation Explanations
**Priority:** P2 (Medium)
**Dependencies:** F2 (Anime Cards)
**Phase:** Enhancement

**User Story:**
> As a user, I want to know why the AI recommended specific anime so that I can trust its suggestions.

**Acceptance Criteria:**
- [ ] Each recommendation includes AI reasoning
- [ ] Reasoning mentions specific user preferences matched
- [ ] Reasoning highlights unique aspects of the anime
- [ ] "Why this?" expandable section in anime cards
- [ ] Reasoning is natural language, not bullet points

**Technical Requirements:**
```typescript
// Enhanced Claude Prompt
const recommendationPrompt = `
For each anime you recommend, provide reasoning in this format:
{
  "anime_id": 5114,
  "reasoning": "Based on your love for character-driven stories with emotional depth,
               Fullmetal Alchemist: Brotherhood offers exactly that. The Elric brothers'
               journey mirrors the themes of sacrifice and redemption you enjoyed in
               Steins;Gate, but with more action-packed sequences."
}
`;
```

**UI Components:**
- `RecommendationReasoning.tsx` - Expandable reasoning section
- `MatchIndicator.tsx` - Visual match percentage

---

#### F9: Multi-Turn Refinement
**Priority:** P1 (High)
**Dependencies:** F1 (Chat Interface), F3 (Persona Selection)
**Phase:** Advanced

**User Story:**
> As a user, I want to refine recommendations through follow-up questions so that I find the perfect anime.

**Acceptance Criteria:**
- [ ] AI asks clarifying questions before recommending
- [ ] User can say "not quite right" and AI adjusts
- [ ] AI remembers rejected recommendations within conversation
- [ ] Up to 5 rounds of refinement before final suggestions
- [ ] Progress indicator shows refinement stage

**Technical Requirements:**
```typescript
// Conversation State Management
interface RefinementState {
  stage: 1 | 2 | 3 | 4 | 5;
  collectedInfo: {
    genres?: string[];
    mood?: string;
    length?: 'short' | 'medium' | 'long';
    maturity?: 'all-ages' | 'teen' | 'mature';
  };
  rejectedAnimeIds: number[];
}
```

---

#### F10: Watchlist Integration
**Priority:** P2 (Medium)
**Dependencies:** F2 (Anime Cards), F5 (Authentication)
**Phase:** Advanced

**User Story:**
> As a user, I want to save recommended anime to a watchlist so that I can watch them later.

**Acceptance Criteria:**
- [ ] "Add to Watchlist" button on anime cards
- [ ] Watchlist page shows all saved anime
- [ ] User can mark anime as "Watching" or "Completed"
- [ ] AI considers watchlist in future recommendations
- [ ] Export watchlist to CSV

---

#### F11: Seasonal Anime Discovery
**Priority:** P2 (Medium)
**Dependencies:** F2 (Anime Cards)
**Phase:** Advanced

**User Story:**
> As a user, I want to discover new seasonal anime so that I stay updated with current shows.

**Acceptance Criteria:**
- [ ] "What's airing this season?" trigger phrase
- [ ] AI fetches current season anime from Jikan API
- [ ] Recommendations filtered by current season
- [ ] Shows air date and episode count
- [ ] "Upcoming" tab for next season

---

## 3. Technical Architecture

### 3.1 Technology Stack

```yaml
Frontend:
  Framework: Next.js 14 (App Router)
  Language: TypeScript 5.3
  UI Library: React 18
  Styling: Tailwind CSS 3.4
  Components: shadcn/ui (Radix UI)
  State Management: Zustand 4.4
  Data Fetching: TanStack Query 5.0
  Animation: Framer Motion 11

Backend:
  Runtime: Next.js API Routes (Node.js 20)
  API Framework: Next.js Route Handlers
  Authentication: Supabase Auth
  Rate Limiting: upstash/ratelimit

Database:
  Primary DB: Supabase (PostgreSQL 15)
  Vector Extension: pgvector 0.5
  ORM: Prisma 5.8 (optional) or Supabase JS Client

AI Services:
  LLM: Claude Sonnet 4.5 (Anthropic API)
  Embeddings: text-embedding-3-small (OpenAI API)

External APIs:
  Anime Data: Jikan API v4 (MyAnimeList)

Deployment:
  Hosting: Vercel
  CDN: Vercel Edge Network
  Analytics: Vercel Analytics
  Error Tracking: Sentry

Development Tools:
  IDE: Claude Code
  Version Control: Git + GitHub
  Package Manager: pnpm
  Linting: ESLint + Prettier
  Type Checking: TypeScript strict mode
```

### 3.2 Project Structure

```
anime-recommendation-app/
├── .env.local                    # Environment variables
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── README.md
├── PRD.md                        # This file
│
├── app/
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Landing page
│   ├── globals.css               # Global styles
│   │
│   ├── (auth)/                   # Auth routes group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── (app)/                    # Main app routes (requires auth)
│   │   ├── chat/
│   │   │   ├── page.tsx          # Chat interface
│   │   │   └── [conversationId]/
│   │   │       └── page.tsx      # Specific conversation
│   │   ├── watchlist/
│   │   │   └── page.tsx
│   │   ├── preferences/
│   │   │   └── page.tsx
│   │   └── layout.tsx            # App layout with sidebar
│   │
│   └── api/                      # API routes
│       ├── chat/
│       │   └── route.ts          # POST /api/chat
│       ├── conversations/
│       │   ├── route.ts          # GET, POST /api/conversations
│       │   └── [id]/
│       │       └── route.ts      # GET, DELETE /api/conversations/[id]
│       ├── anime/
│       │   ├── search/
│       │   │   └── route.ts      # GET /api/anime/search
│       │   └── [id]/
│       │       └── route.ts      # GET /api/anime/[id]
│       ├── user/
│       │   ├── preferences/
│       │   │   └── route.ts      # GET, POST /api/user/preferences
│       │   └── profile/
│       │       └── route.ts      # GET, PATCH /api/user/profile
│       └── webhooks/
│           └── supabase/
│               └── route.ts      # Supabase webhooks
│
├── components/
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── scroll-area.tsx
│   │   └── ...
│   │
│   ├── chat/
│   │   ├── ChatInterface.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── ChatInput.tsx
│   │   ├── TypingIndicator.tsx
│   │   └── PersonaSelector.tsx
│   │
│   ├── anime/
│   │   ├── AnimeCard.tsx
│   │   ├── AnimeGrid.tsx
│   │   ├── AnimeSearchBar.tsx
│   │   ├── GenreTag.tsx
│   │   └── RatingDisplay.tsx
│   │
│   ├── sidebar/
│   │   ├── ConversationSidebar.tsx
│   │   ├── ConversationItem.tsx
│   │   └── NewChatButton.tsx
│   │
│   └── providers/
│       ├── AuthProvider.tsx
│       ├── QueryProvider.tsx
│       └── ThemeProvider.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Supabase browser client
│   │   ├── server.ts             # Supabase server client
│   │   └── schema.sql            # Database schema
│   │
│   ├── ai/
│   │   ├── claude.ts             # Claude API wrapper
│   │   ├── embeddings.ts         # OpenAI embeddings
│   │   └── prompts.ts            # System prompts by persona
│   │
│   ├── api/
│   │   ├── jikan.ts              # Jikan API service
│   │   └── rate-limiter.ts       # Rate limiting utilities
│   │
│   └── utils/
│       ├── validators.ts         # Input validation
│       ├── sanitize.ts           # Input sanitization
│       ├── format.ts             # Data formatting
│       └── errors.ts             # Error handling
│
├── types/
│   ├── anime.ts                  # Anime-related types
│   ├── conversation.ts           # Conversation types
│   ├── user.ts                   # User types
│   ├── api.ts                    # API response types
│   └── database.ts               # Database types
│
├── hooks/
│   ├── useChat.ts                # Chat functionality hook
│   ├── useConversations.ts       # Conversation management
│   ├── useAuth.ts                # Authentication hook
│   └── useAnimeSearch.ts         # Anime search hook
│
├── public/
│   ├── images/
│   │   ├── personas/             # Persona avatars
│   │   └── placeholders/         # Placeholder images
│   └── favicon.ico
│
└── supabase/
    ├── migrations/               # Database migrations
    │   └── 001_initial_schema.sql
    └── seed.sql                  # Seed data for development
```

### 3.3 Database Schema (Supabase/PostgreSQL)

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Users table (managed by Supabase Auth)
-- We extend it with a custom table
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  preferences JSONB DEFAULT '{}'::JSONB,
  settings JSONB DEFAULT '{
    "theme": "system",
    "defaultPersona": "sommelier",
    "emailNotifications": true
  }'::JSONB
);

-- Conversations table
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  persona_type TEXT NOT NULL CHECK (persona_type IN ('sommelier', 'cafe_owner', 'otaku_friend')),
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::JSONB
);

-- Messages table with vector embeddings
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI text-embedding-3-small dimension
  anime_references JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::JSONB
);

-- User preferences with embeddings
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('genre', 'theme', 'mood', 'avoid')),
  preference_text TEXT NOT NULL,
  embedding vector(1536),
  confidence_score FLOAT DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Anime cache table (reduce Jikan API calls)
CREATE TABLE public.anime_cache (
  mal_id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  title_english TEXT,
  title_japanese TEXT,
  data JSONB NOT NULL,
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

-- User watchlist
CREATE TABLE public.watchlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  mal_id INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('want_to_watch', 'watching', 'completed', 'dropped')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  notes TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, mal_id)
);

-- Recommendation history
CREATE TABLE public.recommendation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  mal_id INTEGER NOT NULL,
  reasoning TEXT,
  was_accepted BOOLEAN DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_conversations_updated_at ON public.conversations(updated_at DESC);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_messages_embedding ON public.messages USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX idx_user_preferences_embedding ON public.user_preferences USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_anime_cache_expires_at ON public.anime_cache(expires_at);
CREATE INDEX idx_watchlist_user_id ON public.watchlist(user_id);
CREATE INDEX idx_recommendation_history_user_id ON public.recommendation_history(user_id);

-- Row Level Security (RLS) Policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_history ENABLE ROW LEVEL SECURITY;

-- User profiles: users can only read/write their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Conversations: users can only access their own conversations
CREATE POLICY "Users can view own conversations" ON public.conversations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON public.conversations
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own conversations" ON public.conversations
  FOR DELETE USING (auth.uid() = user_id);

-- Messages: users can only access messages from their conversations
CREATE POLICY "Users can view own messages" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id AND user_id = auth.uid()
    )
  );
CREATE POLICY "Users can create messages" ON public.messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id AND user_id = auth.uid()
    )
  );

-- Similar policies for other tables...

-- Functions for vector similarity search
CREATE OR REPLACE FUNCTION search_similar_messages(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  user_id_param UUID
)
RETURNS TABLE (
  id UUID,
  conversation_id UUID,
  content TEXT,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.conversation_id,
    m.content,
    1 - (m.embedding <=> query_embedding) as similarity
  FROM public.messages m
  JOIN public.conversations c ON m.conversation_id = c.id
  WHERE c.user_id = user_id_param
    AND 1 - (m.embedding <=> query_embedding) > match_threshold
  ORDER BY m.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to clean up expired cache
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.anime_cache
  WHERE expires_at < NOW();
END;
$$;

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_watchlist_updated_at
  BEFORE UPDATE ON public.watchlist
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 3.4 Environment Variables

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-api03-your-key

# OpenAI API (for embeddings)
OPENAI_API_KEY=sk-your-openai-key

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Error Tracking
SENTRY_DSN=https://your-sentry-dsn

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## 4. API Specifications

### 4.1 POST /api/chat

**Purpose:** Send a message and receive AI response with recommendations

**Request:**
```typescript
{
  message: string;              // User's message (max 5000 chars)
  conversationId: string;       // UUID of conversation
  userId: string;               // UUID of user (from auth)
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    message: string;            // AI's response
    conversationId: string;     // Same as request
    recommendations?: {         // Optional anime recommendations
      anime: AnimeRecommendation[];
      reasoning: string;
    };
    suggestedFollowUp?: string[]; // Suggested next questions
  };
  error?: string;
}
```

**Rate Limits:**
- 30 requests per minute per user
- 200 requests per hour per user

**Error Codes:**
- 400: Invalid input (empty message, invalid conversationId)
- 401: Unauthorized (no valid session)
- 429: Rate limit exceeded
- 500: Internal server error
- 503: AI service unavailable

---

### 4.2 GET /api/conversations

**Purpose:** Fetch user's conversation list

**Request:**
```typescript
Query Parameters:
- userId: string (UUID)
- limit?: number (default: 20, max: 100)
- offset?: number (default: 0)
- orderBy?: 'created_at' | 'updated_at' (default: 'updated_at')
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    conversations: ConversationListItem[];
    total: number;
    hasMore: boolean;
  };
}
```

---

### 4.3 GET /api/anime/search

**Purpose:** Search anime by title

**Request:**
```typescript
Query Parameters:
- q: string (search query, min 2 chars)
- limit?: number (default: 5, max: 20)
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    results: AnimeSearchResult[];
    total: number;
  };
}
```

**Caching:**
- Cache results in Supabase for 24 hours
- Use Jikan API as fallback

---

## 5. Development Milestones

### 5.1 Initial Setup

**Project Initialization:**
```bash
# Create Next.js project
npx create-next-app@latest anime-recommendation-app --typescript --tailwind --app

cd anime-recommendation-app

# Install dependencies
pnpm add @supabase/supabase-js @supabase/auth-helpers-nextjs
pnpm add @anthropic-ai/sdk openai
pnpm add @tanstack/react-query zustand
pnpm add framer-motion
pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu
pnpm add axios date-fns clsx tailwind-merge
pnpm add -D @types/node @types/react @types/react-dom

# Install shadcn/ui
npx shadcn-ui@latest init

# Add shadcn components
npx shadcn-ui@latest add button input card dialog dropdown-menu scroll-area
```

**Supabase Setup:**
1. Create Supabase project at supabase.com
2. Run database schema from section 3.3
3. Configure Row Level Security policies
4. Test authentication flow
5. Create `.env.local` with credentials

**API Integration Setup:**
1. Create lib/ai/claude.ts wrapper
2. Create lib/ai/embeddings.ts wrapper
3. Create lib/api/jikan.ts service
4. Test all API connections
5. Set up error handling

---

### 5.2 Milestone Definitions

각 마일스톤은 주차 단위가 아닌 **완료 조건 기반**으로 정의됩니다. 순서대로 진행하되, 각 마일스톤 내 태스크는 의존성이 없으면 병렬 수행 가능합니다.

#### Milestone 1: Foundation
**Goal:** 프로젝트 기반 구축 및 인증 시스템 완성
**Completion Criteria:** 사용자가 회원가입/로그인 후 보호된 페이지에 접근 가능

- [ ] Project scaffolding (Next.js + TypeScript + Tailwind)
- [ ] Database schema creation and migration
- [ ] Supabase client setup (browser + server)
- [ ] F5: Authentication implementation (signup, login, OAuth, session)
- [ ] Protected route middleware
- [ ] Basic layout (header, sidebar skeleton)

---

#### Milestone 2: Core Chat
**Goal:** AI와 대화할 수 있는 기본 채팅 시스템 완성
**Completion Criteria:** 사용자가 메시지를 보내고 AI 응답을 받을 수 있음

- [ ] F1: POST /api/chat endpoint
- [ ] F1: Claude API integration with system prompt
- [ ] F1: Message storage in database
- [ ] F1: ChatInterface component
- [ ] F1: MessageBubble component
- [ ] F1: ChatInput with validation
- [ ] F1: Typing indicator
- [ ] F1: Error handling (timeout, network error, rate limit)

---

#### Milestone 3: Recommendations
**Goal:** 추천 애니메이션을 카드 형태로 표시
**Completion Criteria:** AI 응답에 포함된 추천이 AnimeCard로 렌더링됨

- [ ] Jikan API service (lib/api/jikan.ts)
- [ ] Anime caching system (anime_cache table)
- [ ] F2: AnimeCard component
- [ ] F2: AnimeGrid layout
- [ ] F2: GenreTag and RatingDisplay components
- [ ] F2: Image loading states and placeholders
- [ ] Rate limiting for Jikan API calls

---

#### Milestone 4: Persona & History
**Goal:** 페르소나 선택과 대화 기록 기능 완성
**Completion Criteria:** 사용자가 페르소나를 선택하고 이전 대화를 다시 열 수 있음

- [ ] F3: PersonaSelector component (3 personas)
- [ ] F3: System prompts per persona (lib/ai/prompts.ts)
- [ ] F3: Persona switching logic (new conversation)
- [ ] F3: Persona indicator in chat UI
- [ ] F4: GET /api/conversations endpoint
- [ ] F4: ConversationSidebar component
- [ ] F4: Conversation list with date grouping
- [ ] F4: Delete conversation with confirmation
- [ ] F4: Auto-generated conversation titles

---

#### Milestone 5: Enhanced Features
**Goal:** 검색, 선호도 학습, 추천 이유 기능 추가
**Completion Criteria:** 각 기능이 독립적으로 동작하며 기존 기능과 통합됨

- [ ] F6: AnimeSearchBar with autocomplete (debounced)
- [ ] F6: GET /api/anime/search endpoint
- [ ] F6: Search results dropdown
- [ ] F7: Preference extraction from conversations
- [ ] F7: Vector similarity search (pgvector)
- [ ] F7: Preferences management UI
- [ ] F8: Recommendation reasoning in AI response
- [ ] F8: RecommendationReasoning expandable component

---

#### Milestone 6: Advanced Features
**Goal:** 추천 정제, 워치리스트, 시즌 탐색 기능 추가
**Completion Criteria:** 사용자가 추천을 정제하고 워치리스트를 관리할 수 있음

- [ ] F9: Multi-turn refinement flow
- [ ] F9: RefinementState management
- [ ] F9: Progress indicator component
- [ ] F10: Watchlist CRUD operations
- [ ] F10: Watchlist page UI
- [ ] F10: Watchlist status management (want_to_watch, watching, completed)
- [ ] F11: Seasonal anime fetching from Jikan API
- [ ] F11: Season/upcoming filter UI

---

#### Milestone 7: Polish & Launch
**Goal:** 성능 최적화, 보안 강화, 배포 준비
**Completion Criteria:** 프로덕션 배포 완료 및 모니터링 가동

- [ ] Code splitting and lazy loading
- [ ] Image optimization (next/image)
- [ ] Database query optimization
- [ ] Input sanitization audit
- [ ] Rate limiting stress test
- [ ] RLS policy verification
- [ ] Mobile responsiveness verification
- [ ] Error boundaries implementation
- [ ] Sentry error tracking setup
- [ ] Vercel deployment
- [ ] Production smoke tests

---

## 6. Testing Strategy

### 6.1 Unit Tests
- API route handlers
- Utility functions
- Input validators
- Data transformers

### 6.2 Integration Tests
- Auth flow (signup → login → logout)
- Chat flow (send message → receive response)
- Anime search (query → results → cache)
- Conversation management (create → update → delete)

### 6.3 E2E Tests
- Full user journey: signup → chat → recommendations → watchlist
- Multi-device testing (desktop, tablet, mobile)
- Browser compatibility (Chrome, Firefox, Safari, Edge)

### 6.4 Performance Tests
- Load testing with 100 concurrent users
- API response time < 3s for 95th percentile
- Database query time < 500ms
- Frontend First Contentful Paint < 1.5s

---

## 7. Success Metrics & KPIs

### 7.1 User Engagement
- **Daily Active Users (DAU):** Target 40% of registered users
- **Average Session Duration:** Target 10+ minutes
- **Messages per Session:** Target 8+ messages
- **Conversation Completion Rate:** Target 60% (user gets recommendations)

### 7.2 Recommendation Quality
- **Acceptance Rate:** Target 70% (user adds to watchlist or watches)
- **Click-through Rate:** Target 50% (user clicks "More Info")
- **User Satisfaction:** Target 4.0/5.0 rating

### 7.3 Technical Performance
- **API Response Time:** P95 < 3s, P99 < 5s
- **Uptime:** 99.5% excluding planned maintenance
- **Error Rate:** < 1% of all requests
- **Database Query Time:** P95 < 500ms

### 7.4 Business Metrics
- **User Retention:** D1 70%, D7 45%, D30 30%
- **Monthly Active Users:** 1,000+ by Month 3
- **Cost per Active User:** < $0.50/month
- **Net Promoter Score (NPS):** Target 40+

---

## 8. Risk Management

### 8.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Claude API downtime | Medium | High | Implement fallback to cached responses, queue system |
| Jikan API rate limits | High | Medium | Aggressive caching, fallback to local anime database |
| Database scaling issues | Low | High | Start with Supabase Pro plan, monitor query performance |
| Vector search latency | Medium | Medium | Optimize indexes, limit context window, use caching |
| OpenAI API costs exceed budget | Medium | High | Batch embeddings, cache aggressively, monitor usage |

### 8.2 Product Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Low user engagement | Medium | High | Conduct user testing, iterate on UX, add gamification |
| Poor recommendation quality | Medium | High | Fine-tune prompts, add feedback loop, A/B test personas |
| Feature creep delays MVP | High | Medium | Strict prioritization, milestone-based progress tracking |
| Competitors launch similar product | Low | Medium | Focus on unique persona feature, community building |

### 8.3 Legal & Compliance Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| MyAnimeList API ToS violation | Low | High | Use official Jikan API, cache responsibly, attribute properly |
| GDPR/CCPA compliance issues | Low | High | Implement data export, deletion, consent mechanisms |
| User-generated harmful content | Medium | Medium | Content filtering, reporting system, moderation queue |
| Copyright infringement (images) | Low | High | Use only MAL-provided images, implement takedown process |

---

## 9. Launch Checklist

### 9.1 Pre-Launch
- [ ] All P0 and P1 features complete and tested
- [ ] Performance tests passing (< 3s response time)
- [ ] Security audit complete
- [ ] Legal review (ToS, Privacy Policy)
- [ ] Analytics and monitoring set up
- [ ] Error tracking configured (Sentry)
- [ ] Database backups automated
- [ ] Rate limiting tested
- [ ] Mobile responsiveness verified

### 9.2 Launch Day
- [ ] Deploy to Vercel production
- [ ] Verify all environment variables
- [ ] Run smoke tests on production
- [ ] Monitor error rates (target < 1%)
- [ ] Monitor API latency
- [ ] Monitor database performance
- [ ] Announce on social media
- [ ] Monitor user feedback channels

### 9.3 Post-Launch
- [ ] Daily monitoring of key metrics
- [ ] Weekly user feedback review
- [ ] Bi-weekly feature prioritization
- [ ] Monthly cost analysis
- [ ] Quarterly roadmap planning

---

## 10. Future Roadmap (Post-MVP)

- [ ] **Mobile Apps:** Native iOS and Android apps
- [ ] **Social Features:** Share recommendations with friends
- [ ] **Advanced Filtering:** Filter by studio, director, voice actors
- [ ] **Watch Together:** Virtual watch parties
- [ ] **Premium Tier:** Ad-free, priority responses, exclusive personas
- [ ] **Community Features:** User reviews, ratings
- [ ] **Anime Tracker Integration:** Sync with AniList, Kitsu
- [ ] **Voice Interface:** Voice chat with AI
- [ ] **Personalized Playlists:** Curated anime marathons
- [ ] **Partnership Programs:** Streaming service integrations
- [ ] **International Expansion:** Support for Japanese, Spanish, French
- [ ] **AI-Generated Summaries:** Episode-by-episode recaps
- [ ] **Recommendation API:** B2B offering for streaming platforms
- [ ] **Browser Extension:** Recommend anime while browsing
- [ ] **Achievement System:** Gamification and rewards

---

## 11. Appendix

### 11.1 Glossary

- **MAL:** MyAnimeList, the largest anime database
- **Jikan:** Unofficial MyAnimeList REST API
- **Persona:** AI personality (sommelier, cafe owner, otaku friend)
- **Embedding:** Vector representation of text for semantic search
- **pgvector:** PostgreSQL extension for vector operations
- **RLS:** Row Level Security (Supabase access control)

### 11.2 References

- **Jikan API Docs:** https://docs.api.jikan.moe/
- **Claude API Docs:** https://docs.anthropic.com/claude/reference
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **pgvector GitHub:** https://github.com/pgvector/pgvector

### 11.3 Agent Usage Guide

이 PRD는 Claude Code 에이전트가 직접 참조하여 구현에 활용할 수 있도록 설계되었습니다.

**에이전트별 참조 가이드:**

| Agent | 참조 섹션 | 용도 |
|-------|----------|------|
| `requirement-planner` | Section 2 (Features), Section 5.2 (Milestones) | 요구사항 분석 및 태스크 분해 |
| `senior-clean-architect` | Section 3 (Architecture), Section 4 (API Specs) | 아키텍처 설계 및 코드 구현 |
| `frontend-skills` | Section 3.2 (Structure), Feature UI Components | 컴포넌트 구현 및 상태 관리 |

**Feature 참조 방법:**
- Feature ID로 참조: "F1", "F2", ... "F11"
- Milestone으로 참조: "Milestone 1", "Milestone 2", ... "Milestone 7"
- 각 Feature에는 User Story, Acceptance Criteria, Technical Requirements, UI Components, Edge Cases가 포함됨

**구현 시 주의사항:**
- 항상 Implementation Order (Section 2.2)를 따를 것
- Dependencies가 충족되었는지 확인 후 구현 시작
- Acceptance Criteria의 모든 항목을 충족해야 Feature 완료로 간주
- Edge Cases를 반드시 처리할 것

---

**End of PRD**

*This document is a living specification and will be updated as requirements evolve.*
