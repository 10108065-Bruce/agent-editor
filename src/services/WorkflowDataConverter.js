import { WorkflowMappingService } from './WorkflowMappingService';

/**
 * 更新後的工作流數據轉換器，使用共用的映射功能
 */
export class WorkflowDataConverter {
  // 修改 transformToReactFlowFormat 方法，確保連線正確處理
  static transformToReactFlowFormat(apiData) {
    console.log('開始轉換 API 格式為 ReactFlow 格式', apiData);

    // 處理 API 數據結構差異
    const flowPipeline =
      apiData.flow_pipeline ||
      (apiData.content ? apiData.content.flow_pipeline : []);

    if (!flowPipeline || !Array.isArray(flowPipeline)) {
      console.error('找不到有效的 flow_pipeline 數組');
      return { nodes: [], edges: [] };
    }

    const nodes = [];
    const edges = [];

    // 首先處理所有節點，確保在創建邊緣之前節點已存在
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

      // 特殊處理 BrowserExtensionOutput 節點
      // 在 transformToReactFlowFormat 方法中的 BrowserExtensionOutput 節點處理邏輯
      if (node.operator === 'browser_extension_output') {
        console.log(`特殊處理 BrowserExtensionOutput 節點: ${node.id}`);

        // 從 node_input 提取所有 handle
        const inputHandles = [];
        const handleMap = new Map(); // 用於記錄真實的 handle ID

        if (node.node_input && typeof node.node_input === 'object') {
          // 直接使用全部 handle ID
          const handlePattern = /^(output\d+)(?:_\d+)?$/;
          Object.keys(node.node_input).forEach((key) => {
            const match = key.match(handlePattern);
            if (match && match[1]) {
              const baseHandleId = match[1]; // 提取基本 handle ID (如 output0)

              // 如果這個基本 handle ID 還沒被加入，則添加
              if (!handleMap.has(baseHandleId)) {
                handleMap.set(baseHandleId, true);
                inputHandles.push({ id: baseHandleId });
                console.log(
                  `從 node_input 提取基本 handle ID: ${baseHandleId}`
                );
              }
            } else {
              // 非標準格式的 handle ID 直接添加
              inputHandles.push({ id: key });
              console.log(`從 node_input 提取非標準 handle ID: ${key}`);
            }
          });
        }

        // 檢查是否有從參數中保存的 inputHandles
        if (
          node.parameters &&
          node.parameters.inputHandles &&
          node.parameters.inputHandles.data
        ) {
          const savedHandles = node.parameters.inputHandles.data;
          if (Array.isArray(savedHandles)) {
            savedHandles.forEach((handleId) => {
              if (!inputHandles.some((h) => h.id === handleId)) {
                inputHandles.push({ id: handleId });
                console.log(`從 parameters 提取 handle: ${handleId}`);
              }
            });
          }
        }

        // 確保至少有一個默認 handle
        if (inputHandles.length === 0) {
          inputHandles.push({ id: 'output0' });
          console.log(`添加默認 handle: output0`);
        }

        // 設置節點數據
        reactFlowNode.data.inputHandles = inputHandles;
      }

      nodes.push(reactFlowNode);
    });

    // 處理連接關係
    flowPipeline.forEach((node) => {
      // 檢查節點類型
      const isAINode = node.operator === 'ask_ai';
      const isKnowledgeNode = node.operator === 'knowledge_retrieval';
      const isMessageNode = node.operator === 'line_send_message';
      const isExtractDataNode = node.operator === 'extract_data';
      const isQOCAAimNode = node.operator === 'aim_ml';
      // 處理節點之間的連接
      if (node.node_input && Object.keys(node.node_input).length > 0) {
        console.log(`處理節點 ${node.id} 的輸入連接:`, node.node_input);

        // 如果是 AI 節點，檢查是否有直接輸入的提示文本
        if (isAINode) {
          const promptInput = node.node_input.prompt;
          if (promptInput && promptInput.node_id === '') {
            // 找到對應的 ReactFlow 節點
            const reactFlowNode = nodes.find((n) => n.id === node.id);
            if (reactFlowNode) {
              // 設置直接輸入的 promptText
              reactFlowNode.data.promptText = promptInput.data || '';
              console.log(
                `設置AI節點直接輸入的提示文本: "${promptInput.data}"`
              );
            }
          }
        }

        // 創建連接 - 忽略標記為 is_empty 的空連接
        Object.entries(node.node_input).forEach(([inputKey, inputValue]) => {
          // 跳過直接輸入的提示文本，已在上面處理
          if (inputKey === 'prompt' && inputValue.node_id === '') {
            return;
          }

          // 跳過空連接（沒有源節點）
          if (!inputValue.node_id || inputValue.is_empty === true) {
            console.log(`跳過空連接: ${node.id}:${inputKey}`);
            return;
          }

          // 為不同類型的節點處理特殊的 targetHandle
          let targetHandle = inputKey;
          // 對於 BrowserExtensionOutput，處理多連線格式
          if (node.operator === 'browser_extension_output') {
            const match = inputKey.match(/^(output\d+)(?:_\d+)?$/);
            if (match && match[1]) {
              targetHandle = match[1]; // 使用基本 handle ID
            }
          }
          // AI 節點特殊處理
          if (isAINode) {
            // 處理 context 相關的輸入鍵
            if (inputKey.startsWith('context')) {
              targetHandle = 'context-input';
            }
            // 處理 prompt 相關的輸入鍵
            else if (inputKey === 'prompt' || inputKey === 'prompt-input') {
              targetHandle = 'prompt-input';
            }
          }
          // 知識檢索節點特殊處理
          else if (isKnowledgeNode) {
            // 統一使用 passage 作為目標 handle
            if (inputKey === 'passage' || inputKey === 'input') {
              targetHandle = 'passage';
            }
          } else if (isMessageNode) {
            // 對於消息節點，統一使用 message 作為目標 handle
            if (inputKey.startsWith('message') || inputKey === 'input') {
              targetHandle = 'message';
            }
          } else if (isExtractDataNode) {
            // 對於 Extract Data 節點，統一使用 context-input 作為目標 handle
            if (
              inputKey === 'context_to_extract_from' ||
              inputKey === 'input'
            ) {
              targetHandle = 'context-input';
            }
          } else if (isQOCAAimNode) {
            // 對於 QOCA AIM 節點，處理輸入連接
            if (inputKey === 'input_data' || inputKey === 'input') {
              targetHandle = 'input';
            }
          }

          // 為每個邊緣創建一個唯一的 ID
          const edgeId = `${inputValue.node_id}-${node.id}-${inputKey}-${
            inputValue.output_name || 'output'
          }`;

          console.log(
            `創建連接: ${edgeId}, 從 ${inputValue.node_id} 到 ${node.id}:${targetHandle}`
          );

          // 確認目標節點存在
          const targetNode = nodes.find((n) => n.id === node.id);
          if (!targetNode) {
            console.warn(`找不到目標節點 ${node.id}，跳過邊緣創建`);
            return;
          }

          // 創建邊緣，添加 return_name 支持
          const edge = {
            id: edgeId,
            source: inputValue.node_id,
            sourceHandle: inputValue.output_name || 'output',
            target: node.id,
            targetHandle: targetHandle,
            type: 'custom-edge'
          };

          // 如果有 return_name 屬性，添加為標籤
          if (inputValue.return_name) {
            edge.label = inputValue.return_name;
            console.log(
              `邊緣 ${edgeId} 添加 return_name: ${inputValue.return_name}`
            );
          }

          // 記錄詳細信息，幫助除錯
          console.log('創建的邊緣詳情:', {
            id: edge.id,
            source: edge.source,
            target: edge.target,
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle,
            label: edge.label
          });

          edges.push(edge);
        });
      }
    });

    console.log(`轉換完成: ${nodes.length} 個節點, ${edges.length} 個連接`);

    // 自動布局（如果位置都是 0,0）
    this.autoLayout(nodes);

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

    if (node.operator === 'browser_extension_output') {
      baseData.onAddOutput = (newInputHandles) => {
        // 類似於 handleAddBrowserExtensionOutput 中的邏輯
        console.log(`更新節點的 handle：`, newInputHandles);
        // 實現更新邏輯
      };

      baseData.onRemoveHandle = (handleId) => {
        // 實現移除 handle 的邏輯
        console.log(`準備移除 handle：${handleId}`);
      };
    }

    // 根據節點類型轉換參數
    switch (node.operator) {
      case 'extract_data': {
        // Extract Data 節點的數據轉換
        const columnsData = node.parameters?.columns?.data || [];
        const columns = Array.isArray(columnsData) ? columnsData : [];

        return {
          ...baseData,
          model: node.parameters?.llm_id?.data?.toString() || '1',
          columns: columns
        };
      }
      case 'line_webhook_input':
        console.log('處理 line 節點數據轉換:', node);
        return {
          ...baseData,
          external_service_config_id:
            node.parameters?.external_service_config_id?.data || '',
          webhook_url: node.parameters?.webhook_url?.data || '',
          // 從 node_output 推斷輸出 handles
          output_handles: node.node_output
            ? Object.keys(node.node_output).filter((key) => key !== 'node_id')
            : ['text', 'image']
        };
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

      case 'browser_extension_output': {
        // 從 node_input 提取 handle，但只有在有連線時才提取
        let inputHandles = [];

        // 檢查是否有 node_input 數據
        if (
          node.node_input &&
          typeof node.node_input === 'object' &&
          Object.keys(node.node_input).length > 0
        ) {
          console.log(
            `處理瀏覽器擴展輸出節點 ${node.id} 的輸入:`,
            node.node_input
          );

          // 從 node_input 提取所有 handle ID
          inputHandles = Object.keys(node.node_input).map((handleId) => {
            console.log(`從 node_input 提取 handle ID: ${handleId}`);
            return { id: handleId };
          });

          console.log(
            `節點 ${node.id} 從 node_input 提取的 handle:`,
            inputHandles
          );
        } else {
          console.log(`節點 ${node.id} 沒有 node_input 數據，不創建 handle`);
        }

        return {
          ...baseData,
          type: 'browserExtensionOutput',
          inputHandles: inputHandles
        };
      }

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

        // 提取 prompt 文本
        const promptText = node.parameters?.prompt?.data || '';

        return {
          ...baseData,
          model: modelId,
          promptText: promptText
        };
      }

      case 'basic_input': {
        // 提取參數中的欄位
        // const fields = [];
        // 修改: 使用固定參數名稱而不是索引
        // 有可能有舊資料， input_name_0, default_value_0, 也要多判斷
        const field = {
          inputName:
            node.parameters?.input_name?.data ||
            node.parameters?.input_name_0?.data ||
            'input_name',
          defaultValue:
            node.parameters?.default_value?.data ||
            node.parameters?.default_value_0?.data ||
            ''
        };

        console.log(`處理 basic_input 節點:`, {
          inputName: field.inputName,
          defaultValue: field.defaultValue
        });
        // const paramKeys = Object.keys(node.parameters || {});

        // console.log(`處理 basic_input 節點，參數鍵:`, paramKeys);

        // // 查找所有輸入欄位對
        // const fieldIndicies = new Set();

        // paramKeys.forEach((key) => {
        //   if (
        //     key.startsWith('input_name_') ||
        //     key.startsWith('default_value_')
        //   ) {
        //     const match = key.match(/_(\d+)$/);
        //     if (match && match[1]) {
        //       fieldIndicies.add(parseInt(match[1]));
        //     }
        //   }
        // });

        // const sortedIndicies = Array.from(fieldIndicies).sort((a, b) => a - b);
        // console.log(`找到欄位索引: ${sortedIndicies.join(', ')}`);

        // // 處理每個欄位
        // sortedIndicies.forEach((i) => {
        //   const field = {
        //     inputName:
        //       node.parameters?.[`input_name_${i}`]?.data || `input_${i}`,
        //     defaultValue: node.parameters?.[`default_value_${i}`]?.data || ''
        //   };
        //   fields.push(field);
        //   console.log(`添加欄位 ${i}:`, field);
        // });

        // // 確保至少有一個欄位
        // if (fields.length === 0) {
        //   const defaultField = {
        //     inputName: 'default_input',
        //     defaultValue: 'Enter value here'
        //   };
        //   fields.push(defaultField);
        //   console.log('添加一個默認欄位:', defaultField);
        // }

        // 返回完整的資料結構，不包含回調函數
        // 回調函數將在 updateNodeFunctions 中添加
        return {
          ...baseData,
          fields: [field]
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
          selectedFile: node.parameters?.file_id?.data || '',
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
      case 'aim_ml': {
        console.log(
          'transformNodeDataToReactFlow - aim_ml 節點參數:',
          node.parameters
        );

        // 確保正確讀取所有參數
        const nodeData = {
          ...baseData,
          selectedAim: node.parameters?.aim_ml_id?.data || '',
          trainingId: node.parameters?.training_id?.data || 0,
          simulatorId: node.parameters?.simulator_id?.data || '',
          enableExplain: node.parameters?.enable_explain?.data ?? true,
          llmId: node.parameters?.llm_id?.data || 0,
          promptText: node.parameters?.prompt?.data || ''
        };

        console.log('QOCA AIM 節點轉換後的數據:', nodeData);

        return nodeData;
      }
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
          'event',
          'extract_data'
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
   * 修改 WorkflowDataConverter 中的 convertReactFlowToAPI 方法，修復 'nodes is not defined' 錯誤
   */
  static convertReactFlowToAPI(reactFlowData) {
    console.log('開始轉換 ReactFlow 格式為 API 格式');

    // 從 reactFlowData 中提取節點和邊緣
    const { nodes, edges } = reactFlowData;

    if (!nodes || !Array.isArray(nodes)) {
      console.error('缺少有效的節點數據');
      return null;
    }

    // 轉換節點
    const flowPipeline = nodes.map((node) => {
      console.log(`處理節點 ${node.id}, 類型: ${node.type}`);

      // 提取節點輸入連接 - 現在傳遞所有節點作為參數
      const nodeInput = WorkflowMappingService.extractNodeInputForAPI(
        node.id,
        edges,
        nodes
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

    // 創建最終 API 數據結構
    const apiData = {
      flow_name: reactFlowData.title || '未命名流程',
      flow_id: reactFlowData.id || `flow_${Date.now()}`,
      content: {
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
   * 統一 AI 節點輸入鍵的格式
   * @param {string} key - 原始輸入鍵
   * @param {number} index - 如果是上下文連接，提供的索引
   * @returns {string} - 統一格式的輸入鍵
   */
  static normalizeAIInputKey(key, index = 0) {
    // 處理 prompt 相關的鍵
    if (key === 'prompt-input' || key === 'prompt') {
      return 'prompt';
    }

    // 處理 context 相關的鍵
    if (key === 'context-input') {
      // 單一 context 連接
      return 'context0';
    } else if (key.startsWith('context-input_')) {
      // 舊版多連接格式：context-input_0, context-input_1
      const oldIndex = key.split('_')[1];
      return `context${oldIndex}`;
    } else if (key.match(/^context\d+$/)) {
      // 新版格式：已經是 context0, context1 等
      return key;
    } else if (key.startsWith('context')) {
      // 其他 context 開頭的格式
      return `context${index}`;
    }

    // 其他鍵保持不變
    return key;
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
      case 'line_webhook_input':
      case 'line':
        console.log('處理 line 節點 API 轉換:', node.data);
        // Line Webhook 節點參數
        if (node.data.external_service_config_id) {
          parameters.external_service_config_id = {
            data:
              parseInt(node.data.external_service_config_id) ||
              node.data.external_service_config_id
          };
        }
        if (node.data.webhook_url) {
          parameters.webhook_url = {
            data: node.data.webhook_url
          };
        }
        break;
      case 'customInput':
      case 'input':
        // if (node.data.fields && node.data.fields.length > 0) {
        //   node.data.fields.forEach((field, index) => {
        //     parameters[`input_name_${index}`] = { data: field.inputName || '' };
        //     parameters[`default_value_${index}`] = {
        //       data: field.defaultValue || ''
        //     };
        //   });
        //   console.log(`處理 ${node.data.fields.length} 個輸入欄位`);
        // } else {
        //   console.warn(`節點 ${node.id} 沒有欄位資料`);
        // }

        // 修改: 使用固定參數名稱而不是索引
        // 使用第一個欄位的資料，或是空字串
        if (node.data.fields && node.data.fields.length > 0) {
          const field = node.data.fields[0]; // 只使用第一個欄位
          parameters.input_name = { data: field.inputName || '' };
          parameters.default_value = { data: field.defaultValue || '' };
          console.log(
            `處理輸入節點參數: input_name=${field.inputName}, default_value=${field.defaultValue}`
          );
        } else {
          // 如果沒有欄位資料，提供默認值
          parameters.input_name = { data: 'input_name' };
          parameters.default_value = { data: 'Summary the input text' };
          console.warn(`節點 ${node.id} 沒有欄位資料，使用默認值`);
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
        parameters.llm_id = { data: Number(safeModelValue) };

        // 新增處理 promptText - 當有直接輸入的提示文本時
        // 兼容舊版：不覆蓋已有的 prompt 參數
        if (node.data.promptText && !parameters.prompt) {
          parameters.prompt = { data: node.data.promptText };
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
          parameters.file_id = { data: node.data.selectedFile };
        }
        // 添加 top_k 參數
        parameters.top_k = { data: node.data.topK || 5 };
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
        // 重要：保存所有 inputHandles 到 parameters
        if (
          node.data &&
          node.data.inputHandles &&
          Array.isArray(node.data.inputHandles)
        ) {
          // 從實際的 inputHandles 獲取 handle ID 列表
          const handleIds = node.data.inputHandles.map((h) => h.id);

          // 儲存 handle ID 列表到 parameters
          parameters.inputHandles = {
            data: handleIds
          };

          console.log(
            `保存節點 ${node.id} 的 ${handleIds.length} 個 handle 到 parameters:`,
            handleIds
          );

          // 🔧 修復：驗證 node_input 與 inputHandles 的一致性
          if (node.data.node_input) {
            const nodeInputKeys = Object.keys(node.data.node_input);
            const missingInNodeInput = handleIds.filter(
              (id) => !nodeInputKeys.includes(id)
            );
            const extraInNodeInput = nodeInputKeys.filter(
              (id) => !handleIds.includes(id)
            );

            if (missingInNodeInput.length > 0) {
              console.warn(
                `節點 ${node.id} 的 node_input 缺少 handles:`,
                missingInNodeInput
              );
            }

            if (extraInNodeInput.length > 0) {
              console.warn(
                `節點 ${node.id} 的 node_input 有多餘的 handles:`,
                extraInNodeInput
              );
            }

            // 🔧 修復：確保 node_input 包含所有 inputHandles 中的 handle
            handleIds.forEach((handleId) => {
              if (!node.data.node_input[handleId]) {
                console.log(
                  `為節點 ${node.id} 添加缺少的 node_input 項目: ${handleId}`
                );
                node.data.node_input[handleId] = {
                  node_id: '',
                  output_name: '',
                  type: 'string',
                  data: '',
                  is_empty: true,
                  return_name: ''
                };
              }
            });
          }
        } else {
          console.warn(`節點 ${node.id} 沒有有效的 inputHandles 資料`);
          // 提供默認值
          parameters.inputHandles = {
            data: ['output0']
          };
        }
        break;
      case 'extract_data':
      case 'extractData':
        // Extract Data 節點參數
        if (node.data.model) {
          const modelValue = node.data.model || '1';
          const safeModelValue =
            typeof modelValue !== 'string'
              ? modelValue.toString()
              : modelValue || '1';
          parameters.llm_id = { data: Number(safeModelValue) };
        }

        // 處理 columns 數據
        if (node.data.columns && Array.isArray(node.data.columns)) {
          parameters.columns = { data: node.data.columns };

          // 生成 example JSON 字符串
          const exampleObj = {};
          node.data.columns.forEach((column) => {
            switch (column.type) {
              case 'number':
                exampleObj[column.name] = 0;
                break;
              case 'boolean':
                exampleObj[column.name] = false;
                break;
              default: // text
                exampleObj[column.name] = '';
                break;
            }
          });
          parameters.example = { data: JSON.stringify(exampleObj) };
        } else {
          // 預設 columns 和 example
          parameters.columns = {
            data: [
              {
                name: 'fasting_blood_sugar',
                type: 'text',
                description: '> 120 mg/dl'
              }
            ]
          };
          parameters.example = { data: '{"fasting_blood_sugar": ""}' };
        }
        break;
      case 'aim_ml': {
        // QOCA AIM 節點參數轉換
        // aim_ml 參數
        if (node.data.selectedAim || node.data.aim_ml_id) {
          const aimValue =
            node.data.selectedAim || node.data.aim_ml_id?.data || '';
          if (aimValue) {
            parameters.aim_ml_id = { data: aimValue };
          }
        }

        // training_id 參數
        if (node.data.trainingId !== undefined || node.data.training_id) {
          const trainingValue =
            node.data.trainingId ?? node.data.training_id?.data ?? 0;
          parameters.training_id = { data: trainingValue };
        }

        // simulator_id 參數
        if (node.data.simulatorId || node.data.simulator_id) {
          const simulatorValue =
            node.data.simulatorId || node.data.simulator_id?.data || '';
          parameters.simulator_id = { data: simulatorValue };
        }

        // enable_explain 參數 (預設為 true)
        const enableExplainValue =
          node.data.enableExplain ?? node.data.enable_explain?.data ?? true;
        parameters.enable_explain = { data: enableExplainValue };

        // 只有當 enable_explain 為 true 時才處理以下參數
        if (enableExplainValue) {
          // llm_id 參數 - 現在支援 LLM Vision 模型 ID
          if (node.data.llmId !== undefined || node.data.llm_id) {
            const llmValue = node.data.llmId ?? node.data.llm_id?.data ?? 1;
            // 確保 llmValue 是數字類型，適用於 LLM Vision API 的 id 欄位
            const numericLlmValue =
              typeof llmValue === 'string' ? parseInt(llmValue) : llmValue;
            parameters.llm_id = { data: numericLlmValue };
          }

          // prompt 參數
          if (node.data.promptText || node.data.prompt) {
            const promptValue =
              node.data.promptText || node.data.prompt?.data || '';
            parameters.prompt = {
              type: 'string',
              data: promptValue,
              node_id: node.id || ''
            };
          }
        }

        console.log('QOCA AIM 節點轉換後的參數:', parameters);
        break;
      }
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
