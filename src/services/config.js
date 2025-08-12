/**
 * API 配置常數
 */
export const API_CONFIG = {
  BASE_URL: 'https://api-dev-qoca-apa.qrilab.com/v1',
  CREATE_WEBHOOK_URL:
    import.meta.env.VITE_CREATE_WEBHOOK_URL ||
    'https://lightly-mature-lemming.ngrok-free.app/v1/external_service/webhook'
};
