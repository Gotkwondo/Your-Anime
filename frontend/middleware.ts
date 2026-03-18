import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // 환경변수가 없으면 미들웨어 건너뜀 (빌드 중 or 환경변수 미설정 방어)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  try {
    // 세션 갱신 (중요: getUser()를 반드시 호출해야 토큰이 갱신됨)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 인증이 필요한 라우트 보호
    const isAppRoute =
      request.nextUrl.pathname.startsWith('/chat') ||
      request.nextUrl.pathname.startsWith('/discover');

    if (isAppRoute && !user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/login';
      return NextResponse.redirect(redirectUrl);
    }
  } catch {
    // Supabase 호출 실패 시 미들웨어 크래시 방지 — 그냥 통과
    return NextResponse.next();
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|auth/|login|signup).*)',
  ],
};
