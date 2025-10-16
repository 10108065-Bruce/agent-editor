import { API_CONFIG } from './config';
import { tokenService } from './TokenService';
// import mockRunHistory from './runhistory_mock.js';

/**
 * 執行歷史 API 服務
 */
export class RunHistoryAPIService {
  constructor() {}

  /**
   * 取得節點的 Input/Output 資料
   * @param {Object} nodeData - 節點資料物件
   * @returns {Object} 節點 I/O 資料
   */
  getNodeIO(nodeData) {
    if (!nodeData) return null;

    return {
      inputs: nodeData.node_input,
      outputs: nodeData.node_output
    };
  }

  /**
   * 獲取執行歷史列表
   * @param {string} workflowId - 工作流 ID
   * @param {number} page - 頁碼（預設為 1）
   * @returns {Promise<Object>} 執行歷史數據
   */
  async getRunHistory(workflowId, page = 1) {
    try {
      // TODO: 實際 API 呼叫
      const options = tokenService.createAuthHeader({
        method: 'GET',
        headers: {
          accept: 'application/json'
        }
      });

      const url = tokenService.createUrlWithWorkspace(
        `${API_CONFIG.BASE_URL}/agent_designer/workflows/${workflowId}/execution-logs?page=${page}`
      );

      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
      }

      const data = await response.json();
      return data;

      // Mock 資料
      // await new Promise((resolve) => setTimeout(resolve, 500)); // 模擬網路延遲
      // return mockRunHistory;
      // return this.getMockRunHistory();
    } catch (error) {
      console.error('獲取失敗:', error);
      throw error;
    }
  }
}

// 建立單例實例
export const runHistoryAPIService = new RunHistoryAPIService();
