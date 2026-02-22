import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import type { Request as ExpressRequest } from 'express';
import { AuthGuard } from '../auth/auth.guard.js';
import { ChatService } from './chat.service.js';
import { CreateChatDtoClass, CreateChatSchema } from './dto/create-chat.dto.js';

@ApiTags('chat')
@ApiSecurity('bearer')
@Controller('chat')
@UseGuards(AuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @ApiOperation({
    summary: '메시지 전송 및 AI 응답 수신',
    description:
      '사용자 메시지를 전송하고 Claude AI의 애니메이션 추천 응답을 받습니다.',
  })
  @ApiResponse({
    status: 200,
    description: 'AI 응답 및 추천 애니메이션 목록',
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 형식' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 403, description: '대화 접근 권한 없음' })
  @ApiResponse({ status: 429, description: '요청 한도 초과' })
  async createChat(
    @Body() body: CreateChatDtoClass,
    @Req() req: ExpressRequest,
  ): Promise<{ success: true; data: object }> {
    // Zod로 입력 유효성 검사
    const parseResult = CreateChatSchema.safeParse(body);
    if (!parseResult.success) {
      const errorMessage = parseResult.error.issues
        .map((e) => e.message)
        .join(', ');
      throw new BadRequestException({
        success: false,
        error: errorMessage,
        statusCode: 400,
      });
    }

    const userId = req.user!.id;
    const result = await this.chatService.processChat(parseResult.data, userId);

    return {
      success: true,
      data: result,
    };
  }
}
