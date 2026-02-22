import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS 설정 (FRONTEND_URL 기준)
  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
  app.enableCors({
    origin: frontendUrl,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  // 전역 예외 필터
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Swagger API 문서 설정
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('AnimeSommelier API')
      .setDescription('AI 기반 애니메이션 추천 서비스 API')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Supabase access token을 입력하세요.',
        },
        'bearer',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = parseInt(process.env.PORT ?? '3001', 10);
  await app.listen(port);

  console.log(
    `[AnimeSommelier] Backend running on http://localhost:${port}/api`,
  );
  if (process.env.NODE_ENV !== 'production') {
    console.log(
      `[AnimeSommelier] Swagger docs: http://localhost:${port}/api/docs`,
    );
  }
}

bootstrap().catch((err) => {
  console.error('애플리케이션 시작 실패:', err);
  process.exit(1);
});
