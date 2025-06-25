import { tokenService } from './TokenService';
import { API_CONFIG } from './config';

/**
 * 外部服務配置管理 - 處理與外部服務（LINE、WHATSAPP等）相關的API請求
 */
export class ExternalService {
  constructor() {
    // 服務配置相關緩存
    this.servicesCache = new Map(); // 使用Map來儲存不同service_type的緩存
    this.lastFetchTimes = new Map(); // 記錄每個service_type的最後獲取時間
    this.cacheExpiryTime = 10 * 60 * 1000; // 10分鐘cache過期
    this.pendingRequests = new Map(); // 用於追蹤進行中的請求
    // Messaging types 相關緩存
    this.messagingTypesCache = new Map(); // 緩存不同頻道的 messaging types
    this.lastMessagingTypesFetchTimes = new Map(); // 記錄每個頻道的最後獲取時間
    this.pendingMessagingTypesRequests = new Map(); // 用於追蹤進行中的請求
    // 支援的服務類型
    this.supportedServiceTypes = ['LINE', 'WHATSAPP'];
    // 支援的頻道類型 (用於 messaging types)
    this.supportedChannelTypes = ['line'];
  }

  /**
   * 創建新的Webhook
   * @param {string} flowId - 工作流ID
   */
  createWebhook(flowId) {
    try {
      console.log(`創建新的Webhook，工作流ID: ${flowId}`);
      // const options = tokenService.createAuthHeader({
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Accept: 'application/json'
      //   }
      // });
      // url is API_CONFIG.CREATE_WEBHOOK_URL, need to append flowId
      const url = `${API_CONFIG.CREATE_WEBHOOK_URL}/${flowId}`;
      // use promise to reply url
      return url;
    } catch (error) {
      console.error('創建Webhook失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取指定頻道的 Messaging Types
   * @param {string} channelType - 頻道類型 (line, telegram等)
   * @returns {Promise<Array>} Messaging types 列表
   */
  async getMessagingTypes(channelType = 'line') {
    try {
      // 驗證頻道類型
      if (!channelType || typeof channelType !== 'string') {
        throw new Error('頻道類型不能為空且必須是字符串');
      }
      const lowerChannelType = channelType.toLowerCase();

      // 檢查是否有有效的快取
      const now = Date.now();
      const cacheKey = lowerChannelType;
      if (
        this.messagingTypesCache.has(cacheKey) &&
        this.lastMessagingTypesFetchTimes.has(cacheKey) &&
        now - this.lastMessagingTypesFetchTimes.get(cacheKey) <
          this.cacheExpiryTime
      ) {
        console.log(`使用快取的${lowerChannelType} Messaging Types列表`);
        return this.messagingTypesCache.get(cacheKey);
      }

      // 如果已經有一個請求在進行中，則返回該請求
      if (this.pendingMessagingTypesRequests.has(cacheKey)) {
        console.log(
          `已有進行中的${lowerChannelType} Messaging Types請求，使用相同請求`
        );
        return this.pendingMessagingTypesRequests.get(cacheKey);
      }

      // 創建新請求
      console.log(`獲取${lowerChannelType} Messaging Types列表...`);
      const options = tokenService.createAuthHeader({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      });

      const request = fetch(
        `${API_CONFIG.BASE_URL}/agent_designer/channel/${lowerChannelType}/messaging_types`,
        options
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log(
            `API返回原始${lowerChannelType} Messaging Types數據:`,
            data
          );

          // 檢查數據是否為數組
          if (!Array.isArray(data)) {
            console.warn(
              `API返回的${lowerChannelType} Messaging Types數據不是陣列`
            );
            // 嘗試從可能的非數組格式中提取數據
            if (
              data &&
              typeof data === 'object' &&
              data.messaging_types &&
              Array.isArray(data.messaging_types)
            ) {
              data = data.messaging_types;
              console.log(`從API回應中提取messaging_types陣列:`, data);
            } else {
              // 如果無法提取合理的數據，則返回預設的 messaging types
              console.warn(
                `無法從API回應中提取合理的${lowerChannelType} Messaging Types數據，返回預設值`
              );
              data = ['Reply Message', 'Push Message'];
            }
          }

          // 處理數據，確保都是字符串
          const processedData = data
            .filter((type) => type && typeof type === 'string')
            .map((type) => type.trim());

          console.log(
            `處理後的${lowerChannelType} Messaging Types數據:`,
            processedData
          );

          // 更新快取
          this.messagingTypesCache.set(cacheKey, processedData);
          this.lastMessagingTypesFetchTimes.set(cacheKey, now);
          this.pendingMessagingTypesRequests.delete(cacheKey); // 清除進行中的請求
          return processedData;
        })
        .catch((error) => {
          console.error(`獲取${lowerChannelType} Messaging Types失敗:`, error);
          this.pendingMessagingTypesRequests.delete(cacheKey); // 清除進行中的請求，即使出錯

          // 檢查是否為 CORS 錯誤或網路錯誤
          if (
            error.message &&
            (error.message.includes('NetworkError') ||
              error.message.includes('Failed to fetch') ||
              error.message.includes('CORS'))
          ) {
            console.log(
              `疑似 CORS 或網路問題，返回預設的${lowerChannelType} Messaging Types列表`
            );
            return ['Reply Message', 'Push Message'];
          }
          // 返回預設值，而不是拋出錯誤
          return ['Reply Message', 'Push Message'];
        });

      this.pendingMessagingTypesRequests.set(cacheKey, request);
      return request;
    } catch (error) {
      console.error(`獲取${channelType} Messaging Types過程中出錯:`, error);
      const cacheKey = channelType.toLowerCase();
      this.pendingMessagingTypesRequests.delete(cacheKey);
      // 返回預設值，而不是拋出錯誤
      return ['Reply Message', 'Push Message'];
    }
  }

  /**
   * 獲取格式化後的 Messaging Types 選項，適用於下拉選單
   * @param {string} channelType - 頻道類型
   * @returns {Promise<Array>} 格式化的 messaging types 選項
   */
  async getMessagingTypeOptions(channelType = 'line') {
    try {
      const messagingTypes = await this.getMessagingTypes(channelType);
      console.log(`${channelType} Messaging Types數據:`, messagingTypes);

      // 檢查 messaging types 數據是否有效
      if (!messagingTypes || !Array.isArray(messagingTypes)) {
        console.warn(
          `${channelType} Messaging Types數據無效或不是陣列，返回預設選項`
        );
        return [
          { value: 'Reply Message', label: 'Reply Message' },
          { value: 'Push Message', label: 'Push Message' }
        ];
      }

      if (messagingTypes.length === 0) {
        console.warn(`API返回的${channelType} Messaging Types陣列為空`);
        return [
          { value: 'Reply Message', label: 'Reply Message' },
          { value: 'Push Message', label: 'Push Message' }
        ];
      }

      // 將 messaging types 轉換為 select 選項格式
      const options = messagingTypes
        .map((type, index) => {
          // 確保 messaging type 存在且為字符串
          if (!type || typeof type !== 'string') {
            console.warn(
              `遇到無效的${channelType} Messaging Type數據，索引: ${index}`
            );
            return null;
          }

          const cleanType = type.trim();
          return {
            value: cleanType,
            label: cleanType
          };
        })
        .filter((option) => option !== null); // 過濾掉無效的選項

      console.log(`最終格式化的${channelType} Messaging Types選項:`, options);
      return options;
    } catch (error) {
      console.error(`獲取${channelType} Messaging Types選項失敗:`, error);
      // 返回預設選項，以防API失敗
      return [
        { value: 'Reply Message', label: 'Reply Message' },
        { value: 'Push Message', label: 'Push Message' }
      ];
    }
  }

  /**
   * 獲取指定類型的外部服務配置
   * @param {string} serviceType - 服務類型 (LINE, WHATSAPP等)
   * @returns {Promise<Array>} 服務配置列表
   */
  async getExternalServiceConfigs(serviceType) {
    try {
      // 驗證服務類型
      if (!serviceType || typeof serviceType !== 'string') {
        throw new Error('服務類型不能為空且必須是字符串');
      }
      const upperServiceType = serviceType.toUpperCase();
      // 檢查是否有有效的快取
      const now = Date.now();
      const cacheKey = upperServiceType;
      if (
        this.servicesCache.has(cacheKey) &&
        this.lastFetchTimes.has(cacheKey) &&
        now - this.lastFetchTimes.get(cacheKey) < this.cacheExpiryTime
      ) {
        console.log(`使用快取的${upperServiceType}服務配置列表`);
        return this.servicesCache.get(cacheKey);
      }
      // 如果已經有一個請求在進行中，則返回該請求
      if (this.pendingRequests.has(cacheKey)) {
        console.log(
          `已有進行中的${upperServiceType}服務配置請求，使用相同請求`
        );
        return this.pendingRequests.get(cacheKey);
      }
      // 創建新請求
      console.log(`獲取${upperServiceType}服務配置列表...`);
      const options = tokenService.createAuthHeader({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      });
      const request = fetch(
        `${API_CONFIG.BASE_URL}/agent_designer/external_service_configs/${upperServiceType}`,
        options
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log(`API返回原始${upperServiceType}服務配置數據:`, data);
          // 檢查數據是否為數組
          if (!Array.isArray(data)) {
            console.warn(`API返回的${upperServiceType}服務配置數據不是陣列`);
            // 嘗試從可能的非數組格式中提取數據
            if (
              data &&
              typeof data === 'object' &&
              data.configs &&
              Array.isArray(data.configs)
            ) {
              data = data.configs;
              console.log(`從API回應中提取configs陣列:`, data);
            } else {
              // 如果無法提取合理的數據，則返回空陣列
              console.warn(
                `無法從API回應中提取合理的${upperServiceType}服務配置數據，返回空陣列`
              );
              data = [];
            }
          }
          // 檢查每個服務配置對象，確保結構正確
          const processedData = data
            .map((config, index) => {
              if (!config || typeof config !== 'object') {
                console.warn(
                  `${upperServiceType}服務配置 ${index} 無效，跳過該項目`
                );
                return null;
              }
              // 確保服務配置有ID
              if (config.id === undefined || config.id === null) {
                console.warn(
                  `${upperServiceType}服務配置 ${index} 缺少ID，使用索引作為ID`
                );
                config.id = index + 1;
              }
              // 確保服務配置有名稱
              if (!config.name) {
                console.warn(
                  `${upperServiceType}服務配置 ${index} 缺少名稱，使用預設名稱`
                );
                config.name = `${upperServiceType} Config ${config.id}`;
              }
              // 確保服務類型正確
              if (!config.service_type) {
                config.service_type = upperServiceType;
              }
              return config;
            })
            .filter((config) => config !== null); // 過濾掉無效的配置
          console.log(
            `處理後的${upperServiceType}服務配置數據:`,
            processedData
          );
          // 更新快取
          this.servicesCache.set(cacheKey, processedData);
          this.lastFetchTimes.set(cacheKey, now);
          this.pendingRequests.delete(cacheKey); // 清除進行中的請求
          return processedData;
        })
        .catch((error) => {
          console.error(`獲取${upperServiceType}服務配置失敗:`, error);
          this.pendingRequests.delete(cacheKey); // 清除進行中的請求，即使出錯
          // 檢查是否為 CORS 錯誤或網路錯誤
          if (
            error.message &&
            (error.message.includes('NetworkError') ||
              error.message.includes('Failed to fetch') ||
              error.message.includes('CORS'))
          ) {
            console.log(
              `疑似 CORS 或網路問題，返回空的${upperServiceType}服務配置列表`
            );
            return [];
          }
          // 返回空陣列，而不是拋出錯誤
          return [];
        });
      this.pendingRequests.set(cacheKey, request);
      return request;
    } catch (error) {
      console.error(`獲取${serviceType}服務配置過程中出錯:`, error);
      const cacheKey = serviceType.toUpperCase();
      this.pendingRequests.delete(cacheKey);
      // 返回空陣列，而不是拋出錯誤
      return [];
    }
  }

  /**
   * 獲取格式化後的外部服務配置選項，適用於下拉選單
   * @param {string} serviceType - 服務類型
   * @returns {Promise<Array>} 格式化的服務配置選項
   */
  async getServiceConfigOptions(serviceType) {
    try {
      const configs = await this.getExternalServiceConfigs(serviceType);
      console.log(`${serviceType}服務配置數據:`, configs);
      // 檢查服務配置數據是否有效
      if (!configs || !Array.isArray(configs)) {
        console.warn(`${serviceType}服務配置數據無效或不是陣列，返回空選項`);
        return [];
      }
      if (configs.length === 0) {
        console.warn(`API返回的${serviceType}服務配置陣列為空`);
        return [];
      }
      // 將API返回的服務配置數據轉換為select選項格式
      const options = configs
        .map((config, index) => {
          // 確保服務配置對象存在
          if (!config) {
            console.warn(
              `遇到無效的${serviceType}服務配置數據，索引: ${index}`
            );
            return null;
          }
          // 記錄每個服務配置的關鍵屬性
          console.log(`處理${serviceType}服務配置 ${index}:`, {
            id: config.id,
            name: config.name,
            service_type: config.service_type,
            description: config.description
          });
          // 取得 ID，確保是字串型別
          const configId =
            config.id !== undefined && config.id !== null
              ? config.id.toString()
              : `${index + 1}`;
          // 取得顯示名稱
          const displayLabel =
            config.name || `${serviceType} Config ${configId}`;
          // 取得描述
          const description = config.description || '';
          return {
            value: configId,
            label: displayLabel,
            description: description,
            serviceType: config.service_type || serviceType.toUpperCase(),
            config: config.config || {},
            updatedAt: config.updated_at,
            userId: config.user_id
          };
        })
        .filter((option) => option !== null); // 過濾掉無效的選項
      console.log(`最終格式化的${serviceType}選項:`, options);
      return options;
    } catch (error) {
      console.error(`獲取${serviceType}服務配置選項失敗:`, error);
      // 返回空陣列，以防API失敗
      return [];
    }
  }

  /**
   * 獲取所有支援的服務類型的配置
   * @returns {Promise<Object>} 所有服務類型的配置對象
   */
  async getAllServiceConfigs() {
    try {
      const allConfigs = {};
      // 並行獲取所有支援的服務類型配置
      const promises = this.supportedServiceTypes.map(async (serviceType) => {
        try {
          const configs = await this.getExternalServiceConfigs(serviceType);
          allConfigs[serviceType] = configs;
        } catch (error) {
          console.error(`獲取${serviceType}配置失敗:`, error);
          allConfigs[serviceType] = [];
        }
      });
      await Promise.all(promises);
      console.log('所有服務配置:', allConfigs);
      return allConfigs;
    } catch (error) {
      console.error('獲取所有服務配置失敗:', error);
      // 返回空對象結構
      const emptyConfigs = {};
      this.supportedServiceTypes.forEach((type) => {
        emptyConfigs[type] = [];
      });
      return emptyConfigs;
    }
  }

  /**
   * 清除特定服務類型的快取
   * @param {string} serviceType - 服務類型
   */
  clearCache(serviceType = null) {
    if (serviceType) {
      const cacheKey = serviceType.toUpperCase();
      this.servicesCache.delete(cacheKey);
      this.lastFetchTimes.delete(cacheKey);
      this.pendingRequests.delete(cacheKey);
      console.log(`已清除${serviceType}的快取`);
    } else {
      // 清除所有快取
      this.servicesCache.clear();
      this.lastFetchTimes.clear();
      this.pendingRequests.clear();
      console.log('已清除所有外部服務配置快取');
    }
  }

  /**
   * 清除特定頻道類型的 Messaging Types 快取
   * @param {string} channelType - 頻道類型
   */
  clearMessagingTypesCache(channelType = null) {
    if (channelType) {
      const cacheKey = channelType.toLowerCase();
      this.messagingTypesCache.delete(cacheKey);
      this.lastMessagingTypesFetchTimes.delete(cacheKey);
      this.pendingMessagingTypesRequests.delete(cacheKey);
      console.log(`已清除${channelType}的 Messaging Types 快取`);
    } else {
      // 清除所有 Messaging Types 快取
      this.messagingTypesCache.clear();
      this.lastMessagingTypesFetchTimes.clear();
      this.pendingMessagingTypesRequests.clear();
      console.log('已清除所有 Messaging Types 快取');
    }
  }

  /**
   * 預加載所有支援的服務類型配置，通常在應用啟動時呼叫
   */
  preloadData() {
    console.log('預加載所有外部服務配置和 Messaging Types');

    // 預加載服務配置
    this.supportedServiceTypes.forEach((serviceType) => {
      this.getExternalServiceConfigs(serviceType).catch((err) => {
        console.log(`預加載${serviceType}服務配置失敗:`, err);
      });
    });

    // 預加載 Messaging Types
    this.supportedChannelTypes.forEach((channelType) => {
      this.getMessagingTypes(channelType).catch((err) => {
        console.log(`預加載${channelType} Messaging Types失敗:`, err);
      });
    });
  }

  /**
   * 檢查服務類型是否被支援
   * @param {string} serviceType - 服務類型
   * @returns {boolean} 是否支援該服務類型
   */
  isSupportedServiceType(serviceType) {
    return this.supportedServiceTypes.includes(serviceType?.toUpperCase());
  }

  /**
   * 檢查頻道類型是否被支援 (用於 messaging types)
   * @param {string} channelType - 頻道類型
   * @returns {boolean} 是否支援該頻道類型
   */
  isSupportedChannelType(channelType) {
    return this.supportedChannelTypes.includes(channelType?.toLowerCase());
  }

  /**
   * 獲取支援的服務類型列表
   * @returns {Array} 支援的服務類型陣列
   */
  getSupportedServiceTypes() {
    return [...this.supportedServiceTypes];
  }

  /**
   * 獲取支援的頻道類型列表
   * @returns {Array} 支援的頻道類型陣列
   */
  getSupportedChannelTypes() {
    return [...this.supportedChannelTypes];
  }
}
