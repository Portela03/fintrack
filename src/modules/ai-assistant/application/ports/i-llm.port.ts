export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface IChatPort {
  chat(
    history: ChatMessage[],
    message: string,
    systemContext?: string,
  ): Promise<string>;
}

export interface ICategorizationPort {
  categorize(description: string, amount: number): Promise<string>;
}

export interface IInsightPort {
  generateInsights(financialSummary: string): Promise<string>;
}

export const CHAT_PORT = Symbol('IChatPort');
export const CATEGORIZATION_PORT = Symbol('ICategorizationPort');
export const INSIGHT_PORT = Symbol('IInsightPort');
