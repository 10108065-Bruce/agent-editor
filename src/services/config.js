/**
 * API 配置常數
 */
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://172.21.4.163:9000/v1',
  CREATE_WEBHOOK_URL:
    import.meta.env.VITE_CREATE_WEBHOOK_URL ||
    'https://lightly-mature-lemming.ngrok-free.app/v1/external_service/webhook'
};
