import { tokenService } from './TokenService';
import { API_CONFIG } from './config';

/**
 * LLM模型和知識檢索服務 - 處理與LLM模型和文件相關的API請求
 */
export class LLMService {
  constructor() {
    // 模型相關緩存
    this.modelsCache = null;
    this.lastFetchTime = null;
    this.cacheExpiryTime = 10 * 60 * 1000; // 10分鐘cache過期
    this.pendingRequest = null; // 用於追蹤進行中的請求

    // 文件相關緩存
    this.filesCache = null;
    this.lastFilesFetchTime = null;
    this.pendingFilesRequest = null; // 用於追蹤進行中的文件請求

    // 新增：結構化輸出模型相關緩存
    this.structuredOutputModelsCache = null;
    this.lastStructuredOutputFetchTime = null;
    this.pendingStructuredOutputRequest = null; // 用於追蹤進行中的結構化輸出請求
  }

  /**
   * 獲取所有可用的LLM模型
   * @returns {Promise<Array>} 模型列表
   */
  async getModels() {
    try {
      // 檢查是否有有效的快取
      const now = Date.now();
      if (
        this.modelsCache &&
        this.lastFetchTime &&
        now - this.lastFetchTime < this.cacheExpiryTime
      ) {
        console.log('使用快取的LLM模型列表');
        return this.modelsCache;
      }

      // 如果已經有一個請求在進行中，則返回該請求
      if (this.pendingRequest) {
        console.log('已有進行中的LLM模型請求，使用相同請求');
        return this.pendingRequest;
      }

      // 創建新請求
      console.log('獲取LLM模型列表...');
      const options = tokenService.createAuthHeader({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      });
      this.pendingRequest = fetch(
        `${API_CONFIG.BASE_URL}/agent_designer/llm/`,
        options
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log('API返回原始模型數據:', data);

          // 檢查數據是否為數組
          if (!Array.isArray(data)) {
            console.warn('API返回的模型數據不是陣列');
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
              // 如果無法提取合理的數據，則返回預設模型
              console.warn('無法從API回應中提取合理的模型數據，使用預設模型');
              data = [
                {
                  id: 1,
                  name: 'O3-mini',
                  display_name: 'O3-mini',
                  is_default: true
                },
                { id: 2, name: 'O3-plus', display_name: 'O3-plus' },
                { id: 3, name: 'O3-mega', display_name: 'O3-mega' },
                { id: 4, name: 'O3-ultra', display_name: 'O3-ultra' }
              ];
            }
          }

          // 檢查每個模型對象，確保結構正確
          const processedData = data.map((model, index) => {
            if (!model || typeof model !== 'object') {
              console.warn(`模型 ${index} 無效，使用替代數據`);
              return {
                id: index + 1,
                name: `Model ${index + 1}`,
                display_name: `Model ${index + 1}`,
                is_default: index === 0
              };
            }

            // 確保模型有ID
            if (model.id === undefined || model.id === null) {
              console.warn(`模型 ${index} 缺少ID，使用索引作為ID`);
              model.id = index + 1;
            }

            // 確保模型有名稱
            if (!model.name && !model.display_name) {
              console.warn(`模型 ${index} 缺少名稱，使用索引作為名稱`);
              model.name = `Model ${model.id}`;
            }

            return model;
          });

          console.log('處理後的模型數據:', processedData);

          // 更新快取
          this.modelsCache = processedData;
          this.lastFetchTime = now;
          this.pendingRequest = null; // 清除進行中的請求

          return processedData;
        })
        .catch((error) => {
          console.error('獲取LLM模型失敗:', error);
          this.pendingRequest = null; // 清除進行中的請求，即使出錯

          // 返回預設模型，而不是拋出錯誤
          return [
            {
              id: 1,
              name: 'O3-mini',
              display_name: 'O3-mini',
              is_default: true
            },
            { id: 2, name: 'O3-plus', display_name: 'O3-plus' },
            { id: 3, name: 'O3-mega', display_name: 'O3-mega' },
            { id: 4, name: 'O3-ultra', display_name: 'O3-ultra' }
          ];
        });

      return this.pendingRequest;
    } catch (error) {
      console.error('獲取LLM模型過程中出錯:', error);
      this.pendingRequest = null;

      // 返回預設模型，而不是拋出錯誤
      return [
        { id: 1, name: 'O3-mini', display_name: 'O3-mini', is_default: true },
        { id: 2, name: 'O3-plus', display_name: 'O3-plus' },
        { id: 3, name: 'O3-mega', display_name: 'O3-mega' },
        { id: 4, name: 'O3-ultra', display_name: 'O3-ultra' }
      ];
    }
  }

  /**
   * 新增：獲取支援結構化輸出的LLM模型
   * @returns {Promise<Array>} 結構化輸出模型列表
   */
  async getStructuredOutputModels() {
    try {
      // 檢查是否有有效的快取
      const now = Date.now();
      if (
        this.structuredOutputModelsCache &&
        this.lastStructuredOutputFetchTime &&
        now - this.lastStructuredOutputFetchTime < this.cacheExpiryTime
      ) {
        console.log('使用快取的結構化輸出模型列表');
        return this.structuredOutputModelsCache;
      }

      // 如果已經有一個請求在進行中，則返回該請求
      if (this.pendingStructuredOutputRequest) {
        console.log('已有進行中的結構化輸出模型請求，使用相同請求');
        return this.pendingStructuredOutputRequest;
      }

      // 創建新請求
      console.log('獲取結構化輸出模型列表...');
      const options = tokenService.createAuthHeader({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      });
      this.pendingStructuredOutputRequest = fetch(
        `${API_CONFIG.BASE_URL}/agent_designer/llm/structured-output`,
        options
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log('API返回原始結構化輸出模型數據:', data);

          // 檢查數據是否為數組
          if (!Array.isArray(data)) {
            console.warn('API返回的結構化輸出模型數據不是陣列');
            // 返回預設模型
            data = [
              {
                id: 0,
                display_name: 'GPT-4o',
                description: 'OpenAI GPT-4o 支援結構化輸出',
                provider: 'AZURE_OPENAI'
              }
            ];
          }

          // 檢查每個模型對象，確保結構正確
          const processedData = data.map((model, index) => {
            if (!model || typeof model !== 'object') {
              console.warn(`結構化輸出模型 ${index} 無效，使用替代數據`);
              return {
                id: index,
                display_name: `Structured Model ${index}`,
                description: `結構化輸出模型 ${index}`,
                provider: 'AZURE_OPENAI'
              };
            }

            // 確保模型有ID
            if (model.id === undefined || model.id === null) {
              console.warn(`結構化輸出模型 ${index} 缺少ID，使用索引作為ID`);
              model.id = index;
            }

            // 確保模型有顯示名稱
            if (!model.display_name) {
              console.warn(
                `結構化輸出模型 ${index} 缺少顯示名稱，使用預設名稱`
              );
              model.display_name = `Structured Model ${model.id}`;
            }

            return model;
          });

          console.log('處理後的結構化輸出模型數據:', processedData);

          // 更新快取
          this.structuredOutputModelsCache = processedData;
          this.lastStructuredOutputFetchTime = now;
          this.pendingStructuredOutputRequest = null; // 清除進行中的請求

          return processedData;
        })
        .catch((error) => {
          console.error('獲取結構化輸出模型失敗:', error);
          this.pendingStructuredOutputRequest = null; // 清除進行中的請求，即使出錯

          // 返回預設模型，而不是拋出錯誤
          return [
            {
              id: 0,
              display_name: 'GPT-4o',
              description: 'OpenAI GPT-4o 支援結構化輸出',
              provider: 'AZURE_OPENAI'
            }
          ];
        });

      return this.pendingStructuredOutputRequest;
    } catch (error) {
      console.error('獲取結構化輸出模型過程中出錯:', error);
      this.pendingStructuredOutputRequest = null;

      // 返回預設模型，而不是拋出錯誤
      return [
        {
          id: 0,
          display_name: 'GPT-4o',
          description: 'OpenAI GPT-4o 支援結構化輸出',
          provider: 'AZURE_OPENAI'
        }
      ];
    }
  }

  /**
   * 獲取所有已完成的文件
   * @returns {Promise<Array>} 文件列表
   */
  async getCompletedFiles() {
    try {
      // 檢查是否有有效的快取
      const now = Date.now();
      if (
        this.filesCache &&
        this.lastFilesFetchTime &&
        now - this.lastFilesFetchTime < this.cacheExpiryTime
      ) {
        console.log('使用快取的已完成文件列表');
        return this.filesCache;
      }

      // 如果已經有一個請求在進行中，則返回該請求
      if (this.pendingFilesRequest) {
        console.log('已有進行中的文件列表請求，使用相同請求');
        return this.pendingFilesRequest;
      }

      // 創建新請求
      console.log('獲取已完成文件列表...');
      const options = tokenService.createAuthHeader({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      });
      this.pendingFilesRequest = fetch(
        `${API_CONFIG.BASE_URL}/agent_designer/files/completed`,
        options
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log('成功獲取已完成文件:', data);

          // 更新快取
          this.filesCache = data;
          this.lastFilesFetchTime = now;
          this.pendingFilesRequest = null; // 清除進行中的請求

          return data;
        })
        .catch((error) => {
          console.error('獲取已完成文件失敗:', error);
          this.pendingFilesRequest = null; // 清除進行中的請求，即使出錯
          this.pendingFilesRequest = null;

          // 檢查是否為 CORS 錯誤
          if (
            error.message &&
            (error.message.includes('NetworkError') ||
              error.message.includes('Failed to fetch'))
          ) {
            console.log('疑似 CORS 問題，返回預設檔案列表');
            // 直接返回預設值而不是再次拋出錯誤
            return [
              { id: 1, filename: 'ICDCode.csv' },
              { id: 2, filename: 'Cardiology_Diagnoses.csv' }
            ];
          }

          throw error;
        });

      return this.pendingFilesRequest;
    } catch (error) {
      console.error('獲取已完成文件過程中出錯:', error);
      this.pendingFilesRequest = null;
      throw error;
    }
  }

  /**
   * 獲取格式化後的模型選項，適用於下拉選單
   * @returns {Promise<Array>} 格式化的模型選項
   */
  async getModelOptions() {
    try {
      const models = await this.getModels();
      console.log('API返回的模型數據:', models);

      // 檢查模型數據是否有效
      if (!models || !Array.isArray(models)) {
        console.warn('模型數據無效或不是陣列，使用默認選項');
        return [
          { value: '1', label: 'O3-mini' },
          { value: '2', label: 'O3-plus' },
          { value: '3', label: 'O3-mega' },
          { value: '4', label: 'O3-ultra' }
        ];
      }

      if (models.length === 0) {
        console.warn('API返回的模型陣列為空，使用默認選項');
        return [
          { value: '1', label: 'O3-mini' },
          { value: '2', label: 'O3-plus' },
          { value: '3', label: 'O3-mega' },
          { value: '4', label: 'O3-ultra' }
        ];
      }

      // 檢查第一個模型的結構，確認關鍵屬性
      const sampleModel = models[0];
      console.log('模型數據結構示例:', sampleModel);

      // 將API返回的模型數據轉換為select選項格式
      const options = models.map((model, index) => {
        // 確保模型對象存在
        if (!model) {
          console.warn(`遇到無效的模型數據，索引: ${index}`);
          return { value: `${index + 1}`, label: `Model ${index + 1}` };
        }

        // 記錄每個模型的關鍵屬性，幫助診斷
        console.log(`處理模型 ${index}:`, {
          id: model.id,
          name: model.name,
          display_name: model.display_name,
          is_default: model.is_default
        });

        // 取得 ID，確保是字串型別
        let modelId = '1'; // 預設 ID
        if (model.id !== undefined && model.id !== null) {
          modelId = model.id.toString();
        } else {
          modelId = `${index + 1}`; // 使用索引+1作為ID
        }

        // 取得顯示名稱
        const modelLabel = model.display_name || model.name;

        // 如果連名稱也沒有，則使用模型ID作為顯示名稱
        const displayLabel = modelLabel || `Model ${modelId}`;

        return {
          value: modelId,
          label: displayLabel,
          description: model.description || '',
          isDefault: !!model.is_default
        };
      });

      console.log('最終格式化的選項:', options);
      return options;
    } catch (error) {
      console.error('獲取模型選項失敗:', error);
      // 返回一些默認選項，以防API失敗
      return [
        { value: '1', label: 'O3-mini' },
        { value: '2', label: 'O3-plus' },
        { value: '3', label: 'O3-mega' },
        { value: '4', label: 'O3-ultra' }
      ];
    }
  }

  /**
   * 新增：獲取格式化後的結構化輸出模型選項，適用於下拉選單
   * @returns {Promise<Array>} 格式化的結構化輸出模型選項
   */
  async getStructuredOutputModelOptions() {
    try {
      const models = await this.getStructuredOutputModels();
      console.log('API返回的結構化輸出模型數據:', models);

      // 檢查模型數據是否有效
      if (!models || !Array.isArray(models)) {
        console.warn('結構化輸出模型數據無效或不是陣列，使用默認選項');
        return [
          {
            value: '0',
            label: 'GPT-4o',
            description: 'OpenAI GPT-4o 支援結構化輸出',
            provider: 'AZURE_OPENAI'
          }
        ];
      }

      if (models.length === 0) {
        console.warn('API返回的結構化輸出模型陣列為空，使用默認選項');
        return [
          {
            value: '0',
            label: 'GPT-4o',
            description: 'OpenAI GPT-4o 支援結構化輸出',
            provider: 'AZURE_OPENAI'
          }
        ];
      }

      // 將API返回的結構化輸出模型數據轉換為select選項格式
      const options = models.map((model, index) => {
        // 確保模型對象存在
        if (!model) {
          console.warn(`遇到無效的結構化輸出模型數據，索引: ${index}`);
          return {
            value: `${index}`,
            label: `Structured Model ${index}`,
            description: '',
            provider: 'AZURE_OPENAI'
          };
        }

        // 記錄每個模型的關鍵屬性，幫助診斷
        console.log(`處理結構化輸出模型 ${index}:`, {
          id: model.id,
          display_name: model.display_name,
          description: model.description,
          provider: model.provider
        });

        // 取得 ID，確保是字串型別
        let modelId = '0'; // 預設 ID
        if (model.id !== undefined && model.id !== null) {
          modelId = model.id.toString();
        } else {
          modelId = `${index}`; // 使用索引作為ID
        }

        // 取得顯示名稱
        const displayLabel =
          model.display_name || `Structured Model ${modelId}`;

        return {
          value: modelId,
          label: displayLabel,
          description: model.description || '',
          provider: model.provider || 'AZURE_OPENAI'
        };
      });

      console.log('最終格式化的結構化輸出選項:', options);
      return options;
    } catch (error) {
      console.error('獲取結構化輸出模型選項失敗:', error);
      // 返回一些默認選項，以防API失敗
      return [
        {
          value: '0',
          label: 'GPT-4o',
          description: 'OpenAI GPT-4o 支援結構化輸出',
          provider: 'AZURE_OPENAI'
        }
      ];
    }
  }

  /**
   * 獲取格式化後的已完成文件選項，適用於下拉選單
   * @returns {Promise<Array>} 格式化的文件選項
   */
  async getFileOptions() {
    try {
      const files = await this.getCompletedFiles();

      // 根據後端返回的格式 [{"filename": '123.csv', "id": 1}] 進行處理
      return files.map((file) => ({
        id: file.id.toString(), // 確保ID是字符串
        value: file.id.toString(), // 用於選項值
        name: file.filename, // 用於顯示名稱
        label: file.filename // 用於顯示名稱 (替代)
      }));
    } catch (error) {
      console.error('獲取文件選項失敗:', error);
      // 返回一些默認選項，以防API失敗
      return [
        {
          id: 'icdcode',
          value: 'icdcode',
          name: 'ICDCode.csv',
          label: 'ICDCode.csv'
        },
        {
          id: 'cardiology',
          value: 'cardiology',
          name: 'Cardiology_Diagnoses.csv',
          label: 'Cardiology_Diagnoses.csv'
        }
      ];
    }
  }

  /**
   * 預加載模型與文件數據，通常在應用啟動時呼叫
   */
  preloadData() {
    console.log('預加載LLM模型、結構化輸出模型和文件列表');

    // 預加載模型
    this.getModels().catch((err) => {
      console.log('預加載模型失敗:', err);
    });

    // 預加載結構化輸出模型
    this.getStructuredOutputModels().catch((err) => {
      console.log('預加載結構化輸出模型失敗:', err);
    });

    // 預加載文件
    this.getCompletedFiles().catch((err) => {
      console.log('預加載文件失敗:', err);
    });
  }
}
