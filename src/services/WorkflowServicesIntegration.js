/**
 * 工作流相關服務共用的基礎映射和轉換功能
 */
class WorkflowMappingService {
  /**
   * 從 ReactFlow 類型獲取 API 操作符
   * @param {string} type - ReactFlow 節點類型
   * @returns {string} - API 操作符類型
   */
  static getOperatorFromType(type) {
    const operatorMap = {
      browserExtensionInput: 'browser_extension_input',
      browserExtensionOutput: 'browser_extension_output',
      webhook: 'webhook',
      customInput: 'basic_input',
      input: 'basic_input',
      aiCustomInput: 'ask_ai',
      ai: 'ask_ai',
      ifElse: 'ifElse',
      knowledgeRetrieval: 'knowledge_retrieval',
      knowledge_retrieval: 'knowledge_retrieval',
      http: 'http',
      timer: 'timer',
      line: 'line',
      event: 'event',
      end: 'end'
    };
    return operatorMap[type] || type;
  }

  /**
   * 從 API 操作符獲取 ReactFlow 類型
   * @param {string} operator - API 操作符類型
   * @returns {string} - ReactFlow 節點類型
   */
  static getTypeFromOperator(operator) {
    const typeMap = {
      browser_extension_input: 'browserExtensionInput',
      browser_extension_output: 'browserExtensionOutput',
      webhook: 'webhook',
      basic_input: 'customInput',
      ask_ai: 'aiCustomInput',
      ifElse: 'ifElse',
      knowledge_retrieval: 'knowledgeRetrieval',
      http: 'http',
      timer: 'timer',
      line: 'line',
      event: 'event',
      end: 'end'
    };
    return typeMap[operator] || operator;
  }

  /**
   * 從 ReactFlow 類型獲取 API 類別
   * @param {string} type - ReactFlow 節點類型
   * @returns {string} - API 節點類別
   */
  static getCategoryFromType(type) {
    const categoryMap = {
      browserExtensionInput: 'starter',
      browserExtInput: 'starter',
      webhook: 'starter',
      customInput: 'input',
      input: 'input',
      aiCustomInput: 'advanced',
      ai: 'advanced',
      knowledgeRetrieval: 'advanced',
      knowledge_retrieval: 'advanced',
      ifElse: 'logic',
      http: 'integration',
      timer: 'event',
      line: 'integration',
      event: 'event',
      end: 'output',
      browserExtensionOutput: 'output'
    };
    return categoryMap[type] || 'advanced';
  }

  /**
   * 根據節點數據生成標籤
   * @param {Object} node - 節點數據
   * @returns {string} - 節點標籤
   */
  static getNodeLabel(node) {
    switch (node.operator) {
      case 'browser_extension_input':
        return '瀏覽器擴充輸入';
      case 'browser_extension_output':
        return '瀏覽器擴充輸出';
      case 'ask_ai':
        return `AI (${node.parameters?.model?.data || 'GPT-4o'})`;
      case 'basic_input': {
        // 嘗試獲取第一個輸入欄位的名稱
        const inputName =
          node.parameters?.input_name_0?.data ||
          node.parameters?.input_name?.data;
        return inputName || '輸入';
      }
      case 'ifElse':
        return '條件判斷';
      case 'knowledge_retrieval':
        return '知識檢索';
      case 'end':
        return '結束';
      case 'webhook':
        return 'Webhook';
      case 'http':
        return 'HTTP 請求';
      case 'timer':
        return '計時器';
      case 'line':
        return 'LINE 訊息';
      case 'event':
        return '事件處理';
      default:
        return node.operator;
    }
  }

  /**
   * 提取节点输入以供 API 格式使用 - 改进版本，确保多个连接到同一目标的情况正确处理
   * @param {string} nodeId - 节点 ID
   * @param {Array} edges - 所有边缘
   * @returns {Object} - API 格式的节点输入
   */
  static extractNodeInputForAPI(nodeId, edges) {
    const nodeInput = {};
    console.log(`提取节点 ${nodeId} 的输入连接`);

    // 获取所有以该节点为目标的边缘
    const relevantEdges = edges.filter((edge) => edge.target === nodeId);
    console.log(`找到 ${relevantEdges.length} 个输入连接`);

    // 按 targetHandle 分组边缘
    const handleGroups = {};

    // 首先，分组所有边缘
    relevantEdges.forEach((edge) => {
      const targetHandle = edge.targetHandle || 'input';

      // 初始化组
      if (!handleGroups[targetHandle]) {
        handleGroups[targetHandle] = [];
      }

      // 添加边缘到组
      handleGroups[targetHandle].push(edge);
    });

    // 处理每个句柄组
    Object.entries(handleGroups).forEach(([targetHandle, targetEdges]) => {
      // 当一个句柄有多个连接时，使用索引
      if (targetEdges.length > 1) {
        targetEdges.forEach((edge, index) => {
          // 创建唯一的输入键
          const inputKey = `${targetHandle}_${index + 1}`;

          // 添加到 nodeInput
          nodeInput[inputKey] = {
            node_id: edge.source,
            output_name: edge.sourceHandle || 'output',
            type: 'string'
          };

          console.log(
            `多重输入连接: ${edge.source} -> ${nodeId}:${inputKey} (原始句柄: ${targetHandle})`
          );
        });
      } else if (targetEdges.length === 1) {
        // 单一连接，直接使用原始句柄
        const edge = targetEdges[0];

        nodeInput[targetHandle] = {
          node_id: edge.source,
          output_name: edge.sourceHandle || 'output',
          type: 'string'
        };

        console.log(`输入连接: ${edge.source} -> ${nodeId}:${targetHandle}`);
      }
    });

    return nodeInput;
  }
  /**
   * 提取節點輸出以供 API 格式使用
   * @param {Object} node - ReactFlow 節點
   * @returns {Object} - API 格式的節點輸出
   */
  static extractNodeOutputForAPI(node) {
    const nodeOutput = {};
    console.log(`提取節點 ${node.id} 的輸出`);

    switch (node.type) {
      case 'browserExtensionInput':
      case 'browserExtInput':
        if (node.data.items && node.data.items.length > 0) {
          node.data.items.forEach((item, index) => {
            const outputKey = item.id || `a${index + 1}`;
            nodeOutput[outputKey] = {
              node_id: node.id,
              type: 'string'
            };
          });
          console.log(`瀏覽器擴展輸入: 設置 ${node.data.items.length} 個輸出`);
        } else {
          nodeOutput.output = {
            node_id: node.id,
            type: 'string'
          };
        }
        break;

      case 'webhook':
        nodeOutput.headers = {
          node_id: node.id,
          type: 'json',
          data: {}
        };
        nodeOutput.payload = {
          node_id: node.id,
          type: 'json',
          data: {}
        };
        break;

      case 'customInput':
      case 'input':
        if (node.data.fields && node.data.fields.length > 0) {
          node.data.fields.forEach((field, index) => {
            nodeOutput[`output-${index}`] = {
              node_id: node.id,
              type: 'string'
            };
          });
          console.log(`輸入節點: 設置 ${node.data.fields.length} 個輸出`);
        } else {
          nodeOutput.output = {
            node_id: node.id,
            type: 'string'
          };
        }
        break;

      case 'ifElse':
        nodeOutput.true = {
          node_id: node.id,
          type: 'boolean',
          data: true
        };
        nodeOutput.false = {
          node_id: node.id,
          type: 'boolean',
          data: false
        };
        break;

      default:
        // 預設輸出
        nodeOutput.output = {
          node_id: node.id,
          type: 'string',
          data: {}
        };
    }

    return nodeOutput;
  }
}

/**
 * 更新後的工作流 API 服務，使用共用的映射功能
 */
class WorkflowAPIService {
  constructor() {
    this.baseUrl = 'https://api-dev.qoca-apa.quanta-research.com/v1';
  }

  /**
   * 載入工作流數據
   * @param {string} workflowId - 要載入的工作流 ID
   * @returns {Promise<Object>} 工作流數據
   */
  async loadWorkflow(workflowId) {
    try {
      console.log(`嘗試載入工作流 ID: ${workflowId}`);
      const response = await fetch(
        `${this.baseUrl}/agent_designer/workflows/load`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            flow_id: workflowId
          })
        }
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
      const response = await fetch(
        `${this.baseUrl}/agent_designer/workflows/`,
        {
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
        }
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
      const response = await fetch(
        `${this.baseUrl}/agent_designer/workflows/`,
        {
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
        }
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
/**
 * LLM模型和知識檢索服務 - 處理與LLM模型和文件相關的API請求
 */
class LLMService {
  constructor() {
    this.baseUrl = 'https://api-dev.qoca-apa.quanta-research.com/v1';

    // 模型相關緩存
    this.modelsCache = null;
    this.lastFetchTime = null;
    this.cacheExpiryTime = 10 * 60 * 1000; // 10分鐘cache過期
    this.pendingRequest = null; // 用於追蹤進行中的請求

    // 文件相關緩存
    this.filesCache = null;
    this.lastFilesFetchTime = null;
    this.pendingFilesRequest = null; // 用於追蹤進行中的文件請求
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
      this.pendingRequest = fetch(`${this.baseUrl}/llm/detail`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      })
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
      this.pendingFilesRequest = fetch(
        `${this.baseUrl}/agent_designer/files/completed`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          }
        }
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
    console.log('預加載LLM模型和文件列表');

    // 預加載模型
    this.getModels().catch((err) => {
      console.log('預加載模型失敗:', err);
    });

    // 預加載文件
    this.getCompletedFiles().catch((err) => {
      console.log('預加載文件失敗:', err);
    });
  }
}

/**
 * 更新後的工作流數據轉換器，使用共用的映射功能
 */
class WorkflowDataConverter {
  /**
   * 转换 API 数据为 ReactFlow 格式 - 改进版，解决同名输入句柄的冲突问题
   * @param {Object} apiData - API 回传的原始数据
   * @returns {Object} - 包含 nodes 和 edges 的 ReactFlow 格式数据
   */
  static transformToReactFlowFormat(apiData) {
    console.log('开始转换 API 格式为 ReactFlow 格式');

    // 处理 API 数据结构差异
    const flowPipeline =
      apiData.flow_pipeline ||
      (apiData.content ? apiData.content.flow_pipeline : []);

    if (!flowPipeline || !Array.isArray(flowPipeline)) {
      console.error('找不到有效的 flow_pipeline 数组');
      return { nodes: [], edges: [] };
    }

    const nodes = [];
    const edges = [];

    // 处理每个节点
    flowPipeline.forEach((node) => {
      console.log(`处理节点 ${node.id}, 操作符: ${node.operator}`);

      // 转换为 ReactFlow 节点格式
      const reactFlowNode = {
        id: node.id,
        type: WorkflowMappingService.getTypeFromOperator(node.operator),
        position: {
          x: typeof node.position_x === 'number' ? node.position_x : 0,
          y: typeof node.position_y === 'number' ? node.position_y : 0
        },
        data: this.transformNodeDataToReactFlow(node)
      };

      nodes.push(reactFlowNode);

      // 改进处理节点之间连接的逻辑
      if (node.node_input) {
        // 创建一个映射以识别和处理相同句柄名称的情况
        const handleMap = {};

        // 辅助函数：检查字符串是否为数字
        function isNumeric(str) {
          return /^\d+$/.test(str);
        }

        Object.entries(node.node_input).forEach(([inputKey, inputValue]) => {
          if (inputValue && inputValue.node_id) {
            // 从 inputKey 提取基本句柄名称 (移除可能的 _1, _2 等后缀)
            const baseHandleName = inputKey
              .split('_')
              .filter((part) => !isNumeric(part))
              .join('_');

            // 如果使用了同一个基本句柄名称，需要创建唯一的ReactFlow句柄

            // 存储所有使用相同基本句柄名称的输入键，以便后续处理
            if (!handleMap[baseHandleName]) {
              handleMap[baseHandleName] = [];
            }
            handleMap[baseHandleName].push({
              inputKey,
              sourceNodeId: inputValue.node_id,
              outputName: inputValue.output_name || 'output'
            });

            // 记录这个连接的输入键
            console.log(
              `发现连接: ${inputValue.node_id} -> ${node.id}:${inputKey} (基本句柄: ${baseHandleName})`
            );
          }
        });

        // 创建所有边缘，确保每个输入连接都能被正确创建
        Object.entries(handleMap).forEach(([baseHandleName, connections]) => {
          connections.forEach((connection, index) => {
            // 为多个使用相同基本句柄的连接创建唯一的句柄名称
            const targetHandle =
              connections.length > 1
                ? `${baseHandleName}_${index + 1}`
                : baseHandleName;

            // 创建唯一的边缘ID
            const edgeId = `${connection.sourceNodeId}-${node.id}-${targetHandle}-${connection.outputName}`;

            edges.push({
              id: edgeId,
              source: connection.sourceNodeId,
              sourceHandle: connection.outputName,
              target: node.id,
              targetHandle: targetHandle,
              type: 'custom-edge'
            });

            console.log(
              `创建边缘: ${edgeId}, 从 ${connection.sourceNodeId} 到 ${node.id}:${targetHandle}`
            );
          });
        });
      }
    });

    // 自动布局（如果位置都是 0,0）
    this.autoLayout(nodes);

    console.log(`转换完成: ${nodes.length} 个节点, ${edges.length} 个连接`);
    return { nodes, edges };
  }

  /**
   * 將 API 節點數據轉換為 ReactFlow 節點數據
   * @param {Object} node - API 格式節點
   * @returns {Object} - ReactFlow 格式節點數據
   */
  static transformNodeDataToReactFlow(node) {
    const baseData = {
      label: WorkflowMappingService.getNodeLabel(node),
      category: node.category,
      operator: node.operator,
      version: node.version,
      node_input: node.node_input,
      node_output: node.node_output
    };

    // 根據節點類型轉換參數
    switch (node.operator) {
      case 'browser_extension_input':
        return {
          ...baseData,
          type: 'browserExtensionInput',
          browser_extension_url: node.parameters?.browser_extension_url?.data,
          items:
            node.parameters?.functions?.map((func) => ({
              id: func.func_id,
              name: func.func_name,
              icon: func.func_icon || 'document'
            })) || []
        };

      case 'browser_extension_output':
        return {
          ...baseData,
          type: 'browserExtensionOutput'
        };

      case 'webhook':
        return {
          ...baseData,
          webhookUrl: node.parameters?.webhook_url?.data || ''
        };

      case 'ask_ai': {
        // 獲取模型ID，確保處理可能的undefined或null值 // 優先使用 llm_id，如果不存在則使用 model
        const rawModelId =
          node.parameters?.llm_id?.data !== undefined
            ? node.parameters.llm_id.data
            : node.parameters?.model?.data !== undefined
            ? node.parameters.model.data
            : '1';

        // 確保模型ID是字符串類型
        const modelId =
          rawModelId !== null && rawModelId !== undefined
            ? rawModelId.toString()
            : '1';

        return {
          ...baseData,
          model: modelId,
          selectedOption: node.parameters?.selected_option?.data || 'prompt'
        };
      }

      case 'basic_input': {
        // 提取參數中的欄位
        const fields = [];
        const paramKeys = Object.keys(node.parameters || {});

        console.log(`處理 basic_input 節點，參數鍵:`, paramKeys);

        // 查找所有輸入欄位對
        const fieldIndicies = new Set();

        paramKeys.forEach((key) => {
          if (
            key.startsWith('input_name_') ||
            key.startsWith('default_value_')
          ) {
            const match = key.match(/_(\d+)$/);
            if (match && match[1]) {
              fieldIndicies.add(parseInt(match[1]));
            }
          }
        });

        const sortedIndicies = Array.from(fieldIndicies).sort((a, b) => a - b);
        console.log(`找到欄位索引: ${sortedIndicies.join(', ')}`);

        // 處理每個欄位
        sortedIndicies.forEach((i) => {
          const field = {
            inputName:
              node.parameters?.[`input_name_${i}`]?.data || `input_${i}`,
            defaultValue: node.parameters?.[`default_value_${i}`]?.data || ''
          };
          fields.push(field);
          console.log(`添加欄位 ${i}:`, field);
        });

        // 確保至少有一個欄位
        if (fields.length === 0) {
          const defaultField = {
            inputName: 'default_input',
            defaultValue: 'Enter value here'
          };
          fields.push(defaultField);
          console.log('添加一個默認欄位:', defaultField);
        }

        // 返回完整的資料結構，不包含回調函數
        // 回調函數將在 updateNodeFunctions 中添加
        return {
          ...baseData,
          fields
        };
      }

      case 'ifElse':
        return {
          ...baseData,
          variableName: node.parameters?.variable?.data || '',
          operator: node.parameters?.operator?.data || 'equals',
          compareValue: node.parameters?.compare_value?.data || ''
        };

      case 'knowledge_retrieval':
        return {
          ...baseData,
          selectedFile: node.parameters?.data_source?.data || '',
          availableFiles: [
            { id: 'icdcode', name: 'ICDCode.csv' },
            { id: 'cardiology', name: 'Cardiology_Diagnoses.csv' }
          ]
        };

      case 'http':
        return {
          ...baseData,
          url: node.parameters?.url?.data || '',
          method: node.parameters?.method?.data || 'GET'
        };

      case 'timer':
        return {
          ...baseData,
          hours: node.parameters?.hours?.data || 0,
          minutes: node.parameters?.minutes?.data || 0,
          seconds: node.parameters?.seconds?.data || 0
        };

      case 'line':
        return {
          ...baseData,
          mode: node.parameters?.mode?.data || 'reply',
          text: node.parameters?.text?.data || ''
        };

      case 'event':
        return {
          ...baseData,
          eventType: node.parameters?.event_type?.data || 'message',
          eventSource: node.parameters?.event_source?.data || ''
        };

      case 'end':
        return {
          ...baseData,
          outputText: node.parameters?.output_text?.data || ''
        };

      default: {
        // 對於未明確處理的節點類型，保留原始參數
        const transformedParams = {};
        Object.entries(node.parameters || {}).forEach(([key, value]) => {
          transformedParams[key] = value.data;
        });
        return {
          ...baseData,
          ...transformedParams
        };
      }
    }
  }

  /**
   * 自動布局節點（如果所有節點都在同一位置）
   * @param {Array} nodes - ReactFlow 節點數組
   */
  static autoLayout(nodes) {
    // 檢查是否需要自動布局
    const needsLayout =
      nodes.length > 1 &&
      nodes.every((node) => node.position.x === 0 && node.position.y === 0);

    if (needsLayout) {
      console.log('執行自動節點布局');

      let currentX = 50;
      let currentY = 50;
      const xSpacing = 300;
      const ySpacing = 150;

      // 對節點進行分類
      const starterNodes = nodes.filter((node) =>
        ['browserExtensionInput', 'webhook'].includes(node.type)
      );

      const inputNodes = nodes.filter((node) =>
        ['customInput', 'input'].includes(node.type)
      );

      const processingNodes = nodes.filter((node) =>
        [
          'aiCustomInput',
          'ai',
          'ifElse',
          'knowledgeRetrieval',
          'http',
          'timer',
          'event'
        ].includes(node.type)
      );

      const outputNodes = nodes.filter((node) =>
        ['browserExtensionOutput', 'line', 'end'].includes(node.type)
      );

      // 布局開始節點
      starterNodes.forEach((node, index) => {
        node.position.x = currentX;
        node.position.y = currentY + index * ySpacing;
      });

      // 布局輸入節點
      currentX += xSpacing;
      inputNodes.forEach((node, index) => {
        node.position.x = currentX;
        node.position.y = currentY + index * ySpacing;
      });

      // 布局處理節點
      currentX += xSpacing;
      processingNodes.forEach((node, index) => {
        node.position.x = currentX;
        node.position.y = currentY + index * ySpacing;
      });

      // 布局輸出節點
      currentX += xSpacing;
      outputNodes.forEach((node, index) => {
        node.position.x = currentX;
        node.position.y = currentY + index * ySpacing;
      });

      console.log('自動布局完成');
    }
  }

  /**
   * 將 ReactFlow 格式轉換為 API 格式
   * @param {Object} reactFlowData - ReactFlow 格式數據
   * @returns {Object} - API 格式數據
   */
  static convertReactFlowToAPI(reactFlowData) {
    console.log('開始轉換 ReactFlow 格式為 API 格式');

    const flowPipeline = reactFlowData.nodes.map((node) => {
      console.log(`處理節點 ${node.id}, 類型: ${node.type}`);

      // 提取節點輸入連接
      const nodeInput = WorkflowMappingService.extractNodeInputForAPI(
        node.id,
        reactFlowData.edges
      );

      // 提取節點輸出連接
      const nodeOutput = WorkflowMappingService.extractNodeOutputForAPI(node);

      // 轉換節點數據
      const parameters = this.transformNodeDataToAPI(node);

      return {
        id: node.id,
        category: WorkflowMappingService.getCategoryFromType(node.type),
        operator: WorkflowMappingService.getOperatorFromType(node.type),
        parameters,
        position_x: node.position.x,
        position_y: node.position.y,
        version: node.data?.version || '0.0.1',
        node_input: nodeInput,
        node_output: nodeOutput
      };
    });

    const apiData = {
      flow_name: reactFlowData.title || '未命名流程',
      flow_id: reactFlowData.id || `flow_${Date.now()}`,
      content: {
        // flow_id: reactFlowData.id || `flow_${Date.now()}`,
        // user_id: reactFlowData.userId || '1',
        flow_type: 'NORMAL',
        headers: reactFlowData.headers || {
          Authorization: 'Bearer your-token-here',
          'Content-Type': 'application/json'
        }
      },
      flow_pipeline: flowPipeline
    };

    console.log('轉換為 API 格式完成');
    return apiData;
  }

  /**
   * 將 ReactFlow 節點數據轉換為 API 參數格式
   * @param {Object} node - ReactFlow 節點
   * @returns {Object} - API 格式參數
   */
  static transformNodeDataToAPI(node) {
    const parameters = {};
    console.log(`轉換節點 ${node.id} 數據為 API 參數`);

    switch (node.type) {
      case 'customInput':
      case 'input':
        if (node.data.fields && node.data.fields.length > 0) {
          node.data.fields.forEach((field, index) => {
            parameters[`input_name_${index}`] = { data: field.inputName || '' };
            parameters[`default_value_${index}`] = {
              data: field.defaultValue || ''
            };
          });
          console.log(`處理 ${node.data.fields.length} 個輸入欄位`);
        } else {
          console.warn(`節點 ${node.id} 沒有欄位資料`);
        }
        break;

      case 'aiCustomInput':
      case 'ai': {
        // 處理可能的無效model值
        const modelValue = node.data.model || '1';

        // 確保值為字符串
        const safeModelValue =
          modelValue && typeof modelValue !== 'string'
            ? modelValue.toString()
            : modelValue || '1';

        // 使用model作為llm_id - 現在存的是ID值而非名稱
        parameters.llm_id = { data: safeModelValue };

        // 保留model參數，以兼容舊版API
        parameters.model = { data: safeModelValue };

        if (node.data.selectedOption) {
          parameters.selected_option = { data: node.data.selectedOption };
        }
        break;
      }

      case 'browserExtensionInput':
      case 'browserExtInput':
        if (node.data.browser_extension_url) {
          parameters.browser_extension_url = {
            data: node.data.browser_extension_url
          };
        }
        if (node.data.items && node.data.items.length > 0) {
          parameters.functions = node.data.items.map((item, index) => ({
            func_id: item.id || `a${index + 1}`,
            func_name: item.name || '',
            func_icon: item.icon || 'document'
          }));
        }
        break;

      case 'webhook':
        if (node.data.webhookUrl) {
          parameters.webhook_url = { data: node.data.webhookUrl };
        }
        break;

      case 'knowledgeRetrieval':
      case 'knowledge_retrieval':
        if (node.data.selectedFile) {
          parameters.data_source = { data: node.data.selectedFile };
        }
        break;
      case 'ifElse':
        if (node.data.variableName) {
          parameters.variable = { data: node.data.variableName };
        }
        if (node.data.operator) {
          parameters.operator = { data: node.data.operator };
        }
        if (node.data.compareValue !== undefined) {
          parameters.compare_value = { data: node.data.compareValue };
        }
        break;

      case 'http':
        if (node.data.url) {
          parameters.url = { data: node.data.url };
        }
        if (node.data.method) {
          parameters.method = { data: node.data.method };
        }
        break;

      case 'timer':
        parameters.hours = { data: node.data.hours || 0 };
        parameters.minutes = { data: node.data.minutes || 0 };
        parameters.seconds = { data: node.data.seconds || 0 };
        break;

      case 'line':
        parameters.mode = { data: node.data.mode || 'reply' };
        if (node.data.text !== undefined) {
          parameters.text = { data: node.data.text };
        }
        break;

      case 'event':
        parameters.event_type = { data: node.data.eventType || 'message' };
        if (node.data.eventSource) {
          parameters.event_source = { data: node.data.eventSource };
        }
        break;

      case 'end':
        if (node.data.outputText !== undefined) {
          parameters.output_text = { data: node.data.outputText };
        }
        break;

      case 'browserExtensionOutput':
        // 目前沒有特定的參數需要轉換
        break;

      default:
        // 對於其他類型，直接轉換非系統屬性
        if (node.data) {
          Object.entries(node.data).forEach(([key, value]) => {
            // 排除系統屬性和函數
            if (
              ![
                'label',
                'category',
                'operator',
                'version',
                'node_input',
                'node_output',
                'onSelect',
                'updateNodeData',
                'addField',
                'updateFieldInputName',
                'updateFieldDefaultValue'
              ].includes(key) &&
              typeof value !== 'function'
            ) {
              parameters[key] = { data: value };
            }
          });
        }
    }

    return parameters;
  }
}

/**
 * 圖標上傳服務 - 處理與圖標上傳相關的 API 請求
 */
class IconUploadService {
  constructor() {
    this.baseUrl = 'https://api-dev.qoca-apa.quanta-research.com/v1';
    this.cache = {}; // 緩存上傳過的圖標
  }

  /**
   * 上傳圖標文件到服務器
   * @param {File} file - 要上傳的文件對象
   * @returns {Promise<Object>} - 包含上傳結果的 Promise，成功時返回 {success: true, url: "圖標URL"}
   */
  async uploadIcon(file) {
    if (!file) {
      throw new Error('未提供文件');
    }

    // 檢查文件類型
    if (!file.type.startsWith('image/')) {
      throw new Error('僅支持圖片文件');
    }

    try {
      console.log(`開始上傳圖標: ${file.name}`);

      // 創建 FormData 對象
      const formData = new FormData();
      formData.append('file', file); // 使用正確的欄位名稱 'file'

      // 發送 POST 請求
      const response = await fetch(`${this.baseUrl}/agent_designer/icons/`, {
        method: 'POST',
        headers: {
          accept: 'application/json'
          // 注意：不要設置 'Content-Type': 'multipart/form-data'，
          // fetch 會自動設置正確的 boundary
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`上傳失敗: ${response.status} ${response.statusText}`);
      }

      // 解析 API 回傳的資料
      const data = await response.json();
      console.log('圖標上傳成功:', data);

      if (!data.url) {
        throw new Error('API 未回傳圖標 URL');
      }

      // 將 URL 加入緩存
      this.cache[file.name] = data.url;

      return {
        success: true,
        url: data.url
      };
    } catch (error) {
      console.error('上傳圖標時發生錯誤:', error);
      return {
        success: false,
        error: error.message || '上傳圖標失敗',
        details: error
      };
    }
  }

  /**
   * 檢查圖標 URL 是否有效
   * @param {string} iconValue - 圖標值，可能是 URL 或預設圖標名稱
   * @returns {boolean} - 如果是有效的圖標 URL 返回 true
   */
  isIconUrl(iconValue) {
    return (
      typeof iconValue === 'string' &&
      (iconValue.startsWith('http://') || iconValue.startsWith('https://'))
    );
  }

  /**
   * 從緩存中獲取圖標 URL
   * @param {string} fileName - 文件名
   * @returns {string|null} - 如果存在則返回 URL，否則返回 null
   */
  getCachedIconUrl(fileName) {
    return this.cache[fileName] || null;
  }
}

// 創建服務實例
const workflowAPIService = new WorkflowAPIService();
const llmService = new LLMService();
// 將 IconUploadService 添加到導出
const iconUploadService = new IconUploadService();

// 導出各種服務和工具類
export {
  WorkflowMappingService,
  WorkflowDataConverter,
  workflowAPIService,
  llmService,
  iconUploadService
};
