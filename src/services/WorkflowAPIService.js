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

      const url = tokenService.createUrlWithWorkspace(
        `${API_CONFIG.BASE_URL}/agent_designer/workflows/load`
      );
      const response = await fetch(url, options);

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
   * 切換工作流鎖定狀態
   * @param {string} workflowId - 工作流 ID
   * @param {boolean} isLocked - 是否鎖定
   * @returns {Promise<Object>} API 回應
   */
  async toggleWorkflowLock(workflowId, isLocked) {
    try {
      const options = tokenService.createAuthHeader({
        method: 'PATCH',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          is_locked: isLocked
        })
      });

      const url = tokenService.createUrlWithWorkspace(
        `${API_CONFIG.BASE_URL}/agent_designer/workflows/${workflowId}/lock`
      );

      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
      }

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error('切換工作流鎖定狀態失敗:', error);
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

      const url = tokenService.createUrlWithWorkspace(
        `${API_CONFIG.BASE_URL}/agent_designer/workflows/`
      );

      const response = await fetch(url, options);

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

      const url = tokenService.createUrlWithWorkspace(
        `${API_CONFIG.BASE_URL}/agent_designer/workflows/`
      );
      const response = await fetch(url, options);

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

  /**
   * 檢查工作流
   * @param {Object} flowData - 工作流數據（轉換後的 API 格式）
   * @returns {Promise<Object>} 檢查結果，包含 failures 陣列
   */
  async checkWorkflow(flowData) {
    try {
      const options = tokenService.createAuthHeader({
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          flow_pipeline: flowData.flow_pipeline
        })
      });

      const url = `${API_CONFIG.BASE_URL}/agent_designer/workflows/check`;

      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('檢查工作流失敗:', error);
      throw error;
    }
  }

  /**
   * 取得可用的節點清單
   * @returns {Promise<Array>} 節點清單
   */
  async getNodeList() {
    try {
      const options = tokenService.createAuthHeader({
        method: 'GET',
        headers: {
          accept: 'application/json'
        }
      });

      const url = tokenService.createUrlWithWorkspace(
        `${API_CONFIG.BASE_URL}/agent_designer/workspaces/{workspace_id}/nodes`
      );

      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('取得節點清單失敗:', error);
      throw error;
    }
  }
}
