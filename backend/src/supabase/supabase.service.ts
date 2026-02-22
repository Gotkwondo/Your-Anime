import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly serviceRoleClient: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.getOrThrow<string>('SUPABASE_URL');
    const serviceRoleKey = this.configService.getOrThrow<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    // 서비스 롤 클라이언트: RLS 우회, 서버 전용
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.serviceRoleClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  /**
   * 서비스 롤 클라이언트를 반환합니다.
   * RLS를 우회하므로 반드시 서버 내부에서만 사용해야 합니다.
   */
  getServiceRoleClient(): SupabaseClient {
    return this.serviceRoleClient;
  }

  /**
   * 특정 사용자 토큰으로 클라이언트를 생성합니다.
   * RLS 정책이 적용된 사용자 컨텍스트 클라이언트입니다.
   */
  createUserClient(accessToken: string): SupabaseClient {
    const supabaseUrl = this.configService.getOrThrow<string>('SUPABASE_URL');
    const serviceRoleKey = this.configService.getOrThrow<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return createClient(supabaseUrl, serviceRoleKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
}
