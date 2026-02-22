import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

// Zod 스키마 정의
export const CreateChatSchema = z.object({
  message: z
    .string()
    .min(1, '메시지를 입력해주세요.')
    .max(5000, '메시지는 5000자를 초과할 수 없습니다.'),
  conversationId: z
    .string()
    .uuid('conversationId는 유효한 UUID 형식이어야 합니다.'),
});

export type CreateChatDto = z.infer<typeof CreateChatSchema>;

// Swagger 문서화를 위한 클래스
export class CreateChatDtoClass {
  @ApiProperty({
    description: '사용자 메시지 (1~5000자)',
    example: '액션 장르에서 뭔가 추천해줄 수 있어?',
    minLength: 1,
    maxLength: 5000,
  })
  message!: string;

  @ApiProperty({
    description: '대화 UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  conversationId!: string;
}
