export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}
export interface IChatPort {
    chat(history: ChatMessage[], message: string, systemContext?: string): Promise<string>;
}
export interface ICategorizationPort {
    categorize(description: string, amount: number): Promise<string>;
}
export interface IInsightPort {
    generateInsights(financialSummary: string): Promise<string>;
}
export declare const CHAT_PORT: unique symbol;
export declare const CATEGORIZATION_PORT: unique symbol;
export declare const INSIGHT_PORT: unique symbol;
