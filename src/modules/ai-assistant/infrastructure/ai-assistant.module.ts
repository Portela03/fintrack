import { Module } from '@nestjs/common';
import {
  CHAT_PORT,
  CATEGORIZATION_PORT,
  INSIGHT_PORT,
} from '../application/ports/i-llm.port';
import { GeminiAdapter } from './adapters/gemini.adapter';
import { AiController } from './http/ai.controller';
import { SendMessageUseCase } from '../application/use-cases/send-message/send-message.use-case';
import { GenerateInsightsUseCase } from '../application/use-cases/generate-insights/generate-insights.use-case';

@Module({
  controllers: [AiController],
  providers: [
    GeminiAdapter,
    { provide: CHAT_PORT, useExisting: GeminiAdapter },
    { provide: CATEGORIZATION_PORT, useExisting: GeminiAdapter },
    { provide: INSIGHT_PORT, useExisting: GeminiAdapter },
    SendMessageUseCase,
    GenerateInsightsUseCase,
  ],
  exports: [CATEGORIZATION_PORT],
})
export class AiAssistantModule {}
