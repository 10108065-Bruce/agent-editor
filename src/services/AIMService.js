import { tokenService } from './TokenService';
import { API_CONFIG } from './config';

/**
 * AIM模型服務 - 處理與AIM模型和LLM Vision模型相關的API請求
 */
export class AIMService {
  constructor() {
    // AIM模型相關緩存 - 改為支援多個 config_id
    this.aimModelsCache = {};
    this.aimLastFetchTime = {};

    // LLM Vision模型相關緩存
    this.llmVisionModelsCache = null;
    this.llmVisionLastFetchTime = null;

    // AIM 欄位資訊緩存
    this.aimFieldInfoCache = new Map();
    this.aimFieldInfoLastFetchTime = new Map();

    this.cacheExpiryTime = 10 * 60 * 1000; // 10分鐘cache過期
    this.aimPendingRequest = {}; // 用於追蹤進行中的AIM請求
    this.llmVisionPendingRequest = null;
    this.aimFieldInfoPendingRequests = new Map();
  }

  /**
   * 獲取 AIM 模型的欄位資訊
   * @param {number} trainingId - 訓練模型 ID
   * @param {number} externalServiceConfigId - 外部服務配置 ID
   * @returns {Promise<string>} 欄位資訊字串
   */
  async getAIMFieldInfo(trainingId, externalServiceConfigId = null) {
    try {
      // 驗證 trainingId
      if (!trainingId || trainingId === 0) {
        console.log('trainingId 無效，跳過欄位資訊獲取');
        return '';
      }

      const cacheKey = `${trainingId}_${externalServiceConfigId || 'default'}`;

      // 檢查是否有有效的快取
      const now = Date.now();
      const lastFetchTime = this.aimFieldInfoLastFetchTime.get(cacheKey);
      const cachedData = this.aimFieldInfoCache.get(cacheKey);

      if (
        cachedData &&
        lastFetchTime &&
        now - lastFetchTime < this.cacheExpiryTime
      ) {
        return cachedData;
      }

      // 如果已經有相同的請求在進行中，則返回該請求
      if (this.aimFieldInfoPendingRequests.has(cacheKey)) {
        return this.aimFieldInfoPendingRequests.get(cacheKey);
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
          console.log(
            `嘗試獲取 AIM 欄位資訊，第 ${
              retryCount + 1
            } 次嘗試 (training_id: ${trainingId}, config_id: ${externalServiceConfigId})`
          );

          // 創建查詢參數
          const queryParams = { training_id: trainingId };
          if (externalServiceConfigId) {
            queryParams.external_service_config_id = externalServiceConfigId;
          }

          // 使用新的方法創建帶 workspace_id 的 URL
          const url = tokenService.createUrlWithWorkspace(
            `${API_CONFIG.BASE_URL}/agent_designer/aim/field-info`,
            queryParams
          );

          const response = await fetch(url, options);

          if (!response.ok) {
            throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
          }

          let fieldInfo = await response.text();

          // 檢查 API 是否回傳了已經被 JSON 序列化的字串
          if (fieldInfo.startsWith('"') && fieldInfo.endsWith('"')) {
            try {
              fieldInfo = JSON.parse(fieldInfo);
              console.log(
                `解析後的 AIM 欄位資訊 (training_id: ${trainingId}):`,
                fieldInfo
              );
            } catch (parseError) {
              console.warn(
                '無法解析 API 回傳的 JSON 字串，使用原始值:',
                parseError
              );
            }
          }

          return fieldInfo;
        } catch (error) {
          console.error(
            `第 ${retryCount + 1} 次嘗試失敗 (training_id: ${trainingId}):`,
            error
          );

          // 如果還有重試次數，進行重試
          if (retryCount < 2) {
            console.log(`準備進行第 ${retryCount + 2} 次重試...`);
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * (retryCount + 1))
            );
            return attemptFetch(retryCount + 1);
          }

          console.error(
            `所有重試都失敗 (training_id: ${trainingId})，返回空字串`
          );
          return '';
        }
      };

      const pendingRequest = attemptFetch()
        .then((fieldInfo) => {
          // 更新快取
          this.aimFieldInfoCache.set(cacheKey, fieldInfo);
          this.aimFieldInfoLastFetchTime.set(cacheKey, now);
          this.aimFieldInfoPendingRequests.delete(cacheKey);

          return fieldInfo;
        })
        .catch((error) => {
          console.error(
            `獲取 AIM 欄位資訊過程中發生意外錯誤 (training_id: ${trainingId}):`,
            error
          );
          this.aimFieldInfoPendingRequests.delete(cacheKey);
          return '';
        });

      this.aimFieldInfoPendingRequests.set(cacheKey, pendingRequest);

      return pendingRequest;
    } catch (error) {
      console.error(
        `獲取 AIM 欄位資訊過程中出錯 (training_id: ${trainingId}):`,
        error
      );
      return '';
    }
  }

  /**
   * 獲取所有可用的AIM模型
   * @param {number} externalServiceConfigId - 外部服務配置 ID
   * @returns {Promise<Array>} AIM模型列表
   */
  /**
   * 獲取所有可用的AIM模型
   * @param {number} externalServiceConfigId - 外部服務配置 ID
   * @returns {Promise<Array>} AIM模型列表
   */
  async getAIMModels(externalServiceConfigId = null) {
    try {
      const cacheKey = `aim_models_${externalServiceConfigId || 'default'}`;

      // 檢查是否有有效的快取
      const now = Date.now();
      if (
        this.aimModelsCache[cacheKey] &&
        this.aimLastFetchTime[cacheKey] &&
        now - this.aimLastFetchTime[cacheKey] < this.cacheExpiryTime
      ) {
        return this.aimModelsCache[cacheKey];
      }

      // 如果已經有一個請求在進行中，則返回該請求
      if (this.aimPendingRequest[cacheKey]) {
        return this.aimPendingRequest[cacheKey];
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
          // 創建查詢參數
          const queryParams = {};
          if (externalServiceConfigId) {
            queryParams.external_service_config_id = externalServiceConfigId;
          }

          const url = tokenService.createUrlWithWorkspace(
            `${API_CONFIG.BASE_URL}/agent_designer/aim/info`,
            queryParams
          );

          const response = await fetch(url, options);

          if (!response.ok) {
            throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
          }

          let responseData = await response.json();

          // 根據新的資料結構解析
          let models = [];

          // 檢查是否是新的資料結構 (包在 success/data 裡面)
          if (
            responseData.success &&
            responseData.data &&
            responseData.data.models
          ) {
            models = responseData.data.models;
          }
          // 舊的資料結構 (直接是陣列)
          else if (Array.isArray(responseData)) {
            models = responseData;
          }
          // 嘗試其他可能的結構
          else if (responseData.models && Array.isArray(responseData.models)) {
            models = responseData.models;
          } else {
            console.warn('無法從API回應中提取AIM模型數據，返回空陣列');
            return [];
          }

          // 檢查是否為有效的陣列
          if (!Array.isArray(models)) {
            console.warn('提取的模型數據不是陣列，返回空陣列');
            return [];
          }

          // 檢查每個模型對象，確保結構正確
          const processedData = models
            .map((model, index) => {
              if (!model || typeof model !== 'object') {
                console.warn(`AIM模型 ${index} 無效，跳過該模型`);
                return null;
              }

              // 檢查必要欄位
              if (!model.aim_ml_id) {
                console.warn(`AIM模型 ${index} 缺少aim_ml_id，跳過該模型`);
                return null;
              }

              if (!model.model_name) {
                console.warn(`AIM模型 ${index} 缺少model_name，跳過該模型`);
                return null;
              }

              // 返回處理後的模型資料
              return {
                aim_ml_id: model.aim_ml_id,
                training_id: model.training_id || 0,
                simulator_id: model.simulator_id || '',
                model_name: model.model_name
              };
            })
            .filter((model) => model !== null);

          console.log('處理後的AIM模型數據:', processedData);
          return processedData;
        } catch (error) {
          console.error(`第 ${retryCount + 1} 次嘗試失敗:`, error);

          if (retryCount < 2) {
            console.log(`準備進行第 ${retryCount + 2} 次重試...`);
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * (retryCount + 1))
            );
            return attemptFetch(retryCount + 1);
          }

          console.error('所有重試都失敗，返回空陣列');
          return [];
        }
      };

      this.aimPendingRequest[cacheKey] = attemptFetch()
        .then((processedData) => {
          // 更新快取
          this.aimModelsCache[cacheKey] = processedData;
          this.aimLastFetchTime[cacheKey] = now;
          delete this.aimPendingRequest[cacheKey];

          return processedData;
        })
        .catch((error) => {
          console.error('獲取AIM模型過程中發生意外錯誤:', error);
          delete this.aimPendingRequest[cacheKey];
          return [];
        });

      return this.aimPendingRequest[cacheKey];
    } catch (error) {
      console.error('獲取AIM模型過程中出錯:', error);
      return [];
    }
  }

  /**
   * 獲取所有可用的LLM Vision模型
   * @returns {Promise<Array>} LLM Vision模型列表
   */
  async getLLMVisionModels() {
    try {
      // 檢查是否有有效的快取
      const now = Date.now();
      if (
        this.llmVisionModelsCache &&
        this.llmVisionLastFetchTime &&
        now - this.llmVisionLastFetchTime < this.cacheExpiryTime
      ) {
        console.log('使用快取的LLM Vision模型列表');
        return this.llmVisionModelsCache;
      }

      // 如果已經有一個請求在進行中，則返回該請求
      if (this.llmVisionPendingRequest) {
        console.log('已有進行中的LLM Vision模型請求，使用相同請求');
        return this.llmVisionPendingRequest;
      }

      // 創建新請求
      console.log('獲取LLM Vision模型列表...');
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
          console.log(`嘗試獲取LLM Vision模型，第 ${retryCount + 1} 次嘗試`);

          // 使用新的方法創建帶 workspace_id 的 URL
          const url = tokenService.createUrlWithWorkspace(
            `${API_CONFIG.BASE_URL}/agent_designer/llm/vision`
          );

          const response = await fetch(url, options);

          if (!response.ok) {
            throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
          }

          const data = await response.json();
          console.log('API返回原始LLM Vision模型數據:', data);

          // 檢查數據是否為數組
          if (!Array.isArray(data)) {
            console.warn('API返回的LLM Vision模型數據不是陣列');
            return [];
          }

          // 檢查每個模型對象，確保結構正確
          const processedData = data
            .map((model, index) => {
              if (!model || typeof model !== 'object') {
                console.warn(`LLM Vision模型 ${index} 無效，跳過該模型`);
                return null;
              }

              // 確保模型有必要的屬性
              if (model.id === undefined || model.id === null) {
                console.warn(`LLM Vision模型 ${index} 缺少id，跳過該模型`);
                return null;
              }

              if (!model.display_name) {
                console.warn(
                  `LLM Vision模型 ${index} 缺少display_name，跳過該模型`
                );
                return null;
              }

              return {
                id: model.id,
                display_name: model.display_name,
                description: model.description || '',
                provider: model.provider || ''
              };
            })
            .filter((model) => model !== null); // 過濾掉無效模型

          console.log('處理後的LLM Vision模型數據:', processedData);
          return processedData;
        } catch (error) {
          console.error(`第 ${retryCount + 1} 次嘗試失敗:`, error);

          // 如果還有重試次數，進行重試
          if (retryCount < 2) {
            console.log(`準備進行第 ${retryCount + 2} 次重試...`);
            // 添加延遲，避免立即重試
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * (retryCount + 1))
            );
            return attemptFetch(retryCount + 1);
          }

          // 所有重試都失敗，返回空陣列
          console.error('所有重試都失敗，返回空陣列');
          return [];
        }
      };

      this.llmVisionPendingRequest = attemptFetch()
        .then((processedData) => {
          // 更新快取
          this.llmVisionModelsCache = processedData;
          this.llmVisionLastFetchTime = now;
          this.llmVisionPendingRequest = null; // 清除進行中的請求

          return processedData;
        })
        .catch((error) => {
          console.error('獲取LLM Vision模型過程中發生意外錯誤:', error);
          this.llmVisionPendingRequest = null; // 清除進行中的請求，即使出錯

          // 返回空陣列
          return [];
        });

      return this.llmVisionPendingRequest;
    } catch (error) {
      console.error('獲取LLM Vision模型過程中出錯:', error);
      this.llmVisionPendingRequest = null;

      // 返回空陣列
      return [];
    }
  }

  /**
   * 獲取格式化後的AIM模型選項，適用於下拉選單
   * @param {number} externalServiceConfigId - 外部服務配置 ID
   * @returns {Promise<Array>} 格式化的AIM模型選項
   */
  async getAIMModelOptions(externalServiceConfigId = null) {
    try {
      const models = await this.getAIMModels(externalServiceConfigId);
      console.log('API返回的AIM模型數據:', models);

      // 檢查模型數據是否有效
      if (!models || !Array.isArray(models)) {
        console.warn('AIM模型數據無效或不是陣列，返回空陣列');
        return [];
      }

      if (models.length === 0) {
        console.warn('API返回的AIM模型陣列為空，返回空陣列');
        return [];
      }

      // 檢查第一個模型的結構，確認關鍵屬性
      const sampleModel = models[0];
      console.log('AIM模型數據結構示例:', sampleModel);

      // 將API返回的AIM模型數據轉換為select選項格式
      const options = models
        .map((model, index) => {
          // 確保模型對象存在
          if (!model) {
            console.warn(`遇到無效的AIM模型數據，索引: ${index}，跳過該模型`);
            return null; // 標記為無效，稍後過濾掉
          }

          // 記錄每個模型的關鍵屬性，幫助診斷
          console.log(`處理AIM模型 ${index}:`, {
            aim_ml_id: model.aim_ml_id,
            model_name: model.model_name,
            training_id: model.training_id,
            simulator_id: model.simulator_id
          });

          // 使用 aim_ml_id 作為 value，model_name 作為 label
          const modelValue = model.aim_ml_id;
          const modelLabel = model.model_name;

          // 如果缺少必要欄位，跳過該模型
          if (!modelValue || !modelLabel) {
            console.warn(`AIM模型 ${index} 缺少必要欄位，跳過該模型`);
            return null;
          }

          return {
            value: modelValue,
            label: modelLabel,
            training_id: model.training_id,
            simulator_id: model.simulator_id
          };
        })
        .filter((option) => option !== null); // 過濾掉無效選項

      console.log('最終格式化的AIM模型選項:', options);
      return options;
    } catch (error) {
      console.error('獲取AIM模型選項失敗:', error);
      // 返回空陣列，以防API失敗
      return [];
    }
  }

  /**
   * 獲取格式化後的LLM Vision模型選項，適用於下拉選單
   * @returns {Promise<Array>} 格式化的LLM Vision模型選項
   */
  async getLLMVisionModelOptions() {
    try {
      const models = await this.getLLMVisionModels();
      console.log('API返回的LLM Vision模型數據:', models);

      // 檢查模型數據是否有效
      if (!models || !Array.isArray(models)) {
        console.warn('LLM Vision模型數據無效或不是陣列，返回空陣列');
        return [];
      }

      if (models.length === 0) {
        console.warn('API返回的LLM Vision模型陣列為空，返回空陣列');
        return [];
      }

      // 檢查第一個模型的結構，確認關鍵屬性
      const sampleModel = models[0];
      console.log('LLM Vision模型數據結構示例:', sampleModel);

      // 將API返回的LLM Vision模型數據轉換為select選項格式
      const options = models
        .map((model, index) => {
          // 確保模型對象存在
          if (!model) {
            console.warn(
              `遇到無效的LLM Vision模型數據，索引: ${index}，跳過該模型`
            );
            return null;
          }

          // 記錄每個模型的關鍵屬性，幫助診斷
          console.log(`處理LLM Vision模型 ${index}:`, {
            id: model.id,
            display_name: model.display_name,
            description: model.description,
            provider: model.provider
          });

          // 使用 id 作為 value，display_name 作為 label
          const modelValue = model.id;
          const modelLabel = model.display_name;

          // 如果缺少必要欄位，跳過該模型
          if (modelValue === undefined || modelValue === null || !modelLabel) {
            console.warn(`LLM Vision模型 ${index} 缺少必要欄位，跳過該模型`);
            return null;
          }

          return {
            value: modelValue,
            label: modelLabel,
            description: model.description,
            provider: model.provider
          };
        })
        .filter((option) => option !== null); // 過濾掉無效選項

      console.log('最終格式化的LLM Vision模型選項:', options);
      return options;
    } catch (error) {
      console.error('獲取LLM Vision模型選項失敗:', error);
      // 返回空陣列，以防API失敗
      return [];
    }
  }

  /**
   * 預加載所有模型數據，通常在應用啟動時呼叫
   */
  preloadData() {
    console.log('預加載AIM和LLM Vision模型列表');

    // 預加載AIM模型
    this.getAIMModels().catch((err) => {
      console.log('預加載AIM模型失敗:', err);
    });

    // 預加載LLM Vision模型
    this.getLLMVisionModels().catch((err) => {
      console.log('預加載LLM Vision模型失敗:', err);
    });
  }

  /**
   * 清除所有快取
   */
  clearCache() {
    // 清除AIM模型快取
    this.aimModelsCache = {};
    this.aimLastFetchTime = {};
    this.aimPendingRequest = {};

    // 清除LLM Vision模型快取
    this.llmVisionModelsCache = null;
    this.llmVisionLastFetchTime = null;
    this.llmVisionPendingRequest = null;

    // 清除AIM欄位資訊快取
    this.aimFieldInfoCache.clear();
    this.aimFieldInfoLastFetchTime.clear();
    this.aimFieldInfoPendingRequests.clear();

    console.log('AIM和LLM Vision模型快取已清除');
  }

  /**
   * 只清除AIM模型快取
   */
  clearAIMCache() {
    this.aimModelsCache = {};
    this.aimLastFetchTime = {};
    this.aimPendingRequest = {};
    console.log('AIM模型快取已清除');
  }

  /**
   * 只清除LLM Vision模型快取
   */
  clearLLMVisionCache() {
    this.llmVisionModelsCache = null;
    this.llmVisionLastFetchTime = null;
    this.llmVisionPendingRequest = null;
    console.log('LLM Vision模型快取已清除');
  }

  /**
   * 只清除AIM欄位資訊快取
   */
  clearAIMFieldInfoCache() {
    this.aimFieldInfoCache.clear();
    this.aimFieldInfoLastFetchTime.clear();
    this.aimFieldInfoPendingRequests.clear();
    console.log('AIM欄位資訊快取已清除');
  }

  /**
   * 清除特定 training_id 的AIM欄位資訊快取
   * @param {number} trainingId - 要清除的 training_id
   */
  clearAIMFieldInfoCacheById(trainingId) {
    const trainingIdStr = trainingId.toString();
    this.aimFieldInfoCache.delete(trainingIdStr);
    this.aimFieldInfoLastFetchTime.delete(trainingIdStr);
    this.aimFieldInfoPendingRequests.delete(trainingIdStr);
    console.log(`AIM欄位資訊快取已清除 (training_id: ${trainingId})`);
  }
}
