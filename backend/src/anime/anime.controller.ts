import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard.js';
import { AnimeService } from './anime.service.js';

@ApiTags('anime')
@ApiSecurity('bearer')
@Controller('anime')
@UseGuards(AuthGuard)
export class AnimeController {
  constructor(private readonly animeService: AnimeService) {}

  /**
   * GET /api/anime/search?q={query}&limit=5
   * 애니메이션 검색 (캐시 우선)
   */
  @Get('search')
  @ApiOperation({
    summary: '애니메이션 검색',
    description:
      '제목으로 애니메이션을 검색합니다. anime_cache를 우선 조회하고 미스 시 Jikan API를 호출합니다.',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    description: '검색 쿼리 (최소 2자)',
    example: '진격의 거인',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: '결과 수 (기본: 5, 최대: 20)',
    example: 5,
  })
  @ApiResponse({ status: 200, description: '검색 결과 반환' })
  @ApiResponse({ status: 400, description: '쿼리 파라미터 오류' })
  async searchAnime(
    @Query('q') query: string,
    @Query('limit') limit: string = '5',
  ): Promise<{ success: true; data: object }> {
    if (!query || query.trim().length < 2) {
      throw new BadRequestException({
        success: false,
        error: '검색어는 최소 2자 이상이어야 합니다.',
        statusCode: 400,
      });
    }

    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 5, 1), 20);
    const result = await this.animeService.searchAnime(
      query.trim(),
      parsedLimit,
    );

    return { success: true, data: result };
  }

  /**
   * GET /api/anime/:id
   * 단건 애니메이션 조회 (캐시 우선)
   */
  @Get(':id')
  @ApiOperation({
    summary: '애니메이션 단건 조회',
    description:
      'MAL ID로 특정 애니메이션 정보를 조회합니다. anime_cache를 우선 조회하고 미스 시 Jikan API를 호출합니다.',
  })
  @ApiResponse({ status: 200, description: '애니메이션 정보 반환' })
  @ApiResponse({ status: 404, description: '해당 애니메이션 없음' })
  async getAnime(
    @Param(
      'id',
      new ParseIntPipe({
        errorHttpStatusCode: 400,
        exceptionFactory: () =>
          new BadRequestException({
            success: false,
            error: 'anime id는 정수여야 합니다.',
            statusCode: 400,
          }),
      }),
    )
    id: number,
  ): Promise<{ success: true; data: object }> {
    const result = await this.animeService.getAnimeById(id);
    return { success: true, data: result };
  }
}
