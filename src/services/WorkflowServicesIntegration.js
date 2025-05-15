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
        return `AI (${node.parameters?.llm_id?.data || 'GPT-4o'})`;
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
   * 修正 extractNodeInputForAPI 方法，增加 return_name 支持
   * 從 ReactFlow 邊緣數據中提取節點輸入連接
   * @param {string} nodeId - 目標節點ID
   * @param {Array} edges - 所有邊緣數據
   * @param {Array} allNodes - 所有節點數據
   * @returns {Object} - API 格式的節點輸入
   */
  // 3. 修改 WorkflowDataConverter 類中的 extractNodeInputForAPI 方法

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
    const isAINode =
      targetNode.type === 'aiCustomInput' || targetNode.type === 'ai';

    // 特殊處理 BrowserExtensionOutput 節點，確保所有 inputHandles 都被保留
    if (
      isBrowserExtensionOutput &&
      targetNode.data &&
      targetNode.data.inputHandles
    ) {
      console.log(`處理 BrowserExtensionOutput 節點的所有 input handles`);

      // 遍歷所有 inputHandles，無論是否有連線
      targetNode.data.inputHandles.forEach((handle) => {
        const handleId = handle.id;

        // 檢查此 handle 是否有連線
        const connectedEdges = edges.filter(
          (edge) => edge.target === nodeId && edge.targetHandle === handleId
        );

        if (connectedEdges.length > 0) {
          // 處理已有連線的 handle
          connectedEdges.forEach((edge, index) => {
            const inputKey =
              connectedEdges.length > 1 ? `${handleId}_${index}` : handleId;
            const sourceNode = allNodes.find((n) => n.id === edge.source);
            let returnName = edge.label || 'output';

            // 根據源節點類型獲取適當的 return_name
            if (sourceNode) {
              if (
                sourceNode.type === 'customInput' ||
                sourceNode.type === 'input'
              ) {
                // 從自定義輸入節點獲取欄位名稱
                if (
                  sourceNode.data &&
                  sourceNode.data.fields &&
                  Array.isArray(sourceNode.data.fields)
                ) {
                  // 從 sourceHandle 中提取索引（如 output-0）
                  const outputIndex = edge.sourceHandle
                    ? parseInt(edge.sourceHandle.split('-')[1] || 0)
                    : 0;

                  // 獲取對應的欄位名稱
                  if (sourceNode.data.fields[outputIndex]) {
                    returnName =
                      sourceNode.data.fields[outputIndex].inputName ||
                      returnName;
                  }
                }
              } else if (sourceNode.type === 'browserExtensionInput') {
                // 從瀏覽器擴展輸入節點獲取項目名稱
                if (
                  sourceNode.data &&
                  sourceNode.data.items &&
                  Array.isArray(sourceNode.data.items)
                ) {
                  // 從 sourceHandle 中提取索引（如 output-0）
                  const outputIndex = edge.sourceHandle
                    ? parseInt(edge.sourceHandle.split('-')[1] || 0)
                    : 0;

                  // 獲取對應的項目名稱
                  if (sourceNode.data.items[outputIndex]) {
                    returnName =
                      sourceNode.data.items[outputIndex].name || returnName;
                  }
                }
              } else if (
                sourceNode.type === 'aiCustomInput' ||
                sourceNode.type === 'ai'
              ) {
                // AI 節點通常使用默認的 output
                returnName = 'output';
              } else if (sourceNode.type === 'knowledgeRetrieval') {
                // 知識檢索節點
                returnName = 'output';
              } else {
                // 對於其他節點類型，使用 sourceHandle 或默認為 'output'
                returnName = edge.sourceHandle || 'output';
              }
            }

            // 添加到 nodeInput
            nodeInput[inputKey] = {
              node_id: edge.source,
              output_name: edge.sourceHandle || 'output',
              type: 'string',
              return_name: returnName
            };

            console.log(
              `瀏覽器擴展輸出節點連接: ${edge.source} -> ${nodeId}:${inputKey} (return_name: ${returnName})`
            );
          });
        } else {
          // 為未連線的 handle 創建空的輸入項
          nodeInput[handleId] = {
            node_id: '', // 空節點 ID 表示沒有連線
            output_name: '',
            type: 'string',
            data: '', // 提供默認空數據
            is_empty: true // 標記為空連線
          };
          console.log(`保留未連線的 handle: ${handleId}`);
        }
      });

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

    // 處理每個句柄組
    Object.entries(handleGroups).forEach(([targetHandle, targetEdges]) => {
      // 特殊處理 AI 節點的 context-input
      if (isAINode && targetHandle.startsWith('context')) {
        // 對於 context-input，我們需要處理多個連接
        targetEdges.forEach((edge, index) => {
          // 創建唯一的輸入鍵 - 兼容舊版和新版格式
          let inputKey;

          // 檢查格式，支持可能的舊版格式
          if (targetHandle === 'context-input') {
            // 標準舊版格式
            inputKey = targetEdges.length > 1 ? `context${index}` : 'context0';
          } else if (targetHandle.startsWith('context-input_')) {
            // 舊版多連接格式 (context-input_0, context-input_1)
            const oldIndex = targetHandle.split('_')[1];
            inputKey = `context${oldIndex}`;
          } else if (targetHandle.startsWith('context')) {
            // 新版格式已經是 context0, context1 等
            inputKey = targetHandle;
          } else {
            // 未知格式，使用默認
            inputKey = `context${index}`;
          }

          // 查找源節點以獲取 return_name
          const sourceNode = allNodes.find((n) => n.id === edge.source);
          let returnName = edge.label || 'output';

          // 根據源節點類型獲取適當的 return_name
          if (sourceNode) {
            if (
              sourceNode.type === 'customInput' ||
              sourceNode.type === 'input'
            ) {
              // 從自定義輸入節點獲取欄位名稱
              if (
                sourceNode.data &&
                sourceNode.data.fields &&
                Array.isArray(sourceNode.data.fields)
              ) {
                // 修改: 不再從 sourceHandle 提取索引，而是直接使用第一個欄位
                // 如果 sourceHandle 是 'output'，使用第一個欄位的 inputName
                if (
                  edge.sourceHandle === 'output' &&
                  sourceNode.data.fields[0]
                ) {
                  returnName =
                    sourceNode.data.fields[0].inputName || returnName;
                }
                // 保留舊版處理方式，處理 'output-N' 格式的 sourceHandle
                else if (
                  edge.sourceHandle &&
                  edge.sourceHandle.startsWith('output-')
                ) {
                  const outputIndex = parseInt(
                    edge.sourceHandle.split('-')[1] || 0
                  );
                  if (sourceNode.data.fields[outputIndex]) {
                    returnName =
                      sourceNode.data.fields[outputIndex].inputName ||
                      returnName;
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
                // 從 sourceHandle 中提取索引（如 output-0）
                const outputIndex = edge.sourceHandle
                  ? parseInt(edge.sourceHandle.split('-')[1] || 0)
                  : 0;

                // 獲取對應的項目名稱
                if (sourceNode.data.items[outputIndex]) {
                  returnName =
                    sourceNode.data.items[outputIndex].name || returnName;
                }
              }
            } else if (
              sourceNode.type === 'aiCustomInput' ||
              sourceNode.type === 'ai'
            ) {
              // AI 節點通常使用默認的 output
              returnName = 'output';
            } else if (sourceNode.type === 'knowledgeRetrieval') {
              // 知識檢索節點
              returnName = 'output';
            } else {
              // 對於其他節點類型，使用 sourceHandle 或默認為 'output'
              returnName = edge.sourceHandle || 'output';
            }
          }

          console.log(`源節點 ${edge.source} 的 return_name: ${returnName}`);

          // 添加到 nodeInput
          nodeInput[inputKey] = {
            node_id: edge.source,
            output_name: edge.sourceHandle || 'output',
            type: 'string',
            return_name: returnName
          };

          console.log(
            `AI節點連接: ${edge.source} -> ${nodeId}:${inputKey} (return_name: ${returnName})`
          );
        });
      } // 修改處理 prompt-input
      else if (isAINode && targetHandle === 'prompt-input') {
        const edge = targetEdges[0]; // 只取第一個連接

        // 創建唯一的輸入鍵 - 改為 "prompt"
        const inputKey = 'prompt';

        // 查找源節點以獲取 return_name
        const sourceNode = allNodes.find((n) => n.id === edge.source);
        let returnName = edge.label || 'output';

        // 根據源節點類型獲取適當的 return_name
        if (sourceNode) {
          // ... 現有的 return_name 處理邏輯 ...
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

    if (targetNode) {
      const isAINode =
        targetNode.type === 'aiCustomInput' || targetNode.type === 'ai';

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

  // /**
  //  * 修正 transformToReactFlowFormat 方法，確保載入時能正確處理多個連線到同一 handle
  //  */
  // static transformToReactFlowFormat(apiData) {
  //   console.log('開始轉換 API 格式為 ReactFlow 格式');

  //   // 處理 API 數據結構差異
  //   const flowPipeline =
  //     apiData.flow_pipeline ||
  //     (apiData.content ? apiData.content.flow_pipeline : []);

  //   if (!flowPipeline || !Array.isArray(flowPipeline)) {
  //     console.error('找不到有效的 flow_pipeline 數組');
  //     return { nodes: [], edges: [] };
  //   }

  //   const nodes = [];
  //   const edges = [];

  //   // 首先處理所有節點，確保在創建邊緣之前節點已存在
  //   flowPipeline.forEach((node) => {
  //     console.log(`處理節點 ${node.id}, 操作符: ${node.operator}`);

  //     // 轉換為 ReactFlow 節點格式
  //     const reactFlowNode = {
  //       id: node.id,
  //       type: WorkflowMappingService.getTypeFromOperator(node.operator),
  //       position: {
  //         x: typeof node.position_x === 'number' ? node.position_x : 0,
  //         y: typeof node.position_y === 'number' ? node.position_y : 0
  //       },
  //       data: this.transformNodeDataToReactFlow(node)
  //     };

  //     nodes.push(reactFlowNode);
  //   });

  //   // 對於瀏覽器擴展輸出節點，特殊處理 node_input
  //   flowPipeline.forEach((node) => {
  //     // 檢查節點類型是否為瀏覽器擴展輸出
  //     const isBrowserExtOutput = node.operator === 'browser_extension_output';

  //     // 檢查節點類型是否為 AI 節點
  //     const isAINode = node.operator === 'ask_ai';

  //     if (isBrowserExtOutput && node.node_input) {
  //       console.log(
  //         `處理瀏覽器擴展輸出節點 ${node.id} 的輸入:`,
  //         node.node_input
  //       );

  //       // 查找對應的 ReactFlow 節點
  //       const reactFlowNode = nodes.find((n) => n.id === node.id);
  //       if (!reactFlowNode) return;

  //       // 從 node_input 識別所有的 handle
  //       const handlePattern = /^(.+?)(?:_\d+)?$/;
  //       const handleMap = new Map();

  //       // 分析 node_input，提取真正的 handle ID
  //       Object.keys(node.node_input).forEach((key) => {
  //         const match = key.match(handlePattern);
  //         if (match && match[1]) {
  //           const baseHandle = match[1];
  //           if (!handleMap.has(baseHandle)) {
  //             handleMap.set(baseHandle, []);
  //           }

  //           handleMap.get(baseHandle).push({
  //             fullKey: key,
  //             sourceNodeId: node.node_input[key].node_id,
  //             outputName: node.node_input[key].output_name || 'output',
  //             returnName: node.node_input[key].return_name || 'output' // 新增處理 return_name
  //           });
  //         }
  //       });

  //       // 確保 inputHandles 包含所有真正的 handle
  //       const inputHandles = [...(reactFlowNode.data.inputHandles || [])];
  //       const existingHandleIds = inputHandles.map((h) => h.id);

  //       // 添加缺失的 handle
  //       handleMap.forEach((connections, handleId) => {
  //         if (!existingHandleIds.includes(handleId)) {
  //           inputHandles.push({ id: handleId });
  //           console.log(`為節點 ${node.id} 添加缺失的 handle: ${handleId}`);
  //         }
  //       });

  //       // 更新節點的 inputHandles
  //       reactFlowNode.data.inputHandles = inputHandles;

  //       // 創建所有連接
  //       handleMap.forEach((connections, handleId) => {
  //         connections.forEach((connection) => {
  //           // 創建邊緣 ID
  //           const edgeId = `${connection.sourceNodeId}-${node.id}-${handleId}-${connection.outputName}`;

  //           // 創建連接
  //           const edge = {
  //             id: edgeId,
  //             source: connection.sourceNodeId,
  //             sourceHandle: connection.outputName,
  //             target: node.id,
  //             targetHandle: handleId,
  //             type: 'custom-edge',
  //             label: connection.returnName // 使用 return_name 作為標籤
  //           };

  //           edges.push(edge);
  //           console.log(
  //             `創建連接: ${edgeId} (return_name: ${connection.returnName})`
  //           );
  //         });
  //       });
  //     } // 新增 AI 節點特殊處理
  //     else if (isAINode && node.node_input) {
  //       console.log(`處理AI節點 ${node.id} 的輸入:`, node.node_input);

  //       // 查找對應的 ReactFlow 節點
  //       const reactFlowNode = nodes.find((n) => n.id === node.id);
  //       if (!reactFlowNode) return;

  //       // 從 node_input 識別所有的 context handle
  //       const contextHandles = Object.keys(node.node_input).filter(
  //         (key) => key === 'context-input' || key.startsWith('context')
  //       );

  //       // 處理每個 context 連接
  //       contextHandles.forEach((key) => {
  //         const inputValue = node.node_input[key];
  //         if (inputValue && inputValue.node_id) {
  //           // 創建邊緣 ID
  //           const edgeId = `${inputValue.node_id}-${node.id}-${key}-${
  //             inputValue.output_name || 'output'
  //           }-${Date.now()}`;

  //           // 創建連接，統一使用 'context-input' 作為 targetHandle
  //           const edge = {
  //             id: edgeId,
  //             source: inputValue.node_id,
  //             sourceHandle: inputValue.output_name || 'output',
  //             target: node.id,
  //             targetHandle: 'context-input',
  //             type: 'custom-edge',
  //             label: inputValue.return_name || undefined
  //           };

  //           edges.push(edge);
  //           console.log(`創建AI節點連接: ${edgeId}`);
  //         }
  //       });

  //       // 處理 prompt 連接
  //       if (node.node_input['prompt-input']) {
  //         const promptInput = node.node_input['prompt-input'];
  //         if (promptInput && promptInput.node_id) {
  //           const edgeId = `${promptInput.node_id}-${node.id}-prompt-input-${
  //             promptInput.output_name || 'output'
  //           }`;

  //           const edge = {
  //             id: edgeId,
  //             source: promptInput.node_id,
  //             sourceHandle: promptInput.output_name || 'output',
  //             target: node.id,
  //             targetHandle: 'prompt-input',
  //             type: 'custom-edge',
  //             label: promptInput.return_name || undefined
  //           };

  //           edges.push(edge);
  //           console.log(`創建AI節點Prompt連接: ${edgeId}`);
  //         }
  //       }
  //     } else if (node.node_input) {
  //       // 處理其他節點類型的連接
  //       Object.entries(node.node_input).forEach(([inputKey, inputValue]) => {
  //         if (inputValue && inputValue.node_id) {
  //           // 創建邊緣 ID
  //           const edgeId = `${inputValue.node_id}-${node.id}-${inputKey}-${
  //             inputValue.output_name || 'output'
  //           }`;

  //           // 創建連接
  //           const edge = {
  //             id: edgeId,
  //             source: inputValue.node_id,
  //             sourceHandle: inputValue.output_name || 'output',
  //             target: node.id,
  //             targetHandle: inputKey,
  //             type: 'custom-edge'
  //           };

  //           edges.push(edge);
  //           console.log(`創建標準連接: ${edgeId}`);
  //         }
  //       });
  //     }
  //   });

  //   // 自動布局（如果位置都是 0,0）
  //   this.autoLayout(nodes);

  //   console.log(`轉換完成: ${nodes.length} 個節點, ${edges.length} 個連接`);
  //   return { nodes, edges };
  // }
  /**
   * 提取節點輸出以供 API 格式使用
   * @param {Object} node - ReactFlow 節點
   * @returns {Object} - API 格式的節點輸出
   */
  static extractNodeOutputForAPI(node) {
    const nodeOutput = {};
    console.log(`提取節點 ${node.id} 的輸出`);

    switch (node.type) {
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
  // 修改 transformToReactFlowFormat 方法，確保連線正確處理
  static transformToReactFlowFormat(apiData) {
    console.log('開始轉換 API 格式為 ReactFlow 格式');

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

        if (node.node_input && typeof node.node_input === 'object') {
          // 直接使用全部 handle ID
          Object.keys(node.node_input).forEach((key) => {
            inputHandles.push({ id: key });
            console.log(`從 node_input 提取 handle: ${key}`);
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
          inputHandles.push({ id: 'input' });
          console.log(`添加默認 handle: input`);
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
        const field = {
          inputName: node.parameters?.input_name?.data || 'input_name',
          defaultValue: node.parameters?.default_value?.data || ''
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
        // 重要：保存所有 inputHandles 到 parameters
        if (
          node.data &&
          node.data.inputHandles &&
          Array.isArray(node.data.inputHandles)
        ) {
          // 儲存 handle ID 列表
          parameters.inputHandles = {
            data: node.data.inputHandles.map((h) => h.id)
          };
          console.log(
            `保存節點 ${node.id} 的 ${node.data.inputHandles.length} 個 handle 到 parameters`
          );
        }
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
