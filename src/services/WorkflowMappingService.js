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
  static extractNodeInputForAPI(nodeId, edges, allNodes) {
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
    const isAINode =
      targetNode.type === 'aiCustomInput' || targetNode.type === 'ai';
    const isMessageNode = targetNode.type === 'line_send_message';
    const isExtractDataNode = targetNode.type === 'extract_data';

    // Schedule Trigger 節點沒有輸入連接，直接返回空對象
    if (isScheduleTriggerNode) {
      return nodeInput;
    }

    // 特殊處理 BrowserExtensionOutput 節點，確保所有 inputHandles 都被保留
    if (
      isBrowserExtensionOutput &&
      targetNode.data &&
      targetNode.data.inputHandles
    ) {
      console.log(`處理 BrowserExtensionOutput 節點的所有 input handles`);

      // 保存原始的 node_input 資訊
      const originalNodeInput = targetNode.data.node_input || {};

      // 保存原始的 handleLabels 狀態，用於映射 handle ID
      const handleLabels = {};

      // 首先檢查 node_input 中是否存在 return_name
      Object.entries(originalNodeInput).forEach(([key, value]) => {
        if (value && value.return_name) {
          // 使用 processHandleId 或等效邏輯轉換 handle ID
          const baseHandleId = key.split('_')[0];
          handleLabels[baseHandleId] = value.return_name;
          console.log(
            `從 node_input 讀取標籤: ${baseHandleId} => ${value.return_name}`
          );
        }
      });

      // 還原 input 到 output0 的映射 (處理第一個預設 handle 的情況)
      if (
        originalNodeInput.input &&
        originalNodeInput.input.return_name &&
        !handleLabels.output0
      ) {
        handleLabels.output0 = originalNodeInput.input.return_name;
        console.log(
          `特殊處理: 將 input.return_name (${originalNodeInput.input.return_name}) 映射到 output0`
        );
      }

      // 查找所有連線到此節點的邊
      const relevantEdges = edges.filter((edge) => edge.target === nodeId);

      // 按基本 handle 分組
      const handleGroups = {};
      relevantEdges.forEach((edge) => {
        // 確保有效的 targetHandle
        if (!edge.targetHandle) {
          console.warn(`邊緣 ${edge.id} 沒有有效的 targetHandle，跳過`);
          return;
        }

        const baseHandle = edge.targetHandle.split('_')[0];
        if (!handleGroups[baseHandle]) {
          handleGroups[baseHandle] = [];
        }
        handleGroups[baseHandle].push(edge);
      });

      // 遍歷所有基本 handle
      Object.keys(handleGroups).forEach((baseHandle) => {
        const groupEdges = handleGroups[baseHandle];

        if (groupEdges.length > 1) {
          // 多連線情況
          groupEdges.forEach((edge, index) => {
            const inputKey = `${baseHandle}_${index + 1}`;

            // 使用保存的標籤或原始的 return_name 或預設值
            let returnName = handleLabels[baseHandle] || 'output';

            console.log(`多連線 Handle ${inputKey} 使用標籤值: ${returnName}`);

            nodeInput[inputKey] = {
              node_id: edge.source,
              output_name: edge.sourceHandle || 'output',
              type: 'string',
              return_name: returnName
            };

            console.log(
              `多連線 Handle: ${edge.source} -> ${nodeId}:${inputKey} (return_name: ${returnName})`
            );
          });
        } else {
          // 單一連線情況
          const edge = groupEdges[0];

          // 使用保存的標籤或預設值
          let returnName = handleLabels[baseHandle] || 'output';

          console.log(
            `單一連線 Handle ${baseHandle} 使用標籤值: ${returnName}`
          );

          nodeInput[baseHandle] = {
            node_id: edge.source,
            output_name: edge.sourceHandle || 'output',
            type: 'string',
            return_name: returnName
          };

          console.log(
            `單一連線 Handle: ${edge.source} -> ${nodeId}:${baseHandle} (return_name: ${returnName})`
          );
        }
      });

      // 處理未連線的 handle
      targetNode.data.inputHandles
        .filter((handle) => !handleGroups[handle.id])
        .forEach((handle) => {
          const baseHandleId = handle.id;

          // 使用保存的標籤或空字串
          let returnName = handleLabels[baseHandleId] || '';

          console.log(
            `未連線 Handle ${baseHandleId} 使用標籤值: ${returnName}`
          );

          nodeInput[baseHandleId] = {
            node_id: '',
            output_name: '',
            type: 'string',
            data: '',
            is_empty: true,
            return_name: returnName
          };

          console.log(
            `保留未連線的 handle: ${baseHandleId} (return_name: ${returnName})`
          );
        });

      return nodeInput;
    }

    // 特殊處理 webhook_output 節點
    if (isWebookOutputNode && targetNode.data && targetNode.data.inputHandles) {
      console.log(`處理 webhook output 節點的所有 input handles`);

      // 保存原始的 node_input 資訊
      const originalNodeInput = targetNode.data.node_input || {};

      // 保存原始的 handleLabels 狀態，用於映射 handle ID
      const handleLabels = {};

      // 首先檢查 node_input 中是否存在 return_name
      Object.entries(originalNodeInput).forEach(([key, value]) => {
        if (value && value.return_name) {
          // 使用 processHandleId 或等效邏輯轉換 handle ID
          const baseHandleId = key.split('_')[0]; // 簡化版的 processHandleId
          handleLabels[baseHandleId] = value.return_name;
        }
      });

      // 還原 input 到 text0 的映射 (處理第一個預設 handle 的情況)
      if (
        originalNodeInput.input &&
        originalNodeInput.input.return_name &&
        !handleLabels.text0
      ) {
        handleLabels.text0 = originalNodeInput.input.return_name;
      }

      // 查找所有連線到此節點的邊
      const relevantEdges = edges.filter((edge) => edge.target === nodeId);

      // 按基本 handle 分組
      const handleGroups = {};
      relevantEdges.forEach((edge) => {
        // 確保有效的 targetHandle
        if (!edge.targetHandle) {
          console.warn(`邊緣 ${edge.id} 沒有有效的 targetHandle，跳過`);
          return;
        }

        const baseHandle = edge.targetHandle.split('_')[0];
        if (!handleGroups[baseHandle]) {
          handleGroups[baseHandle] = [];
        }
        handleGroups[baseHandle].push(edge);
      });

      // 遍歷所有基本 handle
      Object.keys(handleGroups).forEach((baseHandle) => {
        const groupEdges = handleGroups[baseHandle];

        if (groupEdges.length > 1) {
          // 多連線情況
          groupEdges.forEach((edge, index) => {
            const inputKey = `${baseHandle}_${index + 1}`;

            // 使用保存的標籤或原始的 return_name 或預設值
            let returnName = handleLabels[baseHandle] || '';

            nodeInput[inputKey] = {
              node_id: edge.source,
              output_name: edge.sourceHandle || 'output',
              type: 'string',
              return_name: returnName
            };
          });
        } else {
          // 單一連線情況
          const edge = groupEdges[0];

          // 使用保存的標籤或預設值
          let returnName = handleLabels[baseHandle] || '';

          nodeInput[baseHandle] = {
            node_id: edge.source,
            output_name: edge.sourceHandle || 'output',
            type: 'string',
            return_name: returnName
          };
        }
      });

      // 處理未連線的 handle
      targetNode.data.inputHandles
        .filter((handle) => !handleGroups[handle.id])
        .forEach((handle) => {
          const baseHandleId = handle.id;

          // 使用保存的標籤或空字串
          let returnName = handleLabels[baseHandleId] || '';

          console.log(
            `未連線 Handle ${baseHandleId} 使用標籤值: ${returnName}`
          );

          nodeInput[baseHandleId] = {
            node_id: '',
            output_name: '',
            type: 'string',
            data: '',
            is_empty: true,
            return_name: returnName
          };
        });

      return nodeInput;
    }

    // 獲取所有以該節點為目標的邊緣
    const relevantEdges = edges.filter((edge) => edge.target === nodeId);

    // 如果沒有連接，處理特殊情況
    if (relevantEdges.length === 0) {
      // 對於 AI 節點，仍需檢查是否有直接輸入的 promptText
      if (isAINode && targetNode.data?.promptText) {
        nodeInput.prompt = {
          type: 'string',
          data: targetNode.data.promptText,
          node_id: ''
        };
      }
      return nodeInput;
    }

    // AI 節點的特殊處理邏輯 ===
    if (isAINode) {
      // 分別收集 context 和 prompt 連線
      const contextEdges = [];
      const promptEdges = [];

      relevantEdges.forEach((edge) => {
        const targetHandle = edge.targetHandle || 'input';

        // 檢查是否為 context 相關的 handle
        if (
          targetHandle === 'context-input' ||
          targetHandle.startsWith('context-input_') ||
          targetHandle.startsWith('context')
        ) {
          contextEdges.push(edge);
        }
        // 檢查是否為 prompt 相關的 handle
        else if (
          targetHandle === 'prompt-input' ||
          targetHandle.startsWith('prompt-input_') ||
          targetHandle.startsWith('prompt')
        ) {
          promptEdges.push(edge);
        }
      });

      // 處理 context 連線 - 統一使用 context0, context1, context2 格式
      contextEdges.forEach((edge, index) => {
        const inputKey = `context${index}`;

        // 查找源節點以獲取 return_name
        const returnName = WorkflowMappingService.getReturnNameFromSourceNode(
          edge,
          allNodes
        );

        // 添加到 nodeInput
        nodeInput[inputKey] = {
          node_id: edge.source,
          output_name: edge.sourceHandle || 'output',
          type: 'string',
          return_name: returnName
        };
      });

      // 處理 prompt 連線 - 只使用 "prompt" 作為 key
      if (promptEdges.length > 0) {
        const edge = promptEdges[0]; // 只取第一個連接，因為 prompt 只能有一個
        const inputKey = 'prompt';

        // 查找源節點以獲取 return_name
        const returnName = WorkflowMappingService.getReturnNameFromSourceNode(
          edge,
          allNodes
        );

        nodeInput[inputKey] = {
          node_id: edge.source,
          output_name: edge.sourceHandle || 'output',
          type: 'string',
          return_name: returnName
        };
      }

      // 檢查是否有直接輸入的 promptText（當沒有 prompt 連線時）
      if (targetNode.data?.promptText && promptEdges.length === 0) {
        nodeInput.prompt = {
          type: 'string',
          data: targetNode.data.promptText,
          node_id: '' // 空 node_id 表示使用直接輸入的文本
        };
      }

      return nodeInput;
    }

    // Combine Text 節點的特殊處理邏輯
    if (isCombineTextNode && targetNode.data) {
      // 獲取原始的 node_input 資訊（如果存在）
      const originalNodeInput = targetNode.data.node_input || {};
      console.log('原始 node_input:', originalNodeInput);

      // 建立現有連線的映射，保持原有的索引
      const existingConnections = new Map();
      Object.entries(originalNodeInput).forEach(([key, value]) => {
        if (key.startsWith('text') && value.node_id) {
          existingConnections.set(value.node_id, {
            key,
            value,
            index: parseInt(key.replace('text', '')) || 0
          });
        }
      });

      const sortedEdges = relevantEdges.sort((a, b) => {
        const aExisting = existingConnections.get(a.source);
        const bExisting = existingConnections.get(b.source);

        if (aExisting && bExisting) {
          // 兩個都是已存在的連線，按原有索引排序
          return aExisting.index - bExisting.index;
        } else if (aExisting) {
          // a 是已存在的連線，排在前面
          return -1;
        } else if (bExisting) {
          // b 是已存在的連線，排在前面
          return 1;
        } else {
          // 兩個都是新連線，按節點 ID 字母順序排序
          return a.source.localeCompare(b.source);
        }
      });

      // 追蹤已使用的索引
      const usedIndices = new Set();

      // 分配輸入鍵
      sortedEdges.forEach((edge) => {
        // 檢查是否是已存在的連線
        const existingConnection = existingConnections.get(edge.source);
        let inputKey;

        if (existingConnection) {
          // 使用原有的鍵
          inputKey = existingConnection.key;
          usedIndices.add(existingConnection.index);
          console.log(`保持原有連線: ${edge.source} -> ${inputKey}`);
        } else {
          // 為新連線分配新的索引
          let newIndex = 0;
          while (usedIndices.has(newIndex)) {
            newIndex++;
          }
          inputKey = `text${newIndex}`;
          usedIndices.add(newIndex);
          console.log(`新連線分配索引: ${edge.source} -> ${inputKey}`);
        }

        // 查找源節點以獲取 return_name
        const returnName = WorkflowMappingService.getReturnNameFromSourceNode(
          edge,
          allNodes
        );

        // 添加到 nodeInput
        nodeInput[inputKey] = {
          node_id: edge.source,
          output_name: edge.sourceHandle || 'output',
          type: 'string',
          return_name: returnName
        };
      });

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

    // 處理每個句柄組 - 保持原始處理邏輯不變
    Object.entries(handleGroups).forEach(([targetHandle, targetEdges]) => {
      // 特殊處理 Message 節點的多個連接
      if (isMessageNode && targetHandle.startsWith('message')) {
        // 處理 Message 節點的多個連接，參考 AI 節點的 context 處理方式
        targetEdges.forEach((edge, index) => {
          // 對於多個連接到同一個 message handle，創建 message0, message1, message2 等輸入鍵
          const inputKey =
            targetEdges.length > 1 ? `message${index}` : 'message0';

          // 添加到 nodeInput
          nodeInput[inputKey] = {
            node_id: edge.source,
            output_name: edge.sourceHandle || 'output',
            type: 'string'
          };
        });
      } else if (isExtractDataNode && targetHandle === 'context-input') {
        // 處理 Extract Data 節點的輸入
        targetEdges.forEach((edge) => {
          const inputKey = 'context_to_extract_from';

          // 添加到 nodeInput
          nodeInput[inputKey] = {
            node_id: edge.source,
            output_name: edge.sourceHandle || 'output',
            type: 'string'
          };
        });
      } else if (isQOCAAimNode && targetHandle === 'input') {
        // 處理 QOCA AIM 節點的輸入
        targetEdges.forEach((edge) => {
          const inputKey = 'context';

          // 添加到 nodeInput，只儲存 node_id，不帶其他參數
          nodeInput[inputKey] = {
            node_id: edge.source,
            output_name: edge.sourceHandle || 'output',
            type: 'string'
          };
        });
      }
      // 其他節點類型的處理...
      else {
        // 處理多個連接到同一 handle 的情況
        if (targetEdges.length > 1) {
          targetEdges.forEach((edge, index) => {
            // 創建唯一的輸入鍵
            const inputKey = `${targetHandle}_${index + 1}`;

            // 添加到 nodeInput
            nodeInput[inputKey] = {
              node_id: edge.source,
              output_name: edge.sourceHandle || 'output',
              type: 'string'
            };

            console.log(
              `多重輸入連接: ${edge.source} -> ${nodeId}:${inputKey}`
            );
          });
        } else if (targetEdges.length === 1) {
          // 單一連接，直接使用原始句柄
          const edge = targetEdges[0];

          nodeInput[targetHandle] = {
            node_id: edge.source,
            output_name: edge.sourceHandle || 'output',
            type: 'string'
          };

          console.log(`輸入連接: ${edge.source} -> ${nodeId}:${targetHandle}`);
        }
      }
    });

    return nodeInput;
  }

  /**
   * 輔助函數：從源節點獲取 return_name
   * @param {Object} edge - 邊緣對象
   * @param {Array} allNodes - 所有節點數組
   * @returns {string} - return_name 值
   */
  static getReturnNameFromSourceNode(edge, allNodes) {
    const sourceNode = allNodes.find((n) => n.id === edge.source);
    let returnName = edge.label || 'output';

    if (sourceNode) {
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
    }

    return returnName;
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
