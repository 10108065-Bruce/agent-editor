import { tokenService } from './TokenService';
import { API_CONFIG } from './config';

/**
 * STT模型服務 - 處理與語音轉文字模型相關的API請求
 */
export class STTService {
  constructor() {
    // STT模型相關緩存
    this.sttModelsCache = null;
    this.sttLastFetchTime = null;
    this.cacheExpiryTime = 10 * 60 * 1000; // 10分鐘cache過期
    this.sttPendingRequest = null; // 用於追蹤進行中的STT請求
  }

  /**
   * 獲取所有可用的STT模型
   * @returns {Promise<Array>} STT模型列表
   */
  async getSTTModels() {
    try {
      // 檢查是否有有效的快取
      const now = Date.now();
      if (
        this.sttModelsCache &&
        this.sttLastFetchTime &&
        now - this.sttLastFetchTime < this.cacheExpiryTime
      ) {
        return this.sttModelsCache;
      }

      // 如果已經有一個請求在進行中，則返回該請求
      if (this.sttPendingRequest) {
        return this.sttPendingRequest;
      }

      // 創建新請求
      const options = tokenService.createAuthHeader({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      });

      // 定義重試邏輯的函數
      const attemptFetch = async (retryCount = 0) => {
        try {
          const url = `${API_CONFIG.BASE_URL}/agent_designer/stt_model/detail`;

          const response = await fetch(url, options);

          if (!response.ok) {
            throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
          }

          const response_data = await response.json();

          // 處理 API 回傳格式的多種可能性
          let sttModels;

          // 檢查新的格式: { success: true, data: { stt_models: [...] } }
          if (response_data && response_data.success && response_data.data) {
            if (Array.isArray(response_data.data.stt_models)) {
              sttModels = response_data.data.stt_models;
            } else if (Array.isArray(response_data.data)) {
              sttModels = response_data.data;
            } else {
              console.warn('新格式中無法找到有效的 stt_models 陣列');
              return [];
            }
          }
          // 檢查舊格式: { "stt_models": [...] }
          else if (
            response_data &&
            response_data.stt_models &&
            Array.isArray(response_data.stt_models)
          ) {
            sttModels = response_data.stt_models;
          }
          // 檢查直接陣列格式: [...]
          else if (Array.isArray(response_data)) {
            sttModels = response_data;
          }
          // 檢查是否有錯誤信息
          else if (response_data && !response_data.success) {
            const errorMsg =
              response_data.error ||
              `API 錯誤: ${response_data.error_code || '未知錯誤'}`;
            console.error('API 回傳錯誤:', errorMsg);
            throw new Error(errorMsg);
          } else {
            console.warn(
              '無法從API回應中提取STT模型數據，回傳格式:',
              response_data
            );
            return [];
          }

          // 處理並驗證模型數據
          const processedData = sttModels
            .map((model, index) => {
              if (!model || typeof model !== 'object') {
                console.warn(`STT模型 ${index} 無效，跳過該模型`);
                return null;
              }

              // 根據實際API格式進行字段映射
              const modelId = model.id;
              const modelName = model.name || model.display_name;

              if (!modelId) {
                console.warn(`STT模型 ${index} 缺少id，跳過該模型`);
                return null;
              }

              if (!modelName) {
                console.warn(`STT模型 ${index} 缺少name，跳過該模型`);
                return null;
              }

              return {
                stt_model_id: modelId,
                model_name: modelName,
                display_name: model.display_name || modelName,
                description: model.description || '',
                is_enabled: model.is_enabled ?? true,
                is_default: model.is_default ?? false,
                created_at: model.created_at,
                updated_at: model.updated_at
              };
            })
            .filter((model) => model !== null && model.is_enabled); // 只返回啟用的模型

          return processedData;
        } catch (error) {
          console.error(`第 ${retryCount + 1} 次嘗試失敗:`, error);

          if (retryCount < 2) {
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * (retryCount + 1))
            );
            return attemptFetch(retryCount + 1);
          }

          console.error('所有重試都失敗，返回空陣列');
          return [];
        }
      };

      this.sttPendingRequest = attemptFetch()
        .then((processedData) => {
          this.sttModelsCache = processedData;
          this.sttLastFetchTime = now;
          this.sttPendingRequest = null;
          return processedData;
        })
        .catch((error) => {
          console.error('獲取STT模型過程中發生意外錯誤:', error);
          this.sttPendingRequest = null;
          return [];
        });

      return this.sttPendingRequest;
    } catch (error) {
      console.error('獲取STT模型過程中出錯:', error);
      this.sttPendingRequest = null;
      return [];
    }
  }

  /**
   * 獲取格式化後的STT模型選項，適用於下拉選單
   * @returns {Promise<Array>} 格式化的STT模型選項
   */
  async getSTTModelOptions() {
    try {
      const models = await this.getSTTModels();

      if (!models || !Array.isArray(models) || models.length === 0) {
        console.warn('STT模型數據無效或為空，返回空陣列');
        return [];
      }

      const options = models
        .map((model, index) => {
          if (!model || !model.stt_model_id || !model.model_name) {
            console.warn(`STT模型 ${index} 缺少必要欄位，跳過該模型`);
            return null;
          }

          return {
            value: model.stt_model_id,
            label: model.display_name || model.model_name,
            description: model.description,
            isDefault: model.is_default
          };
        })
        .filter((option) => option !== null);

      return options;
    } catch (error) {
      console.error('獲取STT模型選項失敗:', error);
      return [];
    }
  }

  /**
   * 獲取預設的STT模型
   * @returns {Promise<Object|null>} 預設模型
   */
  async getDefaultSTTModel() {
    try {
      const models = await this.getSTTModels();
      return models.find((model) => model.is_default) || models[0] || null;
    } catch (error) {
      console.error('獲取預設STT模型失敗:', error);
      return null;
    }
  }

  /**
   * 根據ID獲取特定的STT模型
   * @param {string|number} modelId 模型ID
   * @returns {Promise<Object|null>} 模型詳情
   */
  async getSTTModelById(modelId) {
    try {
      const models = await this.getSTTModels();
      return models.find((model) => model.stt_model_id == modelId) || null;
    } catch (error) {
      console.error('根據ID獲取STT模型失敗:', error);
      return null;
    }
  }

  /**
   * 預加載模型數據，通常在應用啟動時呼叫
   */
  preloadData() {
    this.getSTTModels().catch(() => {});
  }

  /**
   * 清除快取
   */
  clearCache() {
    this.sttModelsCache = null;
    this.sttLastFetchTime = null;
    this.sttPendingRequest = null;
  }

  /**
   * 強制重新獲取數據
   */
  async refresh() {
    this.clearCache();
    return await this.getSTTModels();
  }
}

// 導出單例實例
export const sttService = new STTService();
