// services/WebhookService.js
import { API_CONFIG } from './config';
import { tokenService } from './TokenService';

export class WebhookService {
  /**
   * 創建 Webhook URL
   * @param {string} flowId - Flow ID
   * @param {string} webhookInputNodeId - Webhook Input Node ID
   * @returns {Promise<Object>} - 包含 curl_example 的回應
   */
  static async createWebhookUrl(flowId, webhookInputNodeId) {
    try {
      console.log(
        `創建 Webhook URL: flowId=${flowId}, nodeId=${webhookInputNodeId}`
      );

      // 構建完整的 API URL
      const apiUrl = `${API_CONFIG.BASE_URL}/agent_designer/webhook/url/${flowId}/${webhookInputNodeId}`;

      // 創建帶有 workspace_id 的 URL
      // const urlWithWorkspace = tokenService.createUrlWithWorkspace(apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        ...tokenService.createAuthHeader({
          headers: {
            'Content-Type': 'application/json'
          }
        })
      });

      const data = await response.json();

      console.log('Webhook URL 創建成功:', data);

      // 檢查回應格式
      if (
        data.success &&
        data.status === 'COMPLETED' &&
        data.data?.curl_example
      ) {
        return {
          success: true,
          curl_example: data.data.curl_example,
          webhook_url: data.data.webhook_url,
          'X-QOCA-Agent-Api-Key': data.data['X-QOCA-Agent-Api-Key']
        };
      } else {
        throw new Error('回應格式不正確或缺少 curl_example');
      }
    } catch (error) {
      console.error('創建 Webhook URL 失敗:', error);
      throw new Error(`創建 Webhook 失敗: ${error.message}`);
    }
  }

  /**
   * 創建 Webhook URL (實例方法)
   * @param {string} flowId - Flow ID
   * @param {string} webhookInputNodeId - Webhook Input Node ID
   * @returns {Promise<Object>} - 包含 curl_example 的回應
   */
  async createWebhook(flowId, webhookInputNodeId) {
    return WebhookService.createWebhookUrl(flowId, webhookInputNodeId);
  }
}
