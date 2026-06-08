"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NOTIFICATION_JOBS = exports.AI_JOBS = exports.SYNC_JOBS = exports.QUEUE_NAMES = void 0;
exports.QUEUE_NAMES = {
    SYNC: 'sync-queue',
    AI: 'ai-queue',
    NOTIFICATION: 'notification-queue',
};
exports.SYNC_JOBS = {
    SYNC_ACCOUNTS: 'sync-accounts',
    SYNC_TRANSACTIONS: 'sync-transactions',
    SYNC_INVESTMENTS: 'sync-investments',
};
exports.AI_JOBS = {
    CATEGORIZE_TRANSACTION: 'categorize-transaction',
    GENERATE_INSIGHTS: 'generate-insights',
    DETECT_ANOMALIES: 'detect-anomalies',
};
exports.NOTIFICATION_JOBS = {
    BUDGET_ALERT: 'budget-alert',
};
//# sourceMappingURL=queue.constants.js.map