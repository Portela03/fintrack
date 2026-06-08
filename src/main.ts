import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './shared/infrastructure/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('FinTrack API')
    .setDescription(
      `## Sistema de Organização Financeira Pessoal com IA\n\n` +
      `API REST para gestão financeira pessoal com integração ao **Open Finance Brasil** via Pluggy e assistente de IA via **Google Gemini 2.0 Flash**.\n\n` +
      `### Autenticação\n` +
      `1. Registre-se em \`POST /auth/register\`\n` +
      `2. Faça login em \`POST /auth/login\` para obter o \`accessToken\`\n` +
      `3. Clique em **Authorize** e informe: \`Bearer {accessToken}\`\n\n` +
      `### Módulos\n` +
      `| Módulo | Descrição |\n` +
      `|--------|----------|\n` +
      `| **Auth** | Registro e autenticação JWT |\n` +
      `| **Banking** | Conexão com bancos via Pluggy (Open Finance) |\n` +
      `| **Financial** | Transações e relatórios de gastos |\n` +
      `| **Budgeting** | Orçamentos por categoria |\n` +
      `| **Goals** | Metas financeiras com acompanhamento |\n` +
      `| **Financing** | Simulação SAC/PRICE para financiamentos |\n` +
      `| **AI Assistant** | Chat e insights com Gemini 2.0 Flash |`,
    )
    .setVersion('1.0')
    .setContact('FinTrack', '', '')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Informe o accessToken obtido no login' },
      'JWT',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env['PORT'] ?? 3000;
  await app.listen(port);
  console.log(`🚀 FinTrack API running on http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/docs`);
}

bootstrap();
