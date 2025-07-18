import { tokenService } from './TokenService';
import { API_CONFIG } from './config';

/**
 * AIM模型服務 - 處理與AIM模型和LLM Vision模型相關的API請求
 */
export class AIMService {
  constructor() {
    // AIM模型相關緩存
    this.aimModelsCache = null;
    this.aimLastFetchTime = null;

    // LLM Vision模型相關緩存
    this.llmVisionModelsCache = null;
    this.llmVisionLastFetchTime = null;

    // AIM 欄位資訊緩存
    this.aimFieldInfoCache = new Map(); // 使用 Map 以 training_id 為 key
    this.aimFieldInfoLastFetchTime = new Map(); // 每個 training_id 的最後獲取時間

    this.cacheExpiryTime = 10 * 60 * 1000; // 10分鐘cache過期
    this.aimPendingRequest = null; // 用於追蹤進行中的AIM請求
    this.llmVisionPendingRequest = null; // 用於追蹤進行中的LLM Vision請求
    this.aimFieldInfoPendingRequests = new Map(); // 追蹤進行中的欄位資訊請求
  }

  /**
   * 獲取 AIM 模型的欄位資訊
   * @param {number} trainingId - 訓練模型 ID
   * @returns {Promise<string>} 欄位資訊字串
   */
  async getAIMFieldInfo(trainingId) {
    try {
      // 驗證 trainingId
      if (!trainingId || trainingId === 0) {
        console.log('trainingId 無效，跳過欄位資訊獲取');
        return '';
      }

      const trainingIdStr = trainingId.toString();

      // 檢查是否有有效的快取
      const now = Date.now();
      const lastFetchTime = this.aimFieldInfoLastFetchTime.get(trainingIdStr);
      const cachedData = this.aimFieldInfoCache.get(trainingIdStr);

      if (
        cachedData &&
        lastFetchTime &&
        now - lastFetchTime < this.cacheExpiryTime
      ) {
        console.log(`使用快取的 AIM 欄位資訊 (training_id: ${trainingId})`);
        return cachedData;
      }

      // 如果已經有相同 training_id 的請求在進行中，則返回該請求
      if (this.aimFieldInfoPendingRequests.has(trainingIdStr)) {
        console.log(
          `已有進行中的 AIM 欄位資訊請求 (training_id: ${trainingId})，使用相同請求`
        );
        return this.aimFieldInfoPendingRequests.get(trainingIdStr);
      }

      // 創建新請求
      console.log(`獲取 AIM 欄位資訊 (training_id: ${trainingId})...`);
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
            } 次嘗試 (training_id: ${trainingId})`
          );

          // 使用新的方法創建帶 workspace_id 的 URL
          const url = tokenService.createUrlWithWorkspace(
            `${API_CONFIG.BASE_URL}/agent_designer/aim/field-info`,
            { training_id: trainingId }
          );

          const response = await fetch(url, options);

          if (!response.ok) {
            throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
          }

          let fieldInfo = await response.text(); // 使用 text() 因為後端回覆 string
          console.log(
            `API返回 AIM 欄位資訊原始內容 (training_id: ${trainingId}):`,
            fieldInfo
          );

          // 檢查 API 是否回傳了已經被 JSON 序列化的字串
          // 如果字串以 " 開頭和結尾，表示它是一個被序列化的 JSON 字串
          if (fieldInfo.startsWith('"') && fieldInfo.endsWith('"')) {
            try {
              // 解析掉外層的 JSON 序列化，獲得真正的字串內容
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
            // 添加延遲，避免立即重試
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * (retryCount + 1))
            );
            return attemptFetch(retryCount + 1);
          }

          // 所有重試都失敗，返回空字串
          console.error(
            `所有重試都失敗 (training_id: ${trainingId})，返回空字串`
          );
          return '';
        }
      };

      const pendingRequest = attemptFetch()
        .then((fieldInfo) => {
          // 更新快取
          this.aimFieldInfoCache.set(trainingIdStr, fieldInfo);
          this.aimFieldInfoLastFetchTime.set(trainingIdStr, now);
          this.aimFieldInfoPendingRequests.delete(trainingIdStr); // 清除進行中的請求

          return fieldInfo;
        })
        .catch((error) => {
          console.error(
            `獲取 AIM 欄位資訊過程中發生意外錯誤 (training_id: ${trainingId}):`,
            error
          );
          this.aimFieldInfoPendingRequests.delete(trainingIdStr); // 清除進行中的請求，即使出錯

          // 返回空字串
          return '';
        });

      // 記錄進行中的請求
      this.aimFieldInfoPendingRequests.set(trainingIdStr, pendingRequest);

      return pendingRequest;
    } catch (error) {
      console.error(
        `獲取 AIM 欄位資訊過程中出錯 (training_id: ${trainingId}):`,
        error
      );
      this.aimFieldInfoPendingRequests.delete(trainingId?.toString());

      // 返回空字串
      return '';
    }
  }

  /**
   * 獲取所有可用的AIM模型
   * @returns {Promise<Array>} AIM模型列表
   */
  async getAIMModels() {
    try {
      // 檢查是否有有效的快取
      const now = Date.now();
      if (
        this.aimModelsCache &&
        this.aimLastFetchTime &&
        now - this.aimLastFetchTime < this.cacheExpiryTime
      ) {
        console.log('使用快取的AIM模型列表');
        return this.aimModelsCache;
      }

      // 如果已經有一個請求在進行中，則返回該請求
      if (this.aimPendingRequest) {
        console.log('已有進行中的AIM模型請求，使用相同請求');
        return this.aimPendingRequest;
      }

      // 創建新請求
      console.log('獲取AIM模型列表...');
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
          console.log(`嘗試獲取AIM模型，第 ${retryCount + 1} 次嘗試`);

          const response = await fetch(
            `${API_CONFIG.BASE_URL}/agent_designer/aim/info`,
            options
          );

          if (!response.ok) {
            throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
          }

          const data = await response.json();
          console.log('API返回原始AIM模型數據:', data);

          // 檢查數據是否為數組
          if (!Array.isArray(data)) {
            console.warn('API返回的AIM模型數據不是陣列');
            // 嘗試從可能的非數組格式中提取數據
            if (
              data &&
              typeof data === 'object' &&
              data.models &&
              Array.isArray(data.models)
            ) {
              data = data.models;
              console.log('從API回應中提取models陣列:', data);
            } else {
              // 如果無法提取合理的數據，返回空陣列
              console.warn('無法從API回應中提取合理的AIM模型數據，返回空陣列');
              return [];
            }
          }

          // 檢查每個模型對象，確保結構正確
          const processedData = data
            .map((model, index) => {
              if (!model || typeof model !== 'object') {
                console.warn(`AIM模型 ${index} 無效，跳過該模型`);
                return null; // 標記為無效，稍後過濾掉
              }

              // 確保模型有必要的屬性
              if (!model.aim_ml_id) {
                console.warn(`AIM模型 ${index} 缺少aim_ml_id，跳過該模型`);
                return null;
              }

              if (!model.model_name) {
                console.warn(`AIM模型 ${index} 缺少model_name，跳過該模型`);
                return null;
              }

              // training_id 和 simulator_id 可以是可選的
              return {
                aim_ml_id: model.aim_ml_id,
                training_id: model.training_id || 0,
                simulator_id: model.simulator_id || '',
                model_name: model.model_name
              };
            })
            .filter((model) => model !== null); // 過濾掉無效模型

          console.log('處理後的AIM模型數據:', processedData);
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

      this.aimPendingRequest = attemptFetch()
        .then((processedData) => {
          // 更新快取
          this.aimModelsCache = processedData;
          this.aimLastFetchTime = now;
          this.aimPendingRequest = null; // 清除進行中的請求

          return processedData;
        })
        .catch((error) => {
          console.error('獲取AIM模型過程中發生意外錯誤:', error);
          this.aimPendingRequest = null; // 清除進行中的請求，即使出錯

          // 返回空陣列
          return [];
        });

      return this.aimPendingRequest;
    } catch (error) {
      console.error('獲取AIM模型過程中出錯:', error);
      this.aimPendingRequest = null;

      // 返回空陣列，而不是預設模型
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
   * @returns {Promise<Array>} 格式化的AIM模型選項
   */
  async getAIMModelOptions() {
    try {
      const models = await this.getAIMModels();
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
    this.aimModelsCache = null;
    this.aimLastFetchTime = null;
    this.aimPendingRequest = null;

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
    this.aimModelsCache = null;
    this.aimLastFetchTime = null;
    this.aimPendingRequest = null;
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
