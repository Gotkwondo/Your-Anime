import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { SupabaseService } from '../supabase/supabase.service.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  accessToken: string;
}

declare module 'express' {
  interface Request {
    user?: AuthenticatedUser;
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException({
        success: false,
        error: 'Authorization header가 누락되었거나 형식이 올바르지 않습니다.',
        statusCode: 401,
      });
    }

    try {
      const supabase = this.supabaseService.getServiceRoleClient();
      const { data, error } = await supabase.auth.getUser(token);

      if (error || !data.user) {
        throw new UnauthorizedException({
          success: false,
          error: '유효하지 않거나 만료된 토큰입니다.',
          statusCode: 401,
        });
      }

      // 요청 객체에 인증된 사용자 정보 주입
      request.user = {
        id: data.user.id,
        email: data.user.email ?? '',
        accessToken: token,
      };

      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException({
        success: false,
        error: '인증 처리 중 오류가 발생했습니다.',
        statusCode: 401,
      });
    }
  }

  private extractTokenFromHeader(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return null;
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      return null;
    }

    return token;
  }
}
