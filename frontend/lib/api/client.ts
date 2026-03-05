import { getSupabaseClient } from '@/lib/supabase/client';

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: object;
};

/**
 * 백엔드 API 요청 헬퍼.
 * Next.js API proxy (/api/*) 를 통해 백엔드로 전달됩니다.
 * Supabase access token을 Authorization 헤더에 자동으로 포함합니다.
 */
export async function apiRequest<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const supabase = getSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const response = await fetch(path, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error?.error || `API 오류: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
