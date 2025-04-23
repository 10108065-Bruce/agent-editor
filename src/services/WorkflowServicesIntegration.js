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
   * 提取節點輸入以供 API 格式使用
   * @param {string} nodeId - 節點 ID
   * @param {Array} edges - 所有邊緣
   * @returns {Object} - API 格式的節點輸入
   */
  static extractNodeInputForAPI(nodeId, edges) {
    const nodeInput = {};
    console.log(`提取節點 ${nodeId} 的輸入連接`);

    const relevantEdges = edges.filter((edge) => edge.target === nodeId);
    console.log(`找到 ${relevantEdges.length} 個輸入連接`);

    relevantEdges.forEach((edge) => {
      const targetHandle = edge.targetHandle || 'input';
      nodeInput[targetHandle] = {
        node_id: edge.source,
        output_name: edge.sourceHandle || 'output',
        type: 'string' // 預設類型
      };
      console.log(`輸入連接: ${edge.source} -> ${nodeId}:${targetHandle}`);
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
   * 保存工作流數據
   * @param {Object} data - 要保存的工作流數據
   * @returns {Promise<Object>} API 回應
   */
  async saveWorkflow(data) {
    console.log('開始保存工作流:', data.flow_name);

    try {
      const response = await fetch(
        `${this.baseUrl}/agent_designer/workflows/save`,
        {
          method: 'POST',
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            flow_name: data.flow_name,
            content: data.content
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('工作流保存成功');
      return responseData;
    } catch (error) {
      console.error('保存工作流失敗:', error);
      throw error;
    }
  }
}

/**
 * LLM模型服務 - 處理與LLM模型相關的API請求
 */
class LLMService {
  constructor() {
    this.baseUrl = 'https://api-dev.qoca-apa.quanta-research.com/v1';
    this.modelsCache = null;
    this.lastFetchTime = null;
    this.cacheExpiryTime = 10 * 60 * 1000; // 10分鐘cache過期
    this.pendingRequest = null; // 用於追蹤進行中的請求
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
          console.log('成功獲取LLM模型:', data);

          // 更新快取
          this.modelsCache = data;
          this.lastFetchTime = now;
          this.pendingRequest = null; // 清除進行中的請求

          return data;
        })
        .catch((error) => {
          console.error('獲取LLM模型失敗:', error);
          this.pendingRequest = null; // 清除進行中的請求，即使出錯
          throw error;
        });

      return this.pendingRequest;
    } catch (error) {
      console.error('獲取LLM模型過程中出錯:', error);
      this.pendingRequest = null;
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

      // 將API返回的模型數據轉換為select選項格式
      return models.map((model) => ({
        value: model.name,
        label: model.display_name || model.name,
        description: model.description,
        isDefault: model.is_default
      }));
    } catch (error) {
      console.error('獲取模型選項失敗:', error);
      // 返回一些默認選項，以防API失敗
      return [
        { value: 'O3-mini', label: 'O3-mini' },
        { value: 'O3-plus', label: 'O3-plus' },
        { value: 'O3-mega', label: 'O3-mega' },
        { value: 'O3-ultra', label: 'O3-ultra' }
      ];
    }
  }

  /**
   * 預加載模型數據，通常在應用啟動時呼叫
   */
  preloadModels() {
    console.log('預加載LLM模型列表');
    this.getModels().catch((err) => {
      console.log('預加載模型失敗:', err);
    });
  }
}

/**
 * 更新後的工作流數據轉換器，使用共用的映射功能
 */
class WorkflowDataConverter {
  /**
   * 轉換 API 數據為 ReactFlow 格式
   * @param {Object} apiData - API 回傳的原始數據
   * @returns {Object} - 包含 nodes 和 edges 的 ReactFlow 格式數據
   */
  static transformToReactFlowFormat(apiData) {
    console.log('開始轉換 API 格式為 ReactFlow 格式');

    // 處理 API 數據結構差異
    const flowPipeline =
      apiData.flow_pipeline ||
      (apiData.content ? apiData.content.flow_pipeline : []);

    if (!flowPipeline || !Array.isArray(flowPipeline)) {
      console.error('找不到有效的 flow_pipeline 陣列');
      return { nodes: [], edges: [] };
    }

    const nodes = [];
    const edges = [];

    // 處理每個節點
    flowPipeline.forEach((node) => {
      console.log(`處理節點 ${node.id}, 操作符: ${node.operator}`);

      // 轉換為 ReactFlow 節點格式
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

      // 處理節點之間的連接
      if (node.node_input) {
        Object.entries(node.node_input).forEach(([inputKey, inputValue]) => {
          if (inputValue && inputValue.node_id) {
            const edgeId = `${inputValue.node_id}-${node.id}-${inputKey}`;

            edges.push({
              id: edgeId,
              source: inputValue.node_id,
              sourceHandle: inputValue.output_name || null,
              target: node.id,
              targetHandle: inputKey,
              type: 'custom-edge'
            });
          }
        });
      }
    });

    // 自動布局（如果位置都是 0,0）
    this.autoLayout(nodes);

    console.log(`轉換完成: ${nodes.length} 個節點, ${edges.length} 個連接`);
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

      case 'ask_ai':
        return {
          ...baseData,
          model: node.parameters?.model?.data || 'O3-mini',
          selectedOption: node.parameters?.selected_option?.data || 'prompt'
        };

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
      content: {
        flow_id: reactFlowData.id || `flow_${Date.now()}`,
        user_id: reactFlowData.userId || '1',
        flow_type: 'NORMAL',
        headers: reactFlowData.headers || {
          Authorization: 'Bearer your-token-here',
          'Content-Type': 'application/json'
        },
        flow_pipeline: flowPipeline
      }
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
      case 'ai':
        parameters.model = { data: node.data.model || 'O3-mini' };
        if (node.data.selectedOption) {
          parameters.selected_option = { data: node.data.selectedOption };
        }
        break;

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

// 創建服務實例
const workflowAPIService = new WorkflowAPIService();
const llmService = new LLMService();

// 導出各種服務和工具類
export {
  WorkflowMappingService,
  WorkflowDataConverter,
  workflowAPIService,
  llmService
};
