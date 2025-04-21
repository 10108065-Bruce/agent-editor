// src/services/MockApiService.js

/**
 * 用於儲存流程資料的模擬 API 服務
 * 在真實應用程式中，這將會向後端發送實際的 HTTP 請求
 */
export default class MockApiService {
  /**
   * 將流程資料儲存到模擬 API
   * @param {Object} flowData - 要儲存的流程資料
   * @returns {Promise} - 成功時返回成功響應，失敗時返回錯誤
   */
  static saveFlow(flowData) {
    console.log('MockApiService: 正在儲存流程資料...', flowData);

    // 模擬 API 呼叫，50% 成功機率，50% 失敗機率
    return new Promise((resolve, reject) => {
      // 模擬網路延遲
      setTimeout(() => {
        // 隨機成功或失敗以展示兩種情況
        const isSuccess = Math.random() > 0.8;

        if (isSuccess) {
          const response = {
            success: true,
            message: '流程已成功儲存',
            flowId: 'flow_' + Date.now(),
            timestamp: new Date().toISOString()
          };
          console.log('MockApiService: 儲存成功', response);
          resolve(response);
        } else {
          const error = {
            success: false,
            message: '儲存流程失敗',
            errorCode: 'ERR_SERVER',
            details: '模擬伺服器錯誤'
          };
          console.error('MockApiService: 儲存失敗', error);
          reject(error);
        }
      }, 1500); // 模擬 1.5 秒的延遲
    });
  }

  /**
   * 從模擬 API 載入流程資料
   * @param {string} flowId - 要載入的流程 ID
   * @returns {Promise} - 成功時返回流程資料，失敗時返回錯誤
   */
  static loadFlow(flowId) {
    console.log('MockApiService: 正在載入流程資料，ID:', flowId);

    return new Promise((resolve, reject) => {
      // 優先從 localStorage 獲取資料
      const savedData = localStorage.getItem('flowEditorData');

      setTimeout(() => {
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            console.log('MockApiService: 載入成功', parsedData);
            resolve({
              success: true,
              data: parsedData,
              message: '流程已成功載入'
            });
          } catch {
            reject({
              success: false,
              message: '解析流程資料失敗',
              errorCode: 'ERR_PARSE'
            });
          }
        } else {
          reject({
            success: false,
            message: '找不到流程資料',
            errorCode: 'ERR_NOT_FOUND'
          });
        }
      }, 1000); // 模擬 1 秒的延遲
    });
  }
}
