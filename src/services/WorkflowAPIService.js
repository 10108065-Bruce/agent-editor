import { API_CONFIG } from './config';
import { tokenService } from './TokenService';

/**
 * 更新後的工作流 API 服務，使用共用的映射功能
 */
export class WorkflowAPIService {
  constructor() {}

  /**
   * 載入工作流數據
   * @param {string} workflowId - 要載入的工作流 ID
   * @returns {Promise<Object>} 工作流數據
   */
  async loadWorkflow(workflowId) {
    try {
      console.log(`嘗試載入工作流 ID: ${workflowId}`);
      // 使用 tokenService 創建帶有 Authorization 的請求配置
      const options = tokenService.createAuthHeader({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          flow_id: workflowId
        })
      });

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/agent_designer/workflows/load`,
        options
      );

      if (!response.ok) {
        throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
      }

      const data = await response.json();
      console.log('成功載入工作流數據');
      return data;
    } catch (error) {
      console.error('載入工作流失敗:', error);
      throw error;
    }
  }

  /**
   * 建立工作流數據
   * @param {Object} data - 要保存的工作流數據
   * @returns {Promise<Object>} API 回應
   */
  async createWorkflow(data) {
    console.log('創建新工作流:', data);
    try {
      const options = tokenService.createAuthHeader({
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          flow_name: data.flow_name,
          content: data.content,
          flow_pipeline: data.flow_pipeline
        })
      });

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/agent_designer/workflows/`,
        options
      );

      if (!response.ok) {
        throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('工作流創建成功');
      return responseData;
    } catch (error) {
      console.error('保存工作流失敗:', error);
      throw error;
    }
  }

  /**
   * 保存工作流數據
   * @param {Object} data - 要保存的工作流數據
   * @returns {Promise<Object>} API 回應
   */
  async updateWorkflow(data) {
    console.log('更新工作流:', data);
    try {
      const options = tokenService.createAuthHeader({
        method: 'PUT',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          flow_name: data.flow_name,
          content: data.content,
          flow_id: data.flow_id,
          flow_pipeline: data.flow_pipeline
        })
      });
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/agent_designer/workflows/`,
        options
      );

      if (!response.ok) {
        throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('工作流更新成功');
      return responseData;
    } catch (error) {
      console.error('保存工作流失敗:', error);
      throw error;
    }
  }
}
