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

  // 先定義一個基本的邊緣變更處理函數，後面會被增強版本替換
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

  // 現在可以定義增強版的 handleEdgesChange，因為 safeSetNodes 已經初始化
  const enhancedHandleEdgesChange = useCallback(
    (changes) => {
      // 檢查是否有邊緣被刪除
      const removedEdges = changes.filter((change) => change.type === 'remove');

      if (removedEdges.length > 0) {
        console.log('檢測到邊緣刪除操作:', removedEdges);

        // 對於每個被刪除的邊緣，查找相關的瀏覽器擴展輸出節點
        removedEdges.forEach((removedEdge) => {
          // 從當前邊緣中找到完整的邊緣數據
          const fullEdge = edges.find((edge) => edge.id === removedEdge.id);

          if (fullEdge) {
            console.log('找到被刪除的邊緣:', fullEdge);

            // 檢查目標節點是否為瀏覽器擴展輸出節點
            const targetNode = nodes.find(
              (node) =>
                node.id === fullEdge.target &&
                node.type === 'browserExtensionOutput'
            );

            if (targetNode) {
              console.log('目標節點是瀏覽器擴展輸出節點:', targetNode.id);

              // 獲取目標 handle ID
              const targetHandleId = fullEdge.targetHandle;

              // 檢查是否是默認 handle ('input')
              if (targetHandleId && targetHandleId !== 'input') {
                console.log(`準備刪除非默認 handle: ${targetHandleId}`);

                // 檢查是否還有其他邊緣連接到此 handle
                const otherEdgesToSameHandle = edges.filter(
                  (e) =>
                    e.id !== fullEdge.id &&
                    e.target === targetNode.id &&
                    e.targetHandle === targetHandleId
                );

                // 只有當沒有其他邊緣連接到此 handle 時才刪除
                if (otherEdgesToSameHandle.length === 0) {
                  console.log(
                    `沒有其他邊緣連接到 handle ${targetHandleId}，將其刪除`
                  );

                  // 更新節點，移除對應的 handle
                  safeSetNodes((nds) =>
                    nds.map((node) => {
                      if (node.id === targetNode.id) {
                        // 獲取現有的 inputHandles
                        const currentHandles = node.data.inputHandles || [];

                        // 過濾掉要刪除的 handle
                        const updatedHandles = currentHandles.filter(
                          (handle) => handle.id !== targetHandleId
                        );

                        // 確保至少保留默認 'input' handle
                        if (!updatedHandles.some((h) => h.id === 'input')) {
                          updatedHandles.unshift({ id: 'input' });
                        }

                        console.log(
                          `節點 ${node.id} 更新後的 handles:`,
                          updatedHandles
                        );

                        // 返回更新後的節點
                        return {
                          ...node,
                          data: {
                            ...node.data,
                            inputHandles: updatedHandles
                          }
                        };
                      }
                      return node;
                    })
                  );

                  // 同時更新節點的 node_input 數據
                  if (
                    targetNode.data.node_input &&
                    targetNode.data.node_input[targetHandleId]
                  ) {
                    safeSetNodes((nds) =>
                      nds.map((node) => {
                        if (node.id === targetNode.id) {
                          // 創建 node_input 的副本
                          const updatedNodeInput = { ...node.data.node_input };

                          // 刪除對應 handle 的輸入關聯
                          delete updatedNodeInput[targetHandleId];

                          console.log(
                            `從節點 ${node.id} 的 node_input 中刪除 ${targetHandleId}`
                          );

                          return {
                            ...node,
                            data: {
                              ...node.data,
                              node_input: updatedNodeInput
                            }
                          };
                        }
                        return node;
                      })
                    );
                  }
                } else {
                  console.log(
                    `還有 ${otherEdgesToSameHandle.length} 個邊緣連接到 handle ${targetHandleId}，保留此 handle`
                  );
                }
              } else {
                console.log('不刪除默認 handle (input)');
              }
            }
          }
        });
      }

      // 調用原始的邊緣變更處理函數
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [edges, nodes, safeSetNodes, setEdges]
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

  // 對於 onNodesDelete 函數，也需要進行對應修改
  const onNodesDelete = useCallback(
    (nodesToDelete) => {
      if (!nodesToDelete || nodesToDelete.length === 0) return;

      // 收集刪除前的所有節點和邊緣
      const nodeIdsToDelete = nodesToDelete.map((node) => node.id);
      const edgesBeforeUpdate = [...edges];

      // 創建瀏覽器擴展輸出節點輸入 handle 的映射
      const browserExtensionOutputNodes = nodes.filter(
        (node) => node.type === 'browserExtensionOutput'
      );

      // 對於每個要刪除的節點，查找受影響的連接
      nodesToDelete.forEach((nodeToDelete) => {
        // 獲取所有連接到該節點的邊緣
        const connectedEdges = getConnectedEdges([nodeToDelete], edges);

        // 找到有邊緣進入此節點的節點（前置節點）
        const incomers = getIncomers(nodeToDelete, nodes, edges);

        // 找到有邊緣從此節點出去的節點（後續節點）
        const outgoers = getOutgoers(nodeToDelete, nodes, edges);

        // 處理常規節點的連接
        // 對於每個前置節點，創建與所有後續節點的新連接
        incomers.forEach((incomer) => {
          outgoers.forEach((outgoer) => {
            // 找到從前置節點到要刪除的節點的邊緣
            const incomerEdge = connectedEdges.find(
              (edge) =>
                edge.source === incomer.id && edge.target === nodeToDelete.id
            );

            // 找到從要刪除的節點到後續節點的邊緣
            const outgoerEdge = connectedEdges.find(
              (edge) =>
                edge.source === nodeToDelete.id && edge.target === outgoer.id
            );

            if (incomerEdge && outgoerEdge) {
              // 對瀏覽器擴展輸出節點進行特殊處理
              if (outgoer.type === 'browserExtensionOutput') {
                console.log(
                  `處理刪除後的連接重建: ${incomer.id} -> ${outgoer.id}:${outgoerEdge.targetHandle}`
                );

                // 創建一個新的邊緣 ID，包含目標 handle 信息
                const newEdgeId = `${incomer.id}-${outgoer.id}-${
                  outgoerEdge.targetHandle
                }-${incomerEdge.sourceHandle || 'output'}`;

                // 為瀏覽器擴展輸出節點保留目標 handle ID
                const newEdge = {
                  id: newEdgeId,
                  source: incomer.id,
                  target: outgoer.id,
                  sourceHandle: incomerEdge.sourceHandle || 'output',
                  targetHandle: outgoerEdge.targetHandle,
                  type: outgoerEdge.type || 'custom-edge'
                };

                // 添加新邊緣以直接連接前置節點和瀏覽器擴展輸出節點
                safeSetEdges((eds) => [...eds, newEdge]);
              } else {
                // 標準節點的邊緣
                const newEdge = {
                  id: `${incomer.id}-${outgoer.id}`,
                  source: incomer.id,
                  target: outgoer.id,
                  sourceHandle: incomerEdge.sourceHandle || 'output',
                  targetHandle: outgoerEdge.targetHandle || 'input',
                  type: outgoerEdge.type || 'custom-edge'
                };

                // 添加新邊緣
                safeSetEdges((eds) => [...eds, newEdge]);
              }
            }
          });
        });
      });

      // 移除所有連接到已刪除節點的邊緣
      safeSetEdges((eds) =>
        eds.filter(
          (edge) =>
            !nodeIdsToDelete.includes(edge.source) &&
            !nodeIdsToDelete.includes(edge.target)
        )
      );

      // 清理已刪除節點的回調
      nodeIdsToDelete.forEach((nodeId) => {
        delete nodeCallbacks.current[nodeId];
      });

      // 從狀態中移除已刪除的節點
      safeSetNodes((nds) =>
        nds.filter((node) => !nodeIdsToDelete.includes(node.id))
      );
    },
    [
      nodes,
      edges,
      safeSetEdges,
      safeSetNodes,
      getConnectedEdges,
      getIncomers,
      getOutgoers
    ]
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

  // 更新 useFlowNodes.jsx 中的 handleAddBrowserExtensionOutput 函數

  const handleAddBrowserExtensionOutput = useCallback(
    (position) => {
      const id = `browserExtOut_${Date.now()}`;
      const nodeCallbacksObject = getNodeCallbacks(
        id,
        'browserExtensionOutput'
      );

      // 初始化一個有默認 handle 的輸入節點
      const newNode = {
        id,
        type: 'browserExtensionOutput',
        data: {
          // 確保默認有一個 input handle
          inputHandles: [{ id: 'input' }],
          // 儲存節點輸入連接關聯
          node_input: {},
          onAddOutput: (newInputHandles) => {
            console.log(`更新節點 ${id} 的 handle：`, newInputHandles);

            // 檢查是否已經有相同的 handle
            const currentNode = nodes.find((node) => node.id === id);
            if (
              currentNode &&
              currentNode.data &&
              JSON.stringify(currentNode.data.inputHandles) ===
                JSON.stringify(newInputHandles)
            ) {
              console.log('handles 沒有變化，跳過更新');
              return;
            }

            // 更新節點時保留現有的 node_input 數據
            safeSetNodes((nds) =>
              nds.map((node) => {
                if (node.id === id) {
                  // 保留原有數據，只更新 inputHandles
                  return {
                    ...node,
                    data: {
                      ...node.data,
                      inputHandles: newInputHandles
                    }
                  };
                }
                return node;
              })
            );
          },
          // 添加一個可以移除 handle 的函數
          onRemoveHandle: (handleId) => {
            console.log(`準備移除節點 ${id} 的 handle：${handleId}`);

            // 禁止移除默認 input handle
            if (handleId === 'input') {
              console.log('不能移除默認 input handle');
              return;
            }

            safeSetNodes((nds) =>
              nds.map((node) => {
                if (node.id === id) {
                  // 獲取現有的 handles
                  const currentHandles = node.data.inputHandles || [];

                  // 過濾掉要移除的 handle
                  const updatedHandles = currentHandles.filter(
                    (handle) => handle.id !== handleId
                  );

                  // 獲取現有的 node_input
                  const currentNodeInput = node.data.node_input || {};

                  // 創建一個新的 node_input，移除對應的輸入關聯
                  const updatedNodeInput = { ...currentNodeInput };
                  delete updatedNodeInput[handleId];

                  console.log(`已從節點 ${id} 移除 handle ${handleId}`);

                  return {
                    ...node,
                    data: {
                      ...node.data,
                      inputHandles: updatedHandles,
                      node_input: updatedNodeInput
                    }
                  };
                }
                return node;
              })
            );
          },
          ...nodeCallbacksObject
        },
        position: position || {
          x: Math.random() * 400,
          y: Math.random() * 400
        }
      };

      safeSetNodes((nds) => [...nds, newNode]);
    },
    [safeSetNodes, getNodeCallbacks, nodes]
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
   * 修復 onConnect 函數中的 "edges.some is not a function" 錯誤
   */
  const onConnect = useCallback(
    (params) => {
      // 提取連接參數
      const sourceHandle = params.sourceHandle || 'output';
      const targetNodeId = params.target;
      let targetHandle = params.targetHandle;

      console.log(
        `嘗試連接: 從 ${params.source}:${sourceHandle} 到 ${targetNodeId}:${targetHandle}`
      );

      // 檢查目標節點是否為瀏覽器擴展輸出節點
      const targetNode = nodes.find((node) => node.id === targetNodeId);
      const isBrowserExtensionOutput =
        targetNode && targetNode.type === 'browserExtensionOutput';

      // 處理瀏覽器擴展輸出節點
      if (isBrowserExtensionOutput) {
        console.log('目標是瀏覽器擴展輸出節點');

        // 處理特殊的 'new-connection' handle，或目標 handle 不存在的情況
        if (targetHandle === 'new-connection' || !targetHandle) {
          // 創建新的 handle ID
          targetHandle = `input_${Date.now()}`;
          console.log(`創建新的 handle: ${targetHandle}`);

          // 確保目標節點有 inputHandles 數組
          const currentHandles = targetNode.data.inputHandles || [];

          // 添加新 handle 到節點
          safeSetNodes((nds) =>
            nds.map((node) => {
              if (node.id === targetNodeId) {
                const newHandles = [...currentHandles, { id: targetHandle }];
                console.log(`更新節點 ${targetNodeId} 的 handles:`, newHandles);

                // 為了確保連線和 handle 同步創建，在同一操作中一起更新
                return {
                  ...node,
                  data: {
                    ...node.data,
                    inputHandles: newHandles
                  }
                };
              }
              return node;
            })
          );
        }

        // 創建新的邊緣 - 對於瀏覽器擴展輸出節點，我們總是允許多個連接到同一個 handle
        safeSetEdges((eds) => {
          // 檢查 eds 是否為數組
          if (!Array.isArray(eds)) {
            console.error('edges 不是數組:', eds);
            return [];
          }

          // 檢查是否已存在完全相同的連接
          const connectionExists = eds.some(
            (edge) =>
              edge.source === params.source &&
              edge.target === targetNodeId &&
              edge.targetHandle === targetHandle &&
              edge.sourceHandle === sourceHandle
          );

          if (connectionExists) {
            console.log(`連接已存在，不重複創建`);
            return eds;
          }

          // 創建唯一的邊緣 ID
          const edgeId = `${
            params.source
          }-${targetNodeId}-${targetHandle}-${sourceHandle}-${Date.now()}`;

          // 創建新連接
          const newEdge = {
            id: edgeId,
            source: params.source,
            target: targetNodeId,
            sourceHandle: sourceHandle,
            targetHandle: targetHandle,
            type: 'custom-edge'
          };

          console.log(`創建新連接:`, newEdge);
          return [...eds, newEdge];
        });

        // 給 React Flow 一些時間來更新 handle
        setTimeout(() => {
          try {
            // 手動刷新節點
            const event = new CustomEvent('nodeInternalsChanged', {
              detail: { id: targetNodeId }
            });
            window.dispatchEvent(event);
          } catch (error) {
            console.error('無法刷新節點:', error);
          }
        }, 10);
      } else {
        // 對於其他節點，使用標準邏輯
        try {
          // 創建新的邊緣 ID，確保唯一性
          const edgeId = `${params.source}-${targetNodeId}-${
            targetHandle || 'input'
          }-${sourceHandle}-${Date.now()}`;

          // 創建新的邊緣配置
          const edgeConfig = {
            ...params,
            id: edgeId,
            type: 'custom-edge'
          };

          // 使用 addEdge 函數添加邊緣
          safeSetEdges((currentEdges) => {
            if (!Array.isArray(currentEdges)) {
              console.error('當前 edges 不是數組:', currentEdges);
              return [];
            }

            // 創建新邊緣
            return addEdge(edgeConfig, currentEdges);
          });
        } catch (error) {
          console.error('在使用 addEdge 時出錯:', error);

          // 手動創建邊緣作為備用方案
          safeSetEdges((eds) => {
            if (!Array.isArray(eds)) {
              console.error('edges 不是數組:', eds);
              return [];
            }

            const edgeId = `${params.source}-${targetNodeId}-${
              targetHandle || 'input'
            }-${sourceHandle}-${Date.now()}`;

            const newEdge = {
              id: edgeId,
              source: params.source,
              target: targetNodeId,
              sourceHandle: sourceHandle,
              targetHandle: targetHandle || 'input',
              type: 'custom-edge'
            };

            return [...eds, newEdge];
          });
        }
      }
    },
    [nodes, safeSetNodes, safeSetEdges]
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
