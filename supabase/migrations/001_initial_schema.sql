-- ============================================================
-- AnimeSommelier Initial Schema Migration
-- Version: 001
-- Description: MVP 데이터베이스 스키마 초기 설정
-- ============================================================

-- Extensions 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================
-- 1. user_profiles 테이블
--    Supabase Auth(auth.users)를 확장하는 프로필 테이블
-- ============================================================
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  preferences JSONB NOT NULL DEFAULT '{}'::JSONB,
  settings JSONB NOT NULL DEFAULT '{
    "theme": "system",
    "defaultPersona": "sommelier",
    "emailNotifications": true
  }'::JSONB
);

-- ============================================================
-- 2. conversations 테이블
-- ============================================================
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  persona_type TEXT NOT NULL CHECK (persona_type IN ('sommelier', 'cafe_owner', 'otaku_friend')),
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB
);

-- ============================================================
-- 3. messages 테이블 (vector(1536) embedding 포함)
-- ============================================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  embedding vector(1536),
  anime_references JSONB NOT NULL DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB
);

-- ============================================================
-- 4. anime_cache 테이블
-- ============================================================
CREATE TABLE public.anime_cache (
  mal_id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  title_english TEXT,
  title_japanese TEXT,
  data JSONB NOT NULL,
  cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days')
);

-- ============================================================
-- 5. user_preferences 테이블 (vector embedding 포함)
-- ============================================================
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('genre', 'theme', 'mood', 'avoid')),
  preference_text TEXT NOT NULL,
  embedding vector(1536),
  confidence_score FLOAT NOT NULL DEFAULT 1.0 CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 6. watchlist 테이블
-- ============================================================
CREATE TABLE public.watchlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  mal_id INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('want_to_watch', 'watching', 'completed', 'dropped')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  notes TEXT,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, mal_id)
);

-- ============================================================
-- 7. recommendation_history 테이블
-- ============================================================
CREATE TABLE public.recommendation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  mal_id INTEGER NOT NULL,
  reasoning TEXT,
  was_accepted BOOLEAN DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 인덱스 생성
-- ============================================================

-- conversations 인덱스
CREATE INDEX idx_conversations_user_id
  ON public.conversations(user_id);
CREATE INDEX idx_conversations_updated_at
  ON public.conversations(updated_at DESC);

-- messages 인덱스
CREATE INDEX idx_messages_conversation_id
  ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at
  ON public.messages(created_at);
-- ivfflat 벡터 인덱스 (cosine 유사도)
CREATE INDEX idx_messages_embedding
  ON public.messages USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- user_preferences 인덱스
CREATE INDEX idx_user_preferences_user_id
  ON public.user_preferences(user_id);
CREATE INDEX idx_user_preferences_embedding
  ON public.user_preferences USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- anime_cache 인덱스
CREATE INDEX idx_anime_cache_expires_at
  ON public.anime_cache(expires_at);

-- watchlist 인덱스
CREATE INDEX idx_watchlist_user_id
  ON public.watchlist(user_id);

-- recommendation_history 인덱스
CREATE INDEX idx_recommendation_history_user_id
  ON public.recommendation_history(user_id);

-- ============================================================
-- Row Level Security (RLS) 활성화
-- ============================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anime_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_history ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS 정책: user_profiles
-- ============================================================
CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================
-- RLS 정책: conversations
-- ============================================================
CREATE POLICY "Users can view own conversations"
  ON public.conversations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
  ON public.conversations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON public.conversations
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON public.conversations
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- RLS 정책: messages
-- ============================================================
CREATE POLICY "Users can view own messages"
  ON public.messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id
        AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own conversations"
  ON public.messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id
        AND user_id = auth.uid()
    )
  );

-- ============================================================
-- RLS 정책: user_preferences
-- ============================================================
CREATE POLICY "Users can view own preferences"
  ON public.user_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.user_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences"
  ON public.user_preferences
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- RLS 정책: anime_cache (모든 인증된 유저 읽기 가능, 서버만 쓰기)
-- ============================================================
CREATE POLICY "Authenticated users can read anime cache"
  ON public.anime_cache
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================================
-- RLS 정책: watchlist
-- ============================================================
CREATE POLICY "Users can view own watchlist"
  ON public.watchlist
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watchlist"
  ON public.watchlist
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watchlist"
  ON public.watchlist
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlist"
  ON public.watchlist
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- RLS 정책: recommendation_history
-- ============================================================
CREATE POLICY "Users can view own recommendation history"
  ON public.recommendation_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recommendation history"
  ON public.recommendation_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- updated_at 자동 갱신 트리거 함수
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- conversations updated_at 트리거
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- user_preferences updated_at 트리거
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- watchlist updated_at 트리거
CREATE TRIGGER update_watchlist_updated_at
  BEFORE UPDATE ON public.watchlist
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 벡터 유사도 검색 함수
-- ============================================================
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
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.conversation_id,
    m.content,
    1 - (m.embedding <=> query_embedding) AS similarity
  FROM public.messages m
  JOIN public.conversations c ON m.conversation_id = c.id
  WHERE c.user_id = user_id_param
    AND m.embedding IS NOT NULL
    AND 1 - (m.embedding <=> query_embedding) > match_threshold
  ORDER BY m.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================================
-- 만료된 캐시 정리 함수
-- ============================================================
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.anime_cache
  WHERE expires_at < NOW();
END;
$$;

-- ============================================================
-- Supabase Auth 트리거: 신규 사용자 프로필 자동 생성
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
