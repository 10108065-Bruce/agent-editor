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

    // 知識庫相關緩存
    this.knowledgeBasesCache = null;
    this.lastKnowledgeBasesFetchTime = null;
    this.pendingKnowledgeBasesRequest = null; // 用於追蹤進行中的知識庫請求

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
        return this.modelsCache;
      }

      // 如果已經有一個請求在進行中，則返回該請求
      if (this.pendingRequest) {
        return this.pendingRequest;
      }

      // 創建新請求

      const options = tokenService.createAuthHeader({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      });
      const url = tokenService.createUrlWithWorkspace(
        `${API_CONFIG.BASE_URL}/agent_designer/llm/`
      );
      this.pendingRequest = fetch(url, options)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
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
        return this.structuredOutputModelsCache;
      }

      // 如果已經有一個請求在進行中，則返回該請求
      if (this.pendingStructuredOutputRequest) {
        return this.pendingStructuredOutputRequest;
      }

      // 創建新請求
      const options = tokenService.createAuthHeader({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      });
      const url = tokenService.createUrlWithWorkspace(
        `${API_CONFIG.BASE_URL}/agent_designer/llm/structured-output`
      );
      this.pendingStructuredOutputRequest = fetch(url, options)
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
   * 獲取所有知識庫列表
   * @returns {Promise<Array>} 知識庫列表
   */
  async getKnowledgeBases() {
    try {
      // 檢查是否有有效的快取
      const now = Date.now();
      if (
        this.knowledgeBasesCache &&
        this.lastKnowledgeBasesFetchTime &&
        now - this.lastKnowledgeBasesFetchTime < this.cacheExpiryTime
      ) {
        return this.knowledgeBasesCache;
      }

      // 如果已經有一個請求在進行中，則返回該請求
      if (this.pendingKnowledgeBasesRequest) {
        return this.pendingKnowledgeBasesRequest;
      }

      // 創建新請求
      const options = tokenService.createAuthHeader({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      });
      // 獲取 workspace_id 並替換路徑參數
      const workspaceId = tokenService.getWorkspaceId();
      if (!workspaceId) {
        throw new Error('未設置工作區 ID');
      }
      const url = `${API_CONFIG.BASE_URL}/agent_designer/knowledge-bases/workspace/${workspaceId}/list`;
      this.pendingKnowledgeBasesRequest = fetch(url, options)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
          }
          return response.json();
        })
        .then((responseData) => {
          // 檢查新的 response 格式
          let knowledgeBases = [];

          if (responseData && responseData.data) {
            knowledgeBases = responseData.data.knowledge_bases || [];
          } else {
            console.warn(
              'API回應格式不符合預期，檢查是否有 knowledge_bases 陣列'
            );
            // 嘗試直接使用 responseData 如果它是陣列
            if (Array.isArray(responseData)) {
              knowledgeBases = responseData;
            }
          }

          // 如果沒有找到有效數據，返回預設知識庫
          if (!Array.isArray(knowledgeBases) || knowledgeBases.length === 0) {
            console.warn('無法從API回應中提取合理的知識庫數據，使用預設知識庫');
            knowledgeBases = [];
          }

          // 檢查每個知識庫對象，確保結構正確
          const processedData = knowledgeBases.map((kb, index) => {
            if (!kb || typeof kb !== 'object') {
              console.warn(`知識庫 ${index} 無效，使用替代數據`);
              return {
                id: index + 1,
                name: `知識庫 ${index + 1}`,
                description: `知識庫 ${index + 1} 的描述`,
                file_count: 0,
                updated_at: new Date().toISOString()
              };
            }

            // 確保知識庫有ID
            if (kb.id === undefined || kb.id === null) {
              console.warn(`知識庫 ${index} 缺少ID，使用索引作為ID`);
              kb.id = index + 1;
            }

            // 確保知識庫有名稱
            if (!kb.name) {
              console.warn(`知識庫 ${index} 缺少名稱，使用預設名稱`);
              kb.name = `知識庫 ${kb.id}`;
            }

            // 確保有描述
            if (!kb.description) {
              kb.description = `${kb.name} 的描述`;
            }

            // 確保有檔案數量
            if (kb.file_count === undefined || kb.file_count === null) {
              kb.file_count = 0;
            }

            // 確保有更新時間
            if (!kb.updated_at) {
              kb.updated_at = new Date().toISOString();
            }

            return kb;
          });

          // 更新快取
          this.knowledgeBasesCache = processedData;
          this.lastKnowledgeBasesFetchTime = now;
          this.pendingKnowledgeBasesRequest = null; // 清除進行中的請求

          return processedData;
        })
        .catch((error) => {
          console.error('獲取知識庫失敗:', error);
          this.pendingKnowledgeBasesRequest = null; // 清除進行中的請求，即使出錯

          // 檢查是否為 CORS 錯誤
          if (
            error.message &&
            (error.message.includes('NetworkError') ||
              error.message.includes('Failed to fetch'))
          ) {
            return [
              {
                id: 1,
                name: '產品文檔知識庫',
                description: '存放所有產品相關文檔和規格',
                file_count: 3,
                updated_at: new Date().toISOString()
              }
            ];
          }

          throw error;
        });

      return this.pendingKnowledgeBasesRequest;
    } catch (error) {
      console.error('獲取知識庫過程中出錯:', error);
      this.pendingKnowledgeBasesRequest = null;
      throw error;
    }
  }

  /**
   * 向後相容方法 - 保持原有的 getCompletedFiles 方法名
   * @returns {Promise<Array>} 知識庫列表（原文件列表）
   */
  async getCompletedFiles() {
    return this.getKnowledgeBases();
  }

  /**
   * 獲取格式化後的模型選項，適用於下拉選單
   * @returns {Promise<Array>} 格式化的模型選項
   */
  async getModelOptions() {
    try {
      const models = await this.getModels();

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

      // 將API返回的模型數據轉換為select選項格式
      const options = models.map((model, index) => {
        // 確保模型對象存在
        if (!model) {
          console.warn(`遇到無效的模型數據，索引: ${index}`);
          return { value: `${index + 1}`, label: `Model ${index + 1}` };
        }

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
   * 獲取格式化後的知識庫選項，適用於下拉選單
   * @returns {Promise<Array>} 格式化的知識庫選項
   */
  async getKnowledgeBaseOptions() {
    try {
      const knowledgeBases = await this.getKnowledgeBases();

      // 根據新的知識庫格式進行處理
      return knowledgeBases.map((kb) => ({
        id: kb.id.toString(), // 確保ID是字符串
        value: kb.id.toString(), // 用於選項值
        name: kb.name, // 用於顯示名稱
        label: kb.name, // 用於顯示名稱 (替代)
        description: kb.description, // 知識庫描述
        fileCount: kb.file_count, // 檔案數量
        updatedAt: kb.updated_at // 更新時間
      }));
    } catch (error) {
      console.error('獲取知識庫選項失敗:', error);
      // 返回一些默認選項，以防API失敗
      return [
        {
          id: '1',
          value: '1',
          name: '產品文檔知識庫',
          label: '產品文檔知識庫',
          description: '存放所有產品相關文檔和規格',
          fileCount: 3,
          updatedAt: new Date().toISOString()
        }
      ];
    }
  }

  /**
   * 向後相容方法 - 保持原有的 getFileOptions 方法名
   * @returns {Promise<Array>} 格式化的知識庫選項（原文件選項）
   */
  async getFileOptions() {
    return this.getKnowledgeBaseOptions();
  }

  /**
   * 預加載模型與知識庫數據，通常在應用啟動時呼叫
   */
  preloadData() {
    console.log('預加載LLM模型、結構化輸出模型和知識庫列表');

    // 預加載模型
    this.getModels().catch((err) => {
      console.log('預加載模型失敗:', err);
    });

    // 預加載結構化輸出模型
    this.getStructuredOutputModels().catch((err) => {
      console.log('預加載結構化輸出模型失敗:', err);
    });

    // 預加載知識庫
    this.getKnowledgeBases().catch((err) => {
      console.log('預加載知識庫失敗:', err);
    });
  }
}
