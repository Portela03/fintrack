export const QUEUE_NAMES = {
  SYNC: 'sync-queue',
  AI: 'ai-queue',
  NOTIFICATION: 'notification-queue',
} as const;

export const SYNC_JOBS = {
  SYNC_ACCOUNTS: 'sync-accounts',
  SYNC_TRANSACTIONS: 'sync-transactions',
  SYNC_INVESTMENTS: 'sync-investments',
} as const;

export const AI_JOBS = {
  CATEGORIZE_TRANSACTION: 'categorize-transaction',
  GENERATE_INSIGHTS: 'generate-insights',
  DETECT_ANOMALIES: 'detect-anomalies',
} as const;

export const NOTIFICATION_JOBS = {
  BUDGET_ALERT: 'budget-alert',
} as const;
