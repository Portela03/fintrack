import { Module } from '@nestjs/common';
import {
  CHAT_PORT,
  CATEGORIZATION_PORT,
  INSIGHT_PORT,
} from '../application/ports/i-llm.port';
import { OpenRouterAdapter } from './adapters/openrouter.adapter';
import { AiController } from './http/ai.controller';
import { SendMessageUseCase } from '../application/use-cases/send-message/send-message.use-case';
import { GenerateInsightsUseCase } from '../application/use-cases/generate-insights/generate-insights.use-case';

@Module({
  controllers: [AiController],
  providers: [
    OpenRouterAdapter,
    { provide: CHAT_PORT, useExisting: OpenRouterAdapter },
    { provide: CATEGORIZATION_PORT, useExisting: OpenRouterAdapter },
    { provide: INSIGHT_PORT, useExisting: OpenRouterAdapter },
    SendMessageUseCase,
    GenerateInsightsUseCase,
  ],
  exports: [CATEGORIZATION_PORT],
})
export class AiAssistantModule {}
