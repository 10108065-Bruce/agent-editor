import { tokenService } from './TokenService';
import { API_CONFIG } from './config';

/**
 * Schedule Trigger 模型服務 - 處理與 Schedule Trigger 相關的API請求
 */
export class ScheduleTriggerService {
  constructor() {
    // 時區列表相關快取
    this.timezonesCache = null;
    this.timezonesLastFetchTime = null;

    // 時區地區相關快取
    this.regionsCache = null;
    this.regionsLastFetchTime = null;

    // 預設描述選項相關快取
    this.defaultDescriptionsCache = null;
    this.defaultDescriptionsLastFetchTime = null;

    // 預設調度設定相關快取
    this.defaultScheduleConfigsCache = null;
    this.defaultScheduleConfigsLastFetchTime = null;

    // 特定時區詳細資訊快取
    this.timezoneDetailsCache = new Map(); // 使用 Map 以 timezone_id 為 key
    this.timezoneDetailsLastFetchTime = new Map(); // 每個 timezone_id 的最後獲取時間

    this.cacheExpiryTime = 10 * 60 * 1000; // 10分鐘cache過期

    // 追蹤進行中的請求，避免重複請求
    this.timezonesPendingRequest = null;
    this.regionsPendingRequest = null;
    this.defaultDescriptionsPendingRequest = null;
    this.defaultScheduleConfigsPendingRequest = null;
    this.timezoneDetailsPendingRequests = new Map(); // 追蹤進行中的時區詳細資訊請求
  }

  /**
   * 生成 schedule node 設定 - 將自然語言時間描述轉換為標準調度配置 JSON
   * @param {Object} requestData - 請求數據
   * @param {string} requestData.current_date - 當前日期 (格式: YYYY-MM-DD)
   * @param {number} requestData.llm_id - LLM 模型 ID
   * @param {string} requestData.task_description - 任務描述
   * @param {string} requestData.timezone - 時區 (例: Asia/Taipei)
   * @param {string} requestData.user_input - 用戶自然語言輸入
   * @returns {Promise<Object>} 調度配置結果
   */
  async generateScheduleTime(requestData) {
    try {
      console.log('生成 schedule 時間配置，請求數據:', requestData);

      // 驗證必要參數
      const requiredFields = [
        'current_date',
        'llm_id',
        'task_description',
        'timezone',
        'user_input'
      ];
      for (const field of requiredFields) {
        if (!requestData[field]) {
          throw new Error(`缺少必要參數: ${field}`);
        }
      }

      const options = tokenService.createAuthHeader({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      // 定義重試邏輯的函數
      const attemptFetch = async (retryCount = 0) => {
        try {
          console.log(
            `嘗試生成 schedule 時間配置，第 ${retryCount + 1} 次嘗試`
          );

          const url = tokenService.createUrlWithWorkspace(
            `${API_CONFIG.BASE_URL}/agent_designer/ai/schedule-time-generator`
          );

          const response = await fetch(url, options);

          if (!response.ok) {
            throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
          }

          const data = await response.json();
          console.log('API返回 schedule 時間配置結果:', data);

          // 檢查 API 回應格式
          if (!data.success) {
            throw new Error(`API 回應失敗: ${data.error || '未知錯誤'}`);
          }

          return data;
        } catch (error) {
          console.error(`第 ${retryCount + 1} 次嘗試失敗:`, error);

          // 如果還有重試次數，進行重試
          if (retryCount < 2) {
            console.log(`準備進行第 ${retryCount + 2} 次重試...`);
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * (retryCount + 1))
            );
            return attemptFetch(retryCount + 1);
          }

          // 所有重試都失敗，拋出錯誤
          throw error;
        }
      };

      return await attemptFetch();
    } catch (error) {
      console.error('生成 schedule 時間配置過程中出錯:', error);
      throw error;
    }
  }

  /**
   * 獲取時區列表
   * @param {Object} params - 查詢參數
   * @param {string} params.region - 篩選特定地區的時區 (可選)
   * @param {string} params.search - 搜尋時區名稱或城市名稱 (可選)
   * @param {string} params.format - 回應格式: simple 或 detailed (預設: detailed)
   * @returns {Promise<Object>} 時區列表
   */
  async getTimezonesList(params = {}) {
    try {
      const { region, search, format = 'detailed' } = params;

      // 為快取創建唯一鍵
      const cacheKey = JSON.stringify({ region, search, format });

      // 檢查是否有有效的快取
      const now = Date.now();
      if (
        this.timezonesCache &&
        this.timezonesCache[cacheKey] &&
        this.timezonesLastFetchTime &&
        this.timezonesLastFetchTime[cacheKey] &&
        now - this.timezonesLastFetchTime[cacheKey] < this.cacheExpiryTime
      ) {
        console.log('使用快取的時區列表', params);
        return this.timezonesCache[cacheKey];
      }

      // 如果已經有相同參數的請求在進行中，則返回該請求
      if (
        this.timezonesPendingRequest &&
        this.timezonesPendingRequest[cacheKey]
      ) {
        console.log('已有進行中的時區列表請求，使用相同請求', params);
        return this.timezonesPendingRequest[cacheKey];
      }

      console.log('獲取時區列表...', params);

      // 構建查詢參數
      const queryParams = new URLSearchParams();
      if (region) queryParams.append('region', region);
      if (search) queryParams.append('search', search);
      queryParams.append('format', format);

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
          console.log(`嘗試獲取時區列表，第 ${retryCount + 1} 次嘗試`);

          const url = tokenService.createUrlWithWorkspace(
            `${
              API_CONFIG.BASE_URL
            }/agent_designer/schedule_node/timezone/list?${queryParams.toString()}`
          );

          const response = await fetch(url, options);

          if (!response.ok) {
            throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
          }

          const data = await response.json();
          console.log('API返回時區列表數據:', data);

          // 檢查 API 回應格式
          if (!data.success) {
            throw new Error(`API 回應失敗: ${data.error || '未知錯誤'}`);
          }

          return data;
        } catch (error) {
          console.error(`第 ${retryCount + 1} 次嘗試失敗:`, error);

          if (retryCount < 2) {
            console.log(`準備進行第 ${retryCount + 2} 次重試...`);
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * (retryCount + 1))
            );
            return attemptFetch(retryCount + 1);
          }

          throw error;
        }
      };

      // 初始化快取和進行中請求的結構
      if (!this.timezonesPendingRequest) {
        this.timezonesPendingRequest = {};
      }

      const pendingRequest = attemptFetch()
        .then((data) => {
          // 更新快取
          if (!this.timezonesCache) {
            this.timezonesCache = {};
          }
          if (!this.timezonesLastFetchTime) {
            this.timezonesLastFetchTime = {};
          }

          this.timezonesCache[cacheKey] = data;
          this.timezonesLastFetchTime[cacheKey] = now;
          delete this.timezonesPendingRequest[cacheKey]; // 清除進行中的請求

          return data;
        })
        .catch((error) => {
          console.error('獲取時區列表過程中發生意外錯誤:', error);
          if (this.timezonesPendingRequest) {
            delete this.timezonesPendingRequest[cacheKey];
          }
          throw error;
        });

      // 記錄進行中的請求
      this.timezonesPendingRequest[cacheKey] = pendingRequest;

      return pendingRequest;
    } catch (error) {
      console.error('獲取時區列表過程中出錯:', error);
      throw error;
    }
  }

  /**
   * 獲取所有可用的時區地區列表
   * @returns {Promise<Object>} 時區地區列表
   */
  async getTimezoneRegions() {
    try {
      // 檢查是否有有效的快取
      const now = Date.now();
      if (
        this.regionsCache &&
        this.regionsLastFetchTime &&
        now - this.regionsLastFetchTime < this.cacheExpiryTime
      ) {
        console.log('使用快取的時區地區列表');
        return this.regionsCache;
      }

      // 如果已經有一個請求在進行中，則返回該請求
      if (this.regionsPendingRequest) {
        console.log('已有進行中的時區地區請求，使用相同請求');
        return this.regionsPendingRequest;
      }

      console.log('獲取時區地區列表...');
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
          console.log(`嘗試獲取時區地區列表，第 ${retryCount + 1} 次嘗試`);

          const url = tokenService.createUrlWithWorkspace(
            `${API_CONFIG.BASE_URL}/agent_designer/schedule_node/timezone/regions`
          );

          const response = await fetch(url, options);

          if (!response.ok) {
            throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
          }

          const data = await response.json();
          console.log('API返回時區地區數據:', data);

          // 檢查 API 回應格式
          if (!data.success) {
            throw new Error(`API 回應失敗: ${data.error || '未知錯誤'}`);
          }

          return data;
        } catch (error) {
          console.error(`第 ${retryCount + 1} 次嘗試失敗:`, error);

          if (retryCount < 2) {
            console.log(`準備進行第 ${retryCount + 2} 次重試...`);
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * (retryCount + 1))
            );
            return attemptFetch(retryCount + 1);
          }

          throw error;
        }
      };

      this.regionsPendingRequest = attemptFetch()
        .then((data) => {
          // 更新快取
          this.regionsCache = data;
          this.regionsLastFetchTime = now;
          this.regionsPendingRequest = null; // 清除進行中的請求

          return data;
        })
        .catch((error) => {
          console.error('獲取時區地區列表過程中發生意外錯誤:', error);
          this.regionsPendingRequest = null; // 清除進行中的請求，即使出錯
          throw error;
        });

      return this.regionsPendingRequest;
    } catch (error) {
      console.error('獲取時區地區列表過程中出錯:', error);
      this.regionsPendingRequest = null;
      throw error;
    }
  }

  /**
   * 根據時區 ID 獲取特定時區的詳細資訊
   * @param {string} timezoneId - 時區 ID (例: Asia/Taipei)
   * @returns {Promise<Object>} 時區詳細資訊
   */
  async getTimezoneDetails(timezoneId) {
    try {
      // 驗證 timezoneId
      if (!timezoneId) {
        throw new Error('時區 ID 不能為空');
      }

      // 檢查是否有有效的快取
      const now = Date.now();
      const lastFetchTime = this.timezoneDetailsLastFetchTime.get(timezoneId);
      const cachedData = this.timezoneDetailsCache.get(timezoneId);

      if (
        cachedData &&
        lastFetchTime &&
        now - lastFetchTime < this.cacheExpiryTime
      ) {
        console.log(`使用快取的時區詳細資訊 (timezone_id: ${timezoneId})`);
        return cachedData;
      }

      // 如果已經有相同 timezone_id 的請求在進行中，則返回該請求
      if (this.timezoneDetailsPendingRequests.has(timezoneId)) {
        console.log(
          `已有進行中的時區詳細資訊請求 (timezone_id: ${timezoneId})，使用相同請求`
        );
        return this.timezoneDetailsPendingRequests.get(timezoneId);
      }

      console.log(`獲取時區詳細資訊 (timezone_id: ${timezoneId})...`);
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
            `嘗試獲取時區詳細資訊，第 ${
              retryCount + 1
            } 次嘗試 (timezone_id: ${timezoneId})`
          );

          // URL encode timezone_id，因為它可能包含特殊字符如 '/'
          const encodedTimezoneId = encodeURIComponent(timezoneId);
          const url = tokenService.createUrlWithWorkspace(
            `${API_CONFIG.BASE_URL}/agent_designer/schedule_node/timezone/${encodedTimezoneId}`
          );

          const response = await fetch(url, options);

          if (!response.ok) {
            throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
          }

          const data = await response.json();
          console.log(
            `API返回時區詳細資訊 (timezone_id: ${timezoneId}):`,
            data
          );

          // 檢查 API 回應格式
          if (!data.success) {
            throw new Error(`API 回應失敗: ${data.error || '未知錯誤'}`);
          }

          return data;
        } catch (error) {
          console.error(
            `第 ${retryCount + 1} 次嘗試失敗 (timezone_id: ${timezoneId}):`,
            error
          );

          if (retryCount < 2) {
            console.log(`準備進行第 ${retryCount + 2} 次重試...`);
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * (retryCount + 1))
            );
            return attemptFetch(retryCount + 1);
          }

          throw error;
        }
      };

      const pendingRequest = attemptFetch()
        .then((data) => {
          // 更新快取
          this.timezoneDetailsCache.set(timezoneId, data);
          this.timezoneDetailsLastFetchTime.set(timezoneId, now);
          this.timezoneDetailsPendingRequests.delete(timezoneId); // 清除進行中的請求

          return data;
        })
        .catch((error) => {
          console.error(
            `獲取時區詳細資訊過程中發生意外錯誤 (timezone_id: ${timezoneId}):`,
            error
          );
          this.timezoneDetailsPendingRequests.delete(timezoneId); // 清除進行中的請求，即使出錯
          throw error;
        });

      // 記錄進行中的請求
      this.timezoneDetailsPendingRequests.set(timezoneId, pendingRequest);

      return pendingRequest;
    } catch (error) {
      console.error(
        `獲取時區詳細資訊過程中出錯 (timezone_id: ${timezoneId}):`,
        error
      );
      this.timezoneDetailsPendingRequests.delete(timezoneId);
      throw error;
    }
  }

  /**
   * 獲取調度時間產生器的預設描述選項
   * @returns {Promise<Object>} 預設描述選項列表
   */
  async getDefaultDescriptions() {
    try {
      // 檢查是否有有效的快取
      const now = Date.now();
      if (
        this.defaultDescriptionsCache &&
        this.defaultDescriptionsLastFetchTime &&
        now - this.defaultDescriptionsLastFetchTime < this.cacheExpiryTime
      ) {
        console.log('使用快取的預設描述選項');
        return this.defaultDescriptionsCache;
      }

      // 如果已經有一個請求在進行中，則返回該請求
      if (this.defaultDescriptionsPendingRequest) {
        console.log('已有進行中的預設描述選項請求，使用相同請求');
        return this.defaultDescriptionsPendingRequest;
      }

      console.log('獲取預設描述選項...');
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
          console.log(`嘗試獲取預設描述選項，第 ${retryCount + 1} 次嘗試`);

          const url = tokenService.createUrlWithWorkspace(
            `${API_CONFIG.BASE_URL}/agent_designer/schedule_node/schedule_time_generator_default_description`
          );

          const response = await fetch(url, options);

          if (!response.ok) {
            throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
          }

          const data = await response.json();
          console.log('API返回預設描述選項數據:', data);

          // 檢查 API 回應格式
          if (!data.success) {
            throw new Error(`API 回應失敗: ${data.error || '未知錯誤'}`);
          }

          return data;
        } catch (error) {
          console.error(`第 ${retryCount + 1} 次嘗試失敗:`, error);

          if (retryCount < 2) {
            console.log(`準備進行第 ${retryCount + 2} 次重試...`);
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * (retryCount + 1))
            );
            return attemptFetch(retryCount + 1);
          }

          throw error;
        }
      };

      this.defaultDescriptionsPendingRequest = attemptFetch()
        .then((data) => {
          // 更新快取
          this.defaultDescriptionsCache = data;
          this.defaultDescriptionsLastFetchTime = now;
          this.defaultDescriptionsPendingRequest = null; // 清除進行中的請求

          return data;
        })
        .catch((error) => {
          console.error('獲取預設描述選項過程中發生意外錯誤:', error);
          this.defaultDescriptionsPendingRequest = null; // 清除進行中的請求，即使出錯
          throw error;
        });

      return this.defaultDescriptionsPendingRequest;
    } catch (error) {
      console.error('獲取預設描述選項過程中出錯:', error);
      this.defaultDescriptionsPendingRequest = null;
      throw error;
    }
  }

  /**
   * 獲取預設的調度設定選項列表
   * @returns {Promise<Object>} 預設調度設定選項列表
   */
  async getDefaultScheduleConfigs() {
    try {
      // 檢查是否有有效的快取
      const now = Date.now();
      if (
        this.defaultScheduleConfigsCache &&
        this.defaultScheduleConfigsLastFetchTime &&
        now - this.defaultScheduleConfigsLastFetchTime < this.cacheExpiryTime
      ) {
        console.log('使用快取的預設調度設定選項');
        return this.defaultScheduleConfigsCache;
      }

      // 如果已經有一個請求在進行中，則返回該請求
      if (this.defaultScheduleConfigsPendingRequest) {
        console.log('已有進行中的預設調度設定選項請求，使用相同請求');
        return this.defaultScheduleConfigsPendingRequest;
      }

      console.log('獲取預設調度設定選項...');
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
          console.log(`嘗試獲取預設調度設定選項，第 ${retryCount + 1} 次嘗試`);

          const url = tokenService.createUrlWithWorkspace(
            `${API_CONFIG.BASE_URL}/agent_designer/schedule_node/default_schedule_configs`
          );

          const response = await fetch(url, options);

          if (!response.ok) {
            throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
          }

          const data = await response.json();
          console.log('API返回預設調度設定選項數據:', data);

          // 檢查 API 回應格式
          if (!data.success) {
            throw new Error(`API 回應失敗: ${data.error || '未知錯誤'}`);
          }

          return data;
        } catch (error) {
          console.error(`第 ${retryCount + 1} 次嘗試失敗:`, error);

          if (retryCount < 2) {
            console.log(`準備進行第 ${retryCount + 2} 次重試...`);
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * (retryCount + 1))
            );
            return attemptFetch(retryCount + 1);
          }

          throw error;
        }
      };

      this.defaultScheduleConfigsPendingRequest = attemptFetch()
        .then((data) => {
          // 更新快取
          this.defaultScheduleConfigsCache = data;
          this.defaultScheduleConfigsLastFetchTime = now;
          this.defaultScheduleConfigsPendingRequest = null; // 清除進行中的請求

          return data;
        })
        .catch((error) => {
          console.error('獲取預設調度設定選項過程中發生意外錯誤:', error);
          this.defaultScheduleConfigsPendingRequest = null; // 清除進行中的請求，即使出錯
          throw error;
        });

      return this.defaultScheduleConfigsPendingRequest;
    } catch (error) {
      console.error('獲取預設調度設定選項過程中出錯:', error);
      this.defaultScheduleConfigsPendingRequest = null;
      throw error;
    }
  }

  /**
   * 啟用或停用 schedule node
   * @param {string} scheduleNodeId - Schedule Node ID
   * @param {Object} requestData - 請求數據
   * @param {boolean} requestData.enabled - 是否啟用
   * @param {string} requestData.flow_id - Flow ID
   * @returns {Promise<Object>} 更新結果
   */
  async toggleScheduleNode(scheduleNodeId, requestData) {
    try {
      // 驗證參數
      if (!scheduleNodeId) {
        throw new Error('Schedule Node ID 不能為空');
      }

      if (typeof requestData.enabled !== 'boolean') {
        throw new Error('enabled 參數必須是布林值');
      }

      if (!requestData.flow_id) {
        throw new Error('flow_id 不能為空');
      }

      console.log(
        `切換 schedule node 狀態 (id: ${scheduleNodeId})，請求數據:`,
        requestData
      );

      const options = tokenService.createAuthHeader({
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      // 定義重試邏輯的函數
      const attemptFetch = async (retryCount = 0) => {
        try {
          console.log(
            `嘗試切換 schedule node 狀態，第 ${
              retryCount + 1
            } 次嘗試 (id: ${scheduleNodeId})`
          );

          const url = tokenService.createUrlWithWorkspace(
            `${API_CONFIG.BASE_URL}/agent_designer/schedule_node/${scheduleNodeId}/toggle`
          );

          const response = await fetch(url, options);

          if (!response.ok) {
            throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
          }

          const data = await response.json();
          console.log(
            `API返回 schedule node 切換結果 (id: ${scheduleNodeId}):`,
            data
          );

          return data;
        } catch (error) {
          console.error(
            `第 ${retryCount + 1} 次嘗試失敗 (id: ${scheduleNodeId}):`,
            error
          );

          if (retryCount < 2) {
            console.log(`準備進行第 ${retryCount + 2} 次重試...`);
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * (retryCount + 1))
            );
            return attemptFetch(retryCount + 1);
          }

          throw error;
        }
      };

      return await attemptFetch();
    } catch (error) {
      console.error(
        `切換 schedule node 狀態過程中出錯 (id: ${scheduleNodeId}):`,
        error
      );
      throw error;
    }
  }

  /**
   * 獲取格式化後的時區選項，適用於下拉選單
   * @param {Object} params - 查詢參數 (同 getTimezonesList)
   * @returns {Promise<Array>} 格式化的時區選項
   */
  async getTimezoneOptions(params = {}) {
    try {
      const response = await this.getTimezonesList({
        ...params,
        format: 'detailed'
      });
      console.log('API返回的時區數據:', response);

      // 檢查數據是否有效
      if (
        !response.success ||
        !response.data ||
        !Array.isArray(response.data.timezones)
      ) {
        console.warn('時區數據無效或不是陣列，返回空陣列');
        return [];
      }

      const timezones = response.data.timezones;

      if (timezones.length === 0) {
        console.warn('API返回的時區陣列為空，返回空陣列');
        return [];
      }

      // 將API返回的時區數據轉換為select選項格式
      const options = timezones
        .map((timezone, index) => {
          // 確保時區對象存在
          if (!timezone) {
            console.warn(`遇到無效的時區數據，索引: ${index}，跳過該時區`);
            return null;
          }

          // 使用 id 作為 value，display_name 作為 label
          const timezoneValue = timezone.id;
          const timezoneLabel = timezone.display_name;

          // 如果缺少必要欄位，跳過該時區
          if (!timezoneValue || !timezoneLabel) {
            console.warn(`時區 ${index} 缺少必要欄位，跳過該時區`);
            return null;
          }

          return {
            value: timezoneValue,
            label: timezoneLabel,
            region: timezone.region,
            country: timezone.country,
            utc_offset: timezone.utc_offset,
            description: timezone.description
          };
        })
        .filter((option) => option !== null); // 過濾掉無效選項

      return options;
    } catch (error) {
      console.error('獲取時區選項失敗:', error);
      return [];
    }
  }

  /**
   * 獲取格式化後的預設描述選項，適用於下拉選單或建議列表
   * @returns {Promise<Array>} 格式化的預設描述選項
   */
  async getDefaultDescriptionOptions() {
    try {
      const response = await this.getDefaultDescriptions();
      console.log('API返回的預設描述數據:', response);

      // 檢查數據是否有效
      if (
        !response.success ||
        !response.data ||
        !Array.isArray(response.data.descriptions)
      ) {
        console.warn('預設描述數據無效或不是陣列，返回空陣列');
        return [];
      }

      const descriptions = response.data.descriptions;

      if (descriptions.length === 0) {
        console.warn('API返回的預設描述陣列為空，返回空陣列');
        return [];
      }

      // 將API返回的描述數據轉換為選項格式
      const options = descriptions
        .map((description, index) => {
          // 確保描述是字串
          if (typeof description !== 'string' || !description.trim()) {
            console.warn(`遇到無效的預設描述，索引: ${index}，跳過該描述`);
            return null;
          }

          return {
            value: description,
            label: description,
            index: index
          };
        })
        .filter((option) => option !== null); // 過濾掉無效選項

      console.log('最終格式化的預設描述選項:', options);
      return options;
    } catch (error) {
      console.error('獲取預設描述選項失敗:', error);
      return [];
    }
  }

  /**
   * 獲取格式化後的預設調度設定選項，適用於下拉選單
   * @returns {Promise<Array>} 格式化的預設調度設定選項
   */
  async getDefaultScheduleConfigOptions() {
    try {
      const response = await this.getDefaultScheduleConfigs();
      console.log('API返回的預設調度設定數據:', response);

      // 檢查數據是否有效
      if (
        !response.success ||
        !response.data ||
        !Array.isArray(response.data.schedule_configs)
      ) {
        console.warn('預設調度設定數據無效或不是陣列，返回空陣列');
        return [];
      }

      const scheduleConfigs = response.data.schedule_configs;

      if (scheduleConfigs.length === 0) {
        console.warn('API返回的預設調度設定陣列為空，返回空陣列');
        return [];
      }

      // 將API返回的調度設定數據轉換為選項格式
      const options = scheduleConfigs
        .map((config, index) => {
          // 確保調度設定對象存在且包含必要欄位
          if (!config || !config.value || !config.label) {
            console.warn(`遇到無效的預設調度設定，索引: ${index}，跳過該設定`);
            return null;
          }

          return {
            value: config.value,
            label: config.label,
            description: config.description || '',
            cronExpression: config.cron_expression || '',
            index: index
          };
        })
        .filter((option) => option !== null); // 過濾掉無效選項

      console.log('最終格式化的預設調度設定選項:', options);
      return options;
    } catch (error) {
      console.error('獲取預設調度設定選項失敗:', error);
      return [];
    }
  }

  /**
   * 預加載所有常用數據，通常在應用啟動時呼叫
   */
  preloadData() {
    console.log('預加載 Schedule Trigger 相關數據');

    // 預加載時區地區列表
    this.getTimezoneRegions().catch((err) => {
      console.log('預加載時區地區列表失敗:', err);
    });

    // 預加載預設描述選項
    this.getDefaultDescriptions().catch((err) => {
      console.log('預加載預設描述選項失敗:', err);
    });

    // 預加載預設調度設定選項
    this.getDefaultScheduleConfigs().catch((err) => {
      console.log('預加載預設調度設定選項失敗:', err);
    });

    // 預加載常用時區列表 (亞洲地區)
    this.getTimezonesList({ region: 'Asia', format: 'detailed' }).catch(
      (err) => {
        console.log('預加載亞洲時區列表失敗:', err);
      }
    );
  }

  /**
   * 清除所有快取
   */
  clearCache() {
    // 清除時區相關快取
    this.timezonesCache = null;
    this.timezonesLastFetchTime = null;
    this.timezonesPendingRequest = null;

    // 清除地區快取
    this.regionsCache = null;
    this.regionsLastFetchTime = null;
    this.regionsPendingRequest = null;

    // 清除預設描述快取
    this.defaultDescriptionsCache = null;
    this.defaultDescriptionsLastFetchTime = null;
    this.defaultDescriptionsPendingRequest = null;

    // 清除預設調度設定快取
    this.defaultScheduleConfigsCache = null;
    this.defaultScheduleConfigsLastFetchTime = null;
    this.defaultScheduleConfigsPendingRequest = null;

    // 清除時區詳細資訊快取
    this.timezoneDetailsCache.clear();
    this.timezoneDetailsLastFetchTime.clear();
    this.timezoneDetailsPendingRequests.clear();

    console.log('Schedule Trigger 服務快取已清除');
  }

  /**
   * 只清除時區相關快取
   */
  clearTimezoneCache() {
    this.timezonesCache = null;
    this.timezonesLastFetchTime = null;
    this.timezonesPendingRequest = null;

    this.timezoneDetailsCache.clear();
    this.timezoneDetailsLastFetchTime.clear();
    this.timezoneDetailsPendingRequests.clear();

    console.log('時區相關快取已清除');
  }

  /**
   * 只清除地區快取
   */
  clearRegionCache() {
    this.regionsCache = null;
    this.regionsLastFetchTime = null;
    this.regionsPendingRequest = null;
    console.log('時區地區快取已清除');
  }

  /**
   * 只清除預設描述快取
   */
  clearDefaultDescriptionsCache() {
    this.defaultDescriptionsCache = null;
    this.defaultDescriptionsLastFetchTime = null;
    this.defaultDescriptionsPendingRequest = null;
    console.log('預設描述選項快取已清除');
  }

  /**
   * 只清除預設調度設定快取
   */
  clearDefaultScheduleConfigsCache() {
    this.defaultScheduleConfigsCache = null;
    this.defaultScheduleConfigsLastFetchTime = null;
    this.defaultScheduleConfigsPendingRequest = null;
    console.log('預設調度設定選項快取已清除');
  }

  /**
   * 清除特定時區的詳細資訊快取
   * @param {string} timezoneId - 要清除的時區 ID
   */
  clearTimezoneDetailsCacheById(timezoneId) {
    this.timezoneDetailsCache.delete(timezoneId);
    this.timezoneDetailsLastFetchTime.delete(timezoneId);
    this.timezoneDetailsPendingRequests.delete(timezoneId);
    console.log(`時區詳細資訊快取已清除 (timezone_id: ${timezoneId})`);
  }
}

// 創建並導出單例實例
export const scheduleTriggerService = new ScheduleTriggerService();
