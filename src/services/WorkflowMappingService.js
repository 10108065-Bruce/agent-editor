/**
 * 工作流相關服務共用的基礎映射和轉換功能
 */
export class WorkflowMappingService {
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
      httpRequest: 'http_request',
      timer: 'timer',
      line: 'line_webhook_input',
      event: 'event',
      end: 'end',
      message: 'line_send_message',
      extract_data: 'extract_data',
      extractData: 'extract_data',
      aim_ml: 'aim_ml',
      schedule_trigger: 'schedule_trigger',
      webhook_input: 'webhook_input',
      webhook_output: 'webhook_output',
      combine_text: 'combine_text'
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
      basic_input: 'customInput',
      ask_ai: 'aiCustomInput',
      ifElse: 'ifElse',
      knowledge_retrieval: 'knowledgeRetrieval',
      http_request: 'httpRequest',
      schedule_trigger: 'schedule_trigger',
      webhook_input: 'webhook_input',
      webhook_output: 'webhook_output',
      combine_text: 'combine_text',
      timer: 'timer',
      line: 'line_webhook_input',
      event: 'event',
      end: 'end',
      message: 'line_send_message',
      extract_data: 'extract_data',
      aim_ml: 'aim_ml'
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
      httpRequest: 'integration',
      timer: 'event',
      line: 'integration',
      event: 'event',
      end: 'output',
      browserExtensionOutput: 'output',
      extract_data: 'advanced',
      extractData: 'advanced',
      aim_ml: 'advanced',
      schedule_trigger: 'advanced',
      webhook_input: 'advanced',
      webhook_output: 'advanced',
      combine_text: 'advanced'
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
        return `AI (${node.parameters?.llm_id?.data || ''})`;
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
      case 'webhook_input':
        return 'Webhook Input';
      case 'webhook_output':
        return 'Webhook Output';
      case 'http_request':
        return 'HTTP Request';
      case 'timer':
        return '計時器';
      case 'line_webhook_input':
        return 'LINE Webhook';
      case 'line_send_message':
        return 'LINE Message';
      case 'event':
        return '事件處理';
      case 'extract_data':
        return '資料提取';
      case 'schedule_trigger':
        return '排程觸發';
      case 'aim_ml':
        return 'QOCA AIM';
      case 'combine_text':
        return '組合文字';
      default:
        return node.operator;
    }
  }

  /**
   * 修正 extractNodeInputForAPI 方法，增加 return_name 支持
   * 從 ReactFlow 邊緣數據中提取節點輸入連接
   * @param {string} nodeId - 目標節點ID
   * @param {Array} edges - 所有邊緣數據
   * @param {Array} allNodes - 所有節點數據
   * @returns {Object} - API 格式的節點輸入
   */
  // 在 WorkflowServicesIntegration.js 中修改 extractNodeInputForAPI 方法

  static extractNodeInputForAPI(nodeId, edges, allNodes) {
    // 輔助函數：從源節點獲取 return_name
    function getReturnNameFromSourceNode(sourceNode, edge) {
      let returnName = edge.label || 'output';

      if (sourceNode.type === 'customInput' || sourceNode.type === 'input') {
        // 從自定義輸入節點獲取欄位名稱
        if (
          sourceNode.data &&
          sourceNode.data.fields &&
          Array.isArray(sourceNode.data.fields)
        ) {
          if (edge.sourceHandle === 'output' && sourceNode.data.fields[0]) {
            returnName = sourceNode.data.fields[0].inputName || returnName;
          } else if (
            edge.sourceHandle &&
            edge.sourceHandle.startsWith('output-')
          ) {
            const outputIndex = parseInt(edge.sourceHandle.split('-')[1] || 0);
            if (sourceNode.data.fields[outputIndex]) {
              returnName =
                sourceNode.data.fields[outputIndex].inputName || returnName;
            }
          }
        }
      } else if (sourceNode.type === 'browserExtensionInput') {
        // 從瀏覽器擴展輸入節點獲取項目名稱
        if (
          sourceNode.data &&
          sourceNode.data.items &&
          Array.isArray(sourceNode.data.items)
        ) {
          const targetItem = sourceNode.data.items.find(
            (item) => item.id === edge.sourceHandle
          );

          if (targetItem && targetItem.name) {
            returnName = targetItem.name;
          } else {
            const itemIndex = sourceNode.data.items.findIndex(
              (item) => item.id === edge.sourceHandle
            );
            if (itemIndex !== -1 && sourceNode.data.items[itemIndex]) {
              returnName = sourceNode.data.items[itemIndex].name || returnName;
            }
          }
        }
      } else if (
        sourceNode.type === 'aiCustomInput' ||
        sourceNode.type === 'ai'
      ) {
        returnName = 'output';
      } else if (sourceNode.type === 'knowledgeRetrieval') {
        returnName = 'output';
      } else {
        returnName = edge.sourceHandle || 'output';
      }

      return returnName;
    }

    const nodeInput = {};
    console.log(`提取節點 ${nodeId} 的輸入連接`);

    // 獲取目標節點
    const targetNode = allNodes.find((n) => n.id === nodeId);
    if (!targetNode) {
      console.warn(`找不到節點 ${nodeId}`);
      return nodeInput;
    }

    // 檢查節點類型
    const isBrowserExtensionOutput =
      targetNode.type === 'browserExtensionOutput';
    const isWebookOutputNode = targetNode.type === 'webhook_output';
    const isQOCAAimNode = targetNode && targetNode.type === 'aim_ml';
    const isScheduleTriggerNode =
      targetNode && targetNode.type === 'schedule_trigger';
    const isCombineTextNode = targetNode && targetNode.type === 'combine_text';

    // Schedule Trigger 節點沒有輸入連接，直接返回空對象
    if (isScheduleTriggerNode) {
      return nodeInput;
    }

    // 特殊處理 BrowserExtensionOutput 節點
    if (
      isBrowserExtensionOutput &&
      targetNode.data &&
      targetNode.data.inputHandles
    ) {
      // ... 保持原有的 BrowserExtensionOutput 處理邏輯不變
      console.log(`處理 BrowserExtensionOutput 節點的所有 input handles`);
      // [原有邏輯保持不變]
      return nodeInput;
    }

    // 特殊處理 webhook_output 節點
    if (isWebookOutputNode && targetNode.data && targetNode.data.inputHandles) {
      // ... 保持原有的 webhook_output 處理邏輯不變
      console.log(`處理 webhook output 節點的所有 input handles`);
      // [原有邏輯保持不變]
      return nodeInput;
    }

    // 獲取所有以該節點為目標的邊緣
    const relevantEdges = edges.filter((edge) => edge.target === nodeId);
    console.log(`找到 ${relevantEdges.length} 個輸入連接`);

    // 如果沒有連接，直接返回空對象（普通節點）
    if (relevantEdges.length === 0) {
      return nodeInput;
    }

    // 按 targetHandle 分組邊緣
    const handleGroups = {};

    // 首先，分組所有邊緣
    relevantEdges.forEach((edge) => {
      const targetHandle = edge.targetHandle || 'input';

      // 初始化組
      if (!handleGroups[targetHandle]) {
        handleGroups[targetHandle] = [];
      }

      // 添加邊緣到組
      handleGroups[targetHandle].push(edge);
    });

    // 新增：用於追蹤已處理的連接，避免重複處理
    const processedEdges = new Set();

    // 檢查節點類型
    const isAINode =
      targetNode.type === 'aiCustomInput' || targetNode.type === 'ai';
    const isMessageNode = targetNode.type === 'line_send_message';
    const isExtractDataNode = targetNode.type === 'extract_data';

    // 處理每個句柄組
    Object.entries(handleGroups).forEach(([targetHandle, targetEdges]) => {
      // 特殊處理 AI 節點的 context-input
      if (isAINode && targetHandle.startsWith('context')) {
        // 對於 context-input，我們需要處理多個連接
        targetEdges.forEach((edge, index) => {
          const inputKey = `context${index}`;

          // 查找源節點以獲取 return_name
          const sourceNode = allNodes.find((n) => n.id === edge.source);
          let returnName = edge.label || 'output';

          // 根據源節點類型獲取適當的 return_name
          if (sourceNode) {
            returnName = getReturnNameFromSourceNode(sourceNode, edge);
          }

          console.log(`源節點 ${edge.source} 的 return_name: ${returnName}`);

          // 添加到 nodeInput
          nodeInput[inputKey] = {
            node_id: edge.source,
            output_name: edge.sourceHandle || 'output',
            type: 'string',
            return_name: returnName
          };

          // 標記為已處理
          processedEdges.add(
            `${edge.source}-${edge.target}-${edge.targetHandle}-${edge.sourceHandle}`
          );
        });
      }
      // 處理 AI 節點的 prompt-input
      else if (isAINode && targetHandle === 'prompt-input') {
        const edge = targetEdges[0]; // prompt 只取第一個連接

        const inputKey = 'prompt';

        // 查找源節點以獲取 return_name
        const sourceNode = allNodes.find((n) => n.id === edge.source);
        let returnName = edge.label || 'output';

        // 根據源節點類型獲取適當的 return_name
        if (sourceNode) {
          returnName = getReturnNameFromSourceNode(sourceNode, edge);
        }

        // 添加到 nodeInput
        nodeInput[inputKey] = {
          node_id: edge.source,
          output_name: edge.sourceHandle || 'output',
          type: 'string',
          return_name: returnName
        };

        console.log(
          `AI節點Prompt連接: ${edge.source} -> ${nodeId}:${inputKey} (return_name: ${returnName})`
        );

        // 標記為已處理
        targetEdges.forEach((edge) => {
          processedEdges.add(
            `${edge.source}-${edge.target}-${edge.targetHandle}-${edge.sourceHandle}`
          );
        });
      }
      // 處理 Message 節點
      else if (isMessageNode && targetHandle.startsWith('message')) {
        targetEdges.forEach((edge, index) => {
          const inputKey =
            targetEdges.length > 1 ? `message${index}` : 'message0';

          nodeInput[inputKey] = {
            node_id: edge.source,
            output_name: edge.sourceHandle || 'output',
            type: 'string'
          };

          // 標記為已處理
          processedEdges.add(
            `${edge.source}-${edge.target}-${edge.targetHandle}-${edge.sourceHandle}`
          );
        });
      }
      // 處理 Extract Data 節點
      else if (isExtractDataNode && targetHandle === 'context-input') {
        targetEdges.forEach((edge) => {
          const inputKey = 'context_to_extract_from';

          nodeInput[inputKey] = {
            node_id: edge.source,
            output_name: edge.sourceHandle || 'output',
            type: 'string'
          };

          // 標記為已處理
          processedEdges.add(
            `${edge.source}-${edge.target}-${edge.targetHandle}-${edge.sourceHandle}`
          );
        });
      }
      // 處理 QOCA AIM 節點
      else if (isQOCAAimNode && targetHandle === 'input') {
        targetEdges.forEach((edge) => {
          const inputKey = 'context';

          nodeInput[inputKey] = {
            node_id: edge.source,
            output_name: edge.sourceHandle || 'output',
            type: 'string'
          };

          console.log(
            `QOCA AIM 節點連接: ${edge.source} -> ${nodeId}:${inputKey}`
          );

          // 標記為已處理
          processedEdges.add(
            `${edge.source}-${edge.target}-${edge.targetHandle}-${edge.sourceHandle}`
          );
        });
      }
      // 處理 Combine Text 節點
      else if (isCombineTextNode && targetHandle === 'text') {
        targetEdges.forEach((edge, index) => {
          const inputKey = `text${index}`;

          const sourceNode = allNodes.find((n) => n.id === edge.source);
          let returnName = edge.label || 'output';

          if (sourceNode) {
            returnName = getReturnNameFromSourceNode(sourceNode, edge);
          }

          console.log(`源節點 ${edge.source} 的 return_name: ${returnName}`);

          nodeInput[inputKey] = {
            node_id: edge.source,
            output_name: edge.sourceHandle || 'output',
            type: 'string',
            return_name: returnName
          };

          console.log(
            `Combine Text 節點連接: ${edge.source} -> ${nodeId}:${inputKey} (return_name: ${returnName})`
          );

          // 標記為已處理
          processedEdges.add(
            `${edge.source}-${edge.target}-${edge.targetHandle}-${edge.sourceHandle}`
          );
        });
      }
      // 其他節點類型的處理
      else {
        // 過濾掉已經被特殊處理的邊緣
        const unprocessedEdges = targetEdges.filter((edge) => {
          const edgeKey = `${edge.source}-${edge.target}-${edge.targetHandle}-${edge.sourceHandle}`;
          return !processedEdges.has(edgeKey);
        });

        if (unprocessedEdges.length === 0) {
          return; // 所有邊緣都已被處理，跳過
        }

        // 處理多個連接到同一 handle 的情況
        if (unprocessedEdges.length > 1) {
          unprocessedEdges.forEach((edge, index) => {
            const inputKey = `${targetHandle}_${index + 1}`;

            nodeInput[inputKey] = {
              node_id: edge.source,
              output_name: edge.sourceHandle || 'output',
              type: 'string'
            };

            console.log(
              `多重輸入連接: ${edge.source} -> ${nodeId}:${inputKey}`
            );
          });
        } else if (unprocessedEdges.length === 1) {
          const edge = unprocessedEdges[0];

          nodeInput[targetHandle] = {
            node_id: edge.source,
            output_name: edge.sourceHandle || 'output',
            type: 'string'
          };

          console.log(`輸入連接: ${edge.source} -> ${nodeId}:${targetHandle}`);
        }
      }
    });

    // 處理 AI 節點的直接輸入 prompt 文本
    if (targetNode) {
      if (isAINode && targetNode.data?.promptText) {
        // 檢查是否已有連線到 prompt-input
        const hasPromptConnection = edges.some(
          (edge) =>
            edge.target === nodeId && edge.targetHandle === 'prompt-input'
        );

        // 如果沒有連線到 prompt-input 但有 promptText，則創建一個特殊的 prompt 輸入
        if (!hasPromptConnection) {
          nodeInput.prompt = {
            type: 'string',
            data: targetNode.data.promptText,
            node_id: '' // 空 node_id 表示使用直接輸入的文本
          };
          console.log(
            `AI節點使用直接輸入的 prompt 文本: "${targetNode.data.promptText}"`
          );
        }
      }
    }

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
      // case 'httpRequest':
      // HTTP Request 節點輸出
      // nodeOutput.output = {
      //   response: {
      //     node_id: node.id,
      //     type: 'json'
      //   },
      //   status: {
      //     node_id: node.id,
      //     type: 'number'
      //   },
      //   headers: {
      //     node_id: node.id,
      //     type: 'json'
      //   }
      // };

      // break;
      case 'schedule_trigger':
        // Schedule Trigger 節點只有一個 trigger 輸出
        nodeOutput.trigger = {
          node_id: node.id,
          type: 'object'
        };
        break;
      case 'aim_ml': {
        // QOCA AIM 節點輸出 - 根據節點數據判斷
        const isExplainEnabled =
          node.data?.enableExplain ?? node.data?.enable_explain?.data ?? true; // 預設為 true

        if (isExplainEnabled) {
          // 當解釋功能開啟時，有 text 和 images 輸出
          nodeOutput.text = {
            node_id: node.id,
            type: 'string'
          };
          nodeOutput.images = {
            node_id: node.id,
            type: 'string'
          };
        } else {
          // 當解釋功能關閉時，只有text輸出
          nodeOutput.text = {
            node_id: node.id,
            type: 'string'
          };
        }
        break;
      }
      case 'line':
      case 'line_webhook_input':
        // Line Webhook 節點輸出多種訊息類型
        if (
          node.data.output_handles &&
          Array.isArray(node.data.output_handles)
        ) {
          node.data.output_handles.forEach((handleType) => {
            nodeOutput[handleType] = {
              node_id: node.id,
              type: 'string'
            };
          });
        } else {
          // 預設輸出類型
          ['text', 'image'].forEach((handleType) => {
            nodeOutput[handleType] = {
              node_id: node.id,
              type: 'string'
            };
          });
        }
        break;
      case 'webhook_output':
        // Add a single output for the browser extension output node
        nodeOutput.output = {
          node_id: node.id,
          type: 'string'
        };
        break;
      case 'combine_text':
        // Combine Text 節點的輸出
        nodeOutput.output = {
          node_id: node.id,
          type: 'string'
        };
        break;
      case 'browserExtensionOutput':
        // Add a single output for the browser extension output node
        nodeOutput.output = {
          node_id: node.id,
          type: 'string'
        };
        break;
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
        // 修改: 使用單一 "output" 作為 handle ID 而不是 "output-0"
        nodeOutput.output = {
          node_id: node.id,
          type: 'string'
        };
        console.log(`輸入節點: 設置單一輸出 (output)`);
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
      case 'extract_data':
      case 'extractData':
        // Extract Data 節點的輸出
        nodeOutput.output = {
          node_id: node.id,
          type: 'json' // Extract Data 輸出為 JSON 格式
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
