// hooks/useFlowNodes.js
import { useRef, useCallback } from 'react';
import {
  useNodesState,
  useEdgesState,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  getConnectedEdges,
  getIncomers,
  getOutgoers
} from 'reactflow';

export default function useFlowNodes() {
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  const undoStack = useRef([]);
  const redoStack = useRef([]);
  const nodeCallbacks = useRef({});
  const isUpdatingNodes = useRef(false);

  // 優化過的節點變更處理函數，保持節點移動的流暢性
  const handleNodesChange = useCallback(
    (changes) => {
      // 直接應用變更，不觸發額外的狀態更新
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [setNodes]
  );

  // 優化過的邊緣變更處理函數
  const handleEdgesChange = useCallback(
    (changes) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [setEdges]
  );

  const pushToUndoStack = useCallback(() => {
    // 僅在進行實質性更改時添加到撤銷堆疊
    undoStack.current.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges))
    });
    redoStack.current = [];
  }, [nodes, edges]);

  const safeSetNodes = useCallback(
    (updater) => {
      pushToUndoStack();
      setNodes(updater);
    },
    [pushToUndoStack, setNodes]
  );

  const safeSetEdges = useCallback(
    (updater) => {
      pushToUndoStack();
      setEdges(updater);
    },
    [pushToUndoStack, setEdges]
  );

  // 高效的節點選擇處理程序
  const handleNodeSelection = useCallback(
    (nodeId) => {
      if (isUpdatingNodes.current) return;
      isUpdatingNodes.current = true;

      setNodes((nds) => {
        const updatedNodes = nds.map((node) => ({
          ...node,
          selected: node.id === nodeId
        }));

        // 確保即使快速移動節點也能更新選擇狀態
        requestAnimationFrame(() => {
          isUpdatingNodes.current = false;
        });

        return updatedNodes;
      });
    },
    [setNodes]
  );

  // 優化的節點回調獲取函數
  const getNodeCallbacks = useCallback(
    (nodeId, nodeType) => {
      // 如果已有該節點的回調，直接返回
      if (nodeCallbacks.current[nodeId]) {
        return nodeCallbacks.current[nodeId];
      }

      // 建立新回調
      const callbacks = {};

      // 所有節點類型的公共回調
      callbacks.onSelect = () => {
        handleNodeSelection(nodeId);
      };

      // 根據節點類型的特定回調
      switch (nodeType) {
        case 'customInput':
          callbacks.addField = () => {
            safeSetNodes((nds) =>
              nds.map((node) => {
                if (node.id === nodeId) {
                  const fields = Array.isArray(node.data.fields)
                    ? [...node.data.fields]
                    : [];
                  return {
                    ...node,
                    data: {
                      ...node.data,
                      fields: [
                        ...fields,
                        {
                          inputName: 'New Input',
                          defaultValue: 'Default value'
                        }
                      ]
                    }
                  };
                }
                return node;
              })
            );
          };

          callbacks.updateFieldInputName = (index, value) => {
            safeSetNodes((nds) =>
              nds.map((node) => {
                if (node.id === nodeId) {
                  const fields = node.data.fields || [];
                  if (index >= 0 && index < fields.length) {
                    const updatedFields = [...fields];
                    updatedFields[index] = {
                      ...updatedFields[index],
                      inputName: value
                    };
                    return {
                      ...node,
                      data: {
                        ...node.data,
                        fields: updatedFields
                      }
                    };
                  }
                }
                return node;
              })
            );
          };

          callbacks.updateFieldDefaultValue = (index, value) => {
            safeSetNodes((nds) =>
              nds.map((node) => {
                if (node.id === nodeId) {
                  const fields = node.data.fields || [];
                  if (index >= 0 && index < fields.length) {
                    const updatedFields = [...fields];
                    updatedFields[index] = {
                      ...updatedFields[index],
                      defaultValue: value
                    };
                    return {
                      ...node,
                      data: {
                        ...node.data,
                        fields: updatedFields
                      }
                    };
                  }
                }
                return node;
              })
            );
          };
          break;

        case 'browserExtensionInput':
          callbacks.addItem = () => {
            safeSetNodes((nds) =>
              nds.map((node) => {
                if (node.id === nodeId) {
                  return {
                    ...node,
                    data: {
                      ...node.data,
                      items: [
                        ...node.data.items,
                        { name: 'New Item', icon: 'document' }
                      ]
                    }
                  };
                }
                return node;
              })
            );
          };

          callbacks.updateItemName = (index, name) => {
            safeSetNodes((nds) =>
              nds.map((node) => {
                if (node.id === nodeId) {
                  const updatedItems = [...node.data.items];
                  updatedItems[index] = {
                    ...updatedItems[index],
                    name
                  };
                  return {
                    ...node,
                    data: {
                      ...node.data,
                      items: updatedItems
                    }
                  };
                }
                return node;
              })
            );
          };
          break;

        default:
          // 所有其他節點類型的通用更新函數
          callbacks.updateNodeData = (key, value) => {
            safeSetNodes((nds) =>
              nds.map((node) => {
                if (node.id === nodeId) {
                  return {
                    ...node,
                    data: {
                      ...node.data,
                      [key]: value
                    }
                  };
                }
                return node;
              })
            );
          };
          break;
      }

      // 為所有節點類型添加通用的 updateNodeData
      if (!callbacks.updateNodeData) {
        callbacks.updateNodeData = (key, value) => {
          safeSetNodes((nds) =>
            nds.map((node) => {
              if (node.id === nodeId) {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    [key]: value
                  }
                };
              }
              return node;
            })
          );
        };
      }

      // 存儲回調以重用
      nodeCallbacks.current[nodeId] = callbacks;
      return callbacks;
    },
    [handleNodeSelection, safeSetNodes]
  );

  // 刪除中間節點功能
  const onNodesDelete = useCallback(
    (nodesToDelete) => {
      if (!nodesToDelete || nodesToDelete.length === 0) return;

      // 對每個要刪除的節點，收集所有連接
      nodesToDelete.forEach((nodeToDelete) => {
        // 獲取所有連接到這個節點的邊
        const connectedEdges = getConnectedEdges([nodeToDelete], edges);

        // 找到有邊進入此節點的節點（前置節點）
        const incomers = getIncomers(nodeToDelete, nodes, edges);

        // 找到有邊從此節點出去的節點（後續節點）
        const outgoers = getOutgoers(nodeToDelete, nodes, edges);

        // 在所有前置和後續節點之間創建新連接
        const newEdges = [];

        incomers.forEach((incomer) => {
          outgoers.forEach((outgoer) => {
            // 找到從前置節點到要刪除的節點的邊
            const incomerEdge = connectedEdges.find(
              (edge) =>
                edge.source === incomer.id && edge.target === nodeToDelete.id
            );

            // 找到從要刪除的節點到後續節點的邊
            const outgoerEdge = connectedEdges.find(
              (edge) =>
                edge.source === nodeToDelete.id && edge.target === outgoer.id
            );

            if (incomerEdge && outgoerEdge) {
              // 創建一個直接連接前置節點和後續節點的新邊
              newEdges.push({
                id: `${incomer.id}-${outgoer.id}`,
                source: incomer.id,
                target: outgoer.id,
                // 可選：保留原始邊的特殊屬性
                sourceHandle: incomerEdge.sourceHandle,
                targetHandle: outgoerEdge.targetHandle,
                // 對於 if/else 節點，保留句柄類型（true/false）
                type: outgoerEdge.type
              });
            }
          });
        });

        // 添加新邊並移除連接到已刪除節點的邊
        if (newEdges.length > 0) {
          safeSetEdges((eds) => [
            ...eds.filter(
              (edge) => !connectedEdges.some((ce) => ce.id === edge.id)
            ),
            ...newEdges
          ]);
        }
      });

      // 清理已刪除節點的回調
      nodesToDelete.forEach((node) => {
        delete nodeCallbacks.current[node.id];
      });

      // 實際從狀態中移除節點
      const idsToDelete = nodesToDelete.map((n) => n.id);
      safeSetNodes((nds) => nds.filter((n) => !idsToDelete.includes(n.id)));
    },
    [nodes, edges, safeSetEdges, safeSetNodes]
  );

  const deleteSelectedNodes = useCallback(
    (selectedNodes) => {
      if (!selectedNodes || selectedNodes.length === 0) return;
      onNodesDelete(selectedNodes);
    },
    [onNodesDelete]
  );

  // 添加新的輸入節點
  const handleAddInputNode = useCallback(
    (position) => {
      const id = `input_${Date.now()}`;

      // 獲取此節點的回調
      const nodeCallbacksObject = getNodeCallbacks(id, 'customInput');

      // 創建帶有默認字段的新節點
      const newNode = {
        id,
        type: 'customInput',
        position: position || { x: 250, y: 25 },
        data: {
          // 初始化一個默認字段
          fields: [
            {
              inputName: 'input_name',
              defaultValue: 'Summary the input text'
            }
          ],
          // 添加所有回調
          ...nodeCallbacksObject
        }
      };

      // 使用 safeSetNodes 替代直接 setNodes
      safeSetNodes((nds) => [...nds, newNode]);
    },
    [safeSetNodes, getNodeCallbacks]
  );

  // 其他節點添加函數 (優化後的版本)
  const handleAddAINode = useCallback(
    (position) => {
      const id = `ai_${Date.now()}`;
      const nodeCallbacksObject = getNodeCallbacks(id, 'aiCustomInput');

      const newNode = {
        id,
        type: 'aiCustomInput',
        data: {
          model: 'O3-mini',
          selectedOption: 'prompt',
          ...nodeCallbacksObject
        },
        position: position || {
          x: Math.random() * 400,
          y: Math.random() * 400
        }
      };

      safeSetNodes((nds) => [...nds, newNode]);
    },
    [safeSetNodes, getNodeCallbacks]
  );

  const handleAddBrowserExtensionOutput = useCallback(
    (position) => {
      const id = `browserExtOut_${Date.now()}`;
      const nodeCallbacksObject = getNodeCallbacks(
        id,
        'browserExtensionOutput'
      );

      const newNode = {
        id,
        type: 'browserExtensionOutput',
        data: {
          ...nodeCallbacksObject
        },
        position: position || {
          x: Math.random() * 400,
          y: Math.random() * 400
        }
      };

      safeSetNodes((nds) => [...nds, newNode]);
    },
    [safeSetNodes, getNodeCallbacks]
  );

  const handleAddBrowserExtensionInput = useCallback(
    (position) => {
      const id = `browserExtIn_${Date.now()}`;
      const nodeCallbacksObject = getNodeCallbacks(id, 'browserExtensionInput');

      const newNode = {
        id,
        type: 'browserExtensionInput',
        data: {
          items: [{ name: '', icon: 'upload' }],
          ...nodeCallbacksObject
        },
        position: position || {
          x: Math.random() * 400,
          y: Math.random() * 400
        }
      };

      safeSetNodes((nds) => [...nds, newNode]);
    },
    [safeSetNodes, getNodeCallbacks]
  );

  const handleAddNode = useCallback(
    (position) => {
      const id = `default_${Date.now()}`;
      const nodeCallbacksObject = getNodeCallbacks(id, 'default');

      const newNode = {
        id,
        type: 'default',
        data: {
          label: '新節點',
          ...nodeCallbacksObject
        },
        position: position || {
          x: Math.random() * 400,
          y: Math.random() * 400
        }
      };
      safeSetNodes((nds) => [...nds, newNode]);
    },
    [safeSetNodes, getNodeCallbacks]
  );

  // 添加 If/Else 節點
  const handleAddIfElseNode = useCallback(
    (position) => {
      const id = `ifelse_${Date.now()}`;
      const nodeCallbacksObject = getNodeCallbacks(id, 'ifElse');

      const newNode = {
        id,
        type: 'ifElse',
        data: {
          variableName: 'formate_value',
          operator: 'equals',
          compareValue: 'Hello',
          ...nodeCallbacksObject
        },
        position: position || {
          x: Math.random() * 400,
          y: Math.random() * 400
        }
      };

      safeSetNodes((nds) => [...nds, newNode]);
    },
    [safeSetNodes, getNodeCallbacks]
  );

  // 添加 HTTP 節點
  const handleAddHTTPNode = useCallback(
    (position) => {
      const id = `http_${Date.now()}`;
      const nodeCallbacksObject = getNodeCallbacks(id, 'http');

      const newNode = {
        id,
        type: 'http',
        data: {
          url: '', // 默認空 URL
          method: 'GET', // 默認 HTTP 方法
          ...nodeCallbacksObject
        },
        position: position || {
          x: Math.random() * 400,
          y: Math.random() * 400
        }
      };

      safeSetNodes((nds) => [...nds, newNode]);
    },
    [safeSetNodes, getNodeCallbacks]
  );

  // 添加 Line 節點
  const handleAddLineNode = useCallback(
    (position) => {
      const id = `line_${Date.now()}`;
      const nodeCallbacksObject = getNodeCallbacks(id, 'line');

      const newNode = {
        id,
        type: 'line',
        data: {
          mode: 'reply', // 默認為回覆模式
          text: '', // 默認空文字
          ...nodeCallbacksObject
        },
        position: position || {
          x: Math.random() * 400,
          y: Math.random() * 400
        }
      };

      safeSetNodes((nds) => [...nds, newNode]);
    },
    [safeSetNodes, getNodeCallbacks]
  );

  // 添加知識檢索節點
  const handleAddKnowledgeRetrievalNode = useCallback(
    (position) => {
      const id = `knowledge_${Date.now()}`;
      const nodeCallbacksObject = getNodeCallbacks(id, 'knowledgeRetrieval');

      const newNode = {
        id,
        type: 'knowledgeRetrieval',
        data: {
          availableFiles: [
            { id: 'icdcode', name: 'ICDCode.csv' },
            { id: 'cardiology', name: 'Cardiology_Diagnoses.csv' }
          ],
          selectedFile: '', // 默認不選擇
          ...nodeCallbacksObject
        },
        position: position || {
          x: Math.random() * 400,
          y: Math.random() * 400
        }
      };

      safeSetNodes((nds) => [...nds, newNode]);
    },
    [safeSetNodes, getNodeCallbacks]
  );

  // 添加結束節點
  const handleAddEndNode = useCallback(
    (position) => {
      const id = `end_${Date.now()}`;
      const nodeCallbacksObject = getNodeCallbacks(id, 'end');

      const newNode = {
        id,
        type: 'end',
        data: {
          outputText: '', // 默認空輸出文字
          ...nodeCallbacksObject
        },
        position: position || {
          x: Math.random() * 400,
          y: Math.random() * 400
        }
      };

      safeSetNodes((nds) => [...nds, newNode]);
    },
    [safeSetNodes, getNodeCallbacks]
  );

  // 添加 Webhook 節點
  const handleAddWebhookNode = useCallback(
    (position) => {
      const id = `webhook_${Date.now()}`;
      const nodeCallbacksObject = getNodeCallbacks(id, 'webhook');

      const newNode = {
        id,
        type: 'webhook',
        data: {
          webhookUrl: '', // 默認空 URL
          ...nodeCallbacksObject
        },
        position: position || {
          x: Math.random() * 400,
          y: Math.random() * 400
        }
      };

      safeSetNodes((nds) => [...nds, newNode]);
    },
    [safeSetNodes, getNodeCallbacks]
  );

  // 添加定時器節點
  const handleAddTimerNode = useCallback(
    (position) => {
      const id = `timer_${Date.now()}`;
      const nodeCallbacksObject = getNodeCallbacks(id, 'timer');

      const newNode = {
        id,
        type: 'timer',
        data: {
          hours: 0,
          minutes: 0,
          seconds: 0,
          ...nodeCallbacksObject
        },
        position: position || {
          x: Math.random() * 400,
          y: Math.random() * 400
        }
      };

      safeSetNodes((nds) => [...nds, newNode]);
    },
    [safeSetNodes, getNodeCallbacks]
  );

  // 事件節點佔位符
  // 添加定時器節點
  const handleAddEventNode = useCallback(
    (position) => {
      const id = `event_${Date.now()}`;
      const nodeCallbacksObject = getNodeCallbacks(id, 'event');

      const newNode = {
        id,
        type: 'event',
        data: {
          hours: 0,
          minutes: 0,
          seconds: 0,
          ...nodeCallbacksObject
        },
        position: position || {
          x: Math.random() * 400,
          y: Math.random() * 400
        }
      };

      safeSetNodes((nds) => [...nds, newNode]);
    },
    [safeSetNodes, getNodeCallbacks]
  );

  /**
   * 改进的连接处理方法，确保多个节点可以连接到同一目标的同一句柄
   */
  const onConnect = useCallback(
    (params) => {
      safeSetEdges((eds) => {
        // 提取连接参数
        const sourceHandle = params.sourceHandle || 'output';
        const targetHandle = params.targetHandle || 'input';

        // 查找连接到同一目标节点同一句柄的所有边缘
        const existingEdges = eds.filter(
          (edge) =>
            edge.target === params.target && edge.targetHandle === targetHandle
        );

        // 检查是否已经存在完全相同的连接
        const exactConnectionExists = existingEdges.some(
          (edge) =>
            edge.source === params.source && edge.sourceHandle === sourceHandle
        );

        // 如果已存在完全相同的连接，不要重复添加
        if (exactConnectionExists) {
          console.log(
            `连接已存在，跳过: ${params.source} -> ${params.target}:${targetHandle}`
          );
          return eds;
        }

        // 为新连接创建唯一的边缘ID
        // 包含目标句柄的索引信息，以确保唯一性
        const targetHandleIndex =
          existingEdges.length > 0 ? existingEdges.length + 1 : 1;
        const edgeId = `${params.source}-${params.target}-${targetHandle}_${targetHandleIndex}-${sourceHandle}`;

        // 创建新边缘
        const newEdge = {
          id: edgeId,
          source: params.source,
          target: params.target,
          sourceHandle: sourceHandle,
          // 如果是第一个连接，使用原始句柄；否则，添加索引
          targetHandle: targetHandle,
          type: 'custom-edge',
          label: `Connection ${targetHandleIndex}`
        };

        console.log(`添加新连接: ${edgeId}`);

        // 保留所有现有边缘，添加新边缘
        return [...eds, newEdge];
      });
    },
    [safeSetEdges]
  );

  // 撤銷功能
  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return;
    redoStack.current.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges))
    });

    const prev = undoStack.current.pop();
    setNodes(prev.nodes);
    setEdges(prev.edges);
  }, [nodes, edges, setNodes, setEdges]);

  // 重做功能
  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    undoStack.current.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges))
    });

    const next = redoStack.current.pop();
    setNodes(next.nodes);
    setEdges(next.edges);
  }, [nodes, edges, setNodes, setEdges]);

  // 更新節點標籤
  const updateNodeLabel = useCallback(
    (id, label) => {
      safeSetNodes((nds) =>
        nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label } } : n))
      );
    },
    [safeSetNodes]
  );

  // 優化的節點函數更新方法
  const updateNodeFunctions = useCallback(() => {
    // 進行批次處理以提高效率
    const updatedNodes = [...nodes];
    let hasChanges = false;

    console.log('開始檢查並更新所有節點的回調函數...');

    nodes.forEach((node, index) => {
      const nodeId = node.id;
      const nodeType = node.type;

      // 根據節點類型檢查是否缺少必要的回調
      let missingCallbacks = false;

      switch (nodeType) {
        case 'customInput':
          missingCallbacks =
            !node.data.addField ||
            !node.data.updateFieldInputName ||
            !node.data.updateFieldDefaultValue ||
            !node.data.onSelect;
          break;
        case 'browserExtensionInput':
          missingCallbacks =
            !node.data.addItem ||
            !node.data.updateItemName ||
            !node.data.onSelect;
          break;
        default:
          missingCallbacks = !node.data.onSelect || !node.data.updateNodeData;
          break;
      }

      // 如果節點缺少必要的回調，重新生成並設置
      if (missingCallbacks) {
        console.log(
          `節點 ${nodeId} (類型: ${nodeType}) 缺少必要回調，正在更新...`
        );
        const callbacks = getNodeCallbacks(nodeId, nodeType);

        // 更新當前節點的回調函數
        updatedNodes[index] = {
          ...updatedNodes[index],
          data: {
            ...updatedNodes[index].data,
            ...callbacks
          }
        };

        hasChanges = true;
      }
    });

    // 只有在有變更時才更新狀態，避免不必要的重新渲染
    if (hasChanges) {
      console.log('有節點回調函數需要更新，正在應用變更...');
      setNodes(updatedNodes);
    } else {
      console.log('所有節點回調函數已經是最新，無需更新。');
    }
  }, [nodes, getNodeCallbacks, setNodes]);

  return {
    nodes,
    setNodes: safeSetNodes,
    edges,
    setEdges: safeSetEdges,
    onNodesChange: handleNodesChange, // 使用優化過的變更處理器
    onEdgesChange: handleEdgesChange,
    onConnect,
    onNodesDelete,
    handleAddNode,
    handleAddInputNode,
    handleAddAINode,
    handleAddBrowserExtensionInput,
    handleAddBrowserExtensionOutput,
    updateNodeLabel,
    deleteSelectedNodes,
    handleAddIfElseNode,
    handleAddKnowledgeRetrievalNode,
    handleAddWebhookNode,
    handleAddHTTPNode,
    handleAddLineNode,
    handleAddEventNode,
    updateNodeFunctions,
    handleAddEndNode,
    handleAddTimerNode,
    handleNodeSelection,
    undo,
    redo,
    getNodeCallbacks
  };
}
