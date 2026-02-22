import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import type { Request as ExpressRequest } from 'express';
import { z } from 'zod';
import { AuthGuard } from '../auth/auth.guard.js';
import { ConversationsService, PersonaType } from './conversations.service.js';

const CreateConversationSchema = z.object({
  personaType: z
    .enum(['sommelier', 'cafe_owner', 'otaku_friend'])
    .refine(
      (val) => ['sommelier', 'cafe_owner', 'otaku_friend'].includes(val),
      {
        message:
          'personaType은 sommelier, cafe_owner, otaku_friend 중 하나여야 합니다.',
      },
    ),
  title: z.string().max(200).optional(),
});

@ApiTags('conversations')
@ApiSecurity('bearer')
@Controller('conversations')
@UseGuards(AuthGuard)
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  /**
   * GET /api/conversations
   * 사용자의 대화 목록 조회 (페이지네이션)
   */
  @Get()
  @ApiOperation({ summary: '대화 목록 조회' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  @ApiResponse({ status: 200, description: '대화 목록 반환' })
  async listConversations(
    @Query('limit') limit: string = '20',
    @Query('offset') offset: string = '0',
    @Req() req: ExpressRequest,
  ): Promise<{ success: true; data: object }> {
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const parsedOffset = Math.max(parseInt(offset, 10) || 0, 0);

    const result = await this.conversationsService.listConversations(
      req.user!.id,
      parsedLimit,
      parsedOffset,
    );

    return { success: true, data: result };
  }

  /**
   * POST /api/conversations
   * 새 대화 생성
   */
  @Post()
  @ApiOperation({ summary: '새 대화 생성' })
  @ApiResponse({ status: 201, description: '생성된 대화 정보 반환' })
  @ApiResponse({ status: 400, description: '잘못된 personaType' })
  async createConversation(
    @Body() body: { personaType: PersonaType; title?: string },
    @Req() req: ExpressRequest,
  ): Promise<{ success: true; data: object }> {
    const parseResult = CreateConversationSchema.safeParse(body);
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

    const result = await this.conversationsService.createConversation(
      req.user!.id,
      parseResult.data.personaType,
      parseResult.data.title,
    );

    return { success: true, data: result };
  }

  /**
   * GET /api/conversations/:id
   * 특정 대화 + 전체 메시지 조회
   */
  @Get(':id')
  @ApiOperation({ summary: '특정 대화 및 메시지 조회' })
  @ApiResponse({ status: 200, description: '대화 상세 정보 및 메시지 목록' })
  @ApiResponse({ status: 404, description: '대화를 찾을 수 없음' })
  async getConversation(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 400 })) id: string,
    @Req() req: ExpressRequest,
  ): Promise<{ success: true; data: object }> {
    const result = await this.conversationsService.getConversation(
      id,
      req.user!.id,
    );
    return { success: true, data: result };
  }

  /**
   * DELETE /api/conversations/:id
   * 대화 삭제
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '대화 삭제' })
  @ApiResponse({ status: 200, description: '삭제 성공' })
  @ApiResponse({ status: 404, description: '대화를 찾을 수 없음' })
  async deleteConversation(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 400 })) id: string,
    @Req() req: ExpressRequest,
  ): Promise<{ success: true; data: { message: string } }> {
    await this.conversationsService.deleteConversation(id, req.user!.id);
    return { success: true, data: { message: '대화가 삭제되었습니다.' } };
  }
}
