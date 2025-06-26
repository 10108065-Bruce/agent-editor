// hooks/useFlowNodes.js
import { useRef, useCallback, useEffect } from 'react';
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
import dagre from 'dagre';
import {
  calculateNodeDimensions,
  getOptimizedLayoutConfig,
  analyzeConnectionComplexity,
  estimateLayoutCanvasSize,
  validateLayoutQuality
} from '../utils/nodeDimensions';

export default function useFlowNodes() {
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  const undoStack = useRef([]);
  const redoStack = useRef([]);
  const nodeCallbacks = useRef({});
  const isUpdatingNodes = useRef(false);

  // dagre 自動排版函數
  const handleAutoLayout = useCallback(
    async (direction = 'TB') => {
      console.log(`開始執行自動排版，方向: ${direction}`);

      if (nodes.length === 0) {
        console.log('沒有節點，跳過自動排版');
        return;
      }

      try {
        // 分析連線複雜度
        const complexityAnalysis = analyzeConnectionComplexity(nodes, edges);
        console.log('連線複雜度分析:', complexityAnalysis);

        // 創建新的 dagre 圖
        const dagreGraph = new dagre.graphlib.Graph();
        dagreGraph.setDefaultEdgeLabel(() => ({}));

        // 使用優化的配置
        const layoutConfig = getOptimizedLayoutConfig(
          direction,
          complexityAnalysis
        );
        dagreGraph.setGraph(layoutConfig);

        console.log('優化的 Dagre 配置:', layoutConfig);
        console.log('複雜度建議:', complexityAnalysis.recommendations);

        // 添加節點到 dagre 圖中，使用動態尺寸計算
        nodes.forEach((node) => {
          const dimensions = calculateNodeDimensions(node);
          console.log(
            `節點 ${node.id} (${node.type}): ${dimensions.width}x${dimensions.height}`
          );

          dagreGraph.setNode(node.id, {
            width: dimensions.width,
            height: dimensions.height
          });
        });

        // 添加邊緣到 dagre 圖中
        edges.forEach((edge) => {
          dagreGraph.setEdge(edge.source, edge.target);
          console.log(`邊緣: ${edge.source} -> ${edge.target}`);
        });

        // 執行自動排版
        dagre.layout(dagreGraph);

        // 獲取新的節點位置並更新
        const updatedNodes = nodes.map((node) => {
          const nodeWithPosition = dagreGraph.node(node.id);

          if (nodeWithPosition) {
            const dimensions = calculateNodeDimensions(node);

            // dagre 返回的是中心點位置，需要轉換為左上角位置
            const newX = Math.round(nodeWithPosition.x - dimensions.width / 2);
            const newY = Math.round(nodeWithPosition.y - dimensions.height / 2);

            return {
              ...node,
              position: {
                x: newX,
                y: newY
              }
            };
          }

          return node;
        });

        // 批量更新節點位置
        setNodes(updatedNodes);

        // 驗證排版質量
        const qualityReport = validateLayoutQuality(updatedNodes, direction);

        // 根據質量給出不同的通知
        // if (qualityReport.hasOverlaps) {
        //   console.warn(`發現 ${qualityReport.overlapCount} 個節點重疊`);

        //   if (typeof window !== 'undefined' && window.notify) {
        //     window.notify({
        //       message: `排版完成，但發現 ${qualityReport.overlapCount} 個節點重疊，建議手動調整或嘗試其他方向`,
        //       type: 'warning',
        //       duration: 4000
        //     });
        //   }
        // } else if (complexityAnalysis.crossingPotential[direction] > 0) {
        //   if (typeof window !== 'undefined' && window.notify) {
        //     window.notify({
        //       message: `排版完成，但可能存在連線交叉，建議檢查流程邏輯`,
        //       type: 'info',
        //       duration: 3000
        //     });
        //   }
        // }

        // 預估畫布尺寸並打印信息
        const canvasSize = estimateLayoutCanvasSize(updatedNodes, direction);
        // 延遲一下再縮放到適合大小
        setTimeout(() => {
          console.log('觸發視圖縮放');
          const event = new CustomEvent('autoLayoutComplete', {
            detail: {
              direction,
              nodeCount: nodes.length,
              canvasSize,
              qualityReport,
              complexityAnalysis
            }
          });
          window.dispatchEvent(event);
        }, 300);
      } catch (error) {
        console.error('自動排版失敗:', error);
        throw error;
      }
    },
    [nodes, edges, setNodes]
  );

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
        case 'extractData':
        case 'extract_data':
          callbacks.updateNodeData = (key, value) => {
            console.log(
              `更新 Extract Data 節點 ${nodeId} 的 ${key} 資料:`,
              value
            );
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
                  const currentItems = node.data.items || [];
                  // 為新項目生成ID，格式為 'a{當前項目數量+1}'
                  const newItemId = `a${currentItems.length + 1}`;
                  return {
                    ...node,
                    data: {
                      ...node.data,
                      items: [
                        ...currentItems,
                        { id: newItemId, name: 'New Item', icon: 'document' }
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
        case 'browserExtensionOutput':
          callbacks.updateEdgeLabels = (edgeIds, newLabel) => {
            safeSetEdges((eds) =>
              eds.map((edge) => {
                if (Array.isArray(edgeIds) && edgeIds.includes(edge.id)) {
                  return {
                    ...edge,
                    label: newLabel
                  };
                } else if (edge.id === edgeIds) {
                  return {
                    ...edge,
                    label: newLabel
                  };
                }
                return edge;
              })
            );
          };

          // 確保有 updateNodeData 回調
          if (!callbacks.updateNodeData) {
            callbacks.updateNodeData = (key, value) => {
              console.log(`更新節點 ${nodeId} 的 ${key} 資料:`, value);
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
    [handleNodeSelection, safeSetNodes, safeSetEdges]
  );

  // 對於 onNodesDelete 函數，也需要進行對應修改
  const onNodesDelete = useCallback(
    (nodesToDelete) => {
      if (!nodesToDelete || nodesToDelete.length === 0) return;

      // 收集刪除前的所有節點和邊緣
      const nodeIdsToDelete = nodesToDelete.map((node) => node.id);

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
              // 檢查後續節點是否為AI節點
              const isAIOutgoer =
                outgoer.type === 'aiCustomInput' || outgoer.type === 'ai';

              if (isAIOutgoer) {
                // 檢查目標 handle 是否已經有其他連線
                const existingEdges = edges.filter(
                  (edge) =>
                    edge.source !== nodeToDelete.id && // 不計算將被刪除的節點
                    edge.target === outgoer.id &&
                    edge.targetHandle === outgoerEdge.targetHandle
                );

                if (existingEdges.length > 0) {
                  console.log(
                    `AI節點 ${outgoer.id} 的 ${outgoerEdge.targetHandle} 已有其他連線，不建立新連接`
                  );
                  return; // 跳過此連接的重建
                }
              }

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
          inputHandles: [{ id: 'output0' }],
          // 儲存節點輸入連接關聯
          node_input: {
            // 為默認 handle 創建一個空的輸入項
            input: {
              node_id: '',
              output_name: '',
              type: 'string',
              data: '',
              is_empty: true,
              return_name: ''
            }
          },
          // 新增一個通用的 onAddOutput 方法
          onAddOutput: (newInputHandles) => {
            console.log(`更新節點 ${id} 的 handle：`, newInputHandles);

            // 使用 setNodes 直接更新
            setNodes((prevNodes) => {
              const nodeIndex = prevNodes.findIndex((node) => node.id === id);

              if (nodeIndex === -1) {
                console.warn(`找不到節點 ${id}`);
                return prevNodes;
              }

              // 創建更新後的節點副本
              const updatedNodes = [...prevNodes];
              const currentNode = updatedNodes[nodeIndex];

              // 更新 inputHandles 和 node_input
              updatedNodes[nodeIndex] = {
                ...currentNode,
                data: {
                  ...currentNode.data,
                  inputHandles: newInputHandles,
                  node_input: {
                    ...currentNode.data.node_input,
                    ...newInputHandles.reduce((acc, handle) => {
                      acc[handle.id] = {
                        node_id: '',
                        output_name: '',
                        type: 'string',
                        data: '',
                        is_empty: true,
                        return_name: ''
                      };
                      return acc;
                    }, {})
                  }
                }
              };

              return updatedNodes;
            });
          },

          // 新增 onRemoveHandle 方法
          onRemoveHandle: (handleId) => {
            if (handleId === 'output0') {
              console.log('不能移除默認 output0 handle');
              return;
            }

            setNodes((prevNodes) => {
              const nodeIndex = prevNodes.findIndex((node) => node.id === id);

              if (nodeIndex === -1) {
                console.warn(`找不到節點 ${id}`);
                return prevNodes;
              }

              const updatedNodes = [...prevNodes];
              const currentNode = updatedNodes[nodeIndex];

              // 過濾 inputHandles 並刪除對應的 node_input
              updatedNodes[nodeIndex] = {
                ...currentNode,
                data: {
                  ...currentNode.data,
                  inputHandles: currentNode.data.inputHandles.filter(
                    (handle) => handle.id !== handleId
                  ),
                  node_input: Object.fromEntries(
                    Object.entries(currentNode.data.node_input || {}).filter(
                      ([key]) => key !== handleId
                    )
                  )
                }
              };

              return updatedNodes;
            });
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
    [safeSetNodes, getNodeCallbacks, setNodes]
  );

  const handleAddBrowserExtensionInput = useCallback(
    (position) => {
      const id = `browserExtIn_${Date.now()}`;
      const nodeCallbacksObject = getNodeCallbacks(id, 'browserExtensionInput');

      const newNode = {
        id,
        type: 'browserExtensionInput',
        data: {
          // 初始化時為每個項目添加對應的ID
          items: [{ id: 'a1', name: '', icon: 'upload' }],
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
      const existingLineNodes = nodes.filter(
        (node) => node.type === 'line_webhook_input'
      );
      if (existingLineNodes.length > 0) {
        // 使用通知系統提示用戶
        if (typeof window !== 'undefined' && window.notify) {
          window.notify({
            message: '每個 Flow 只能有一個 Line Webhook 節點',
            type: 'warning',
            duration: 4000
          });
        }

        console.warn(
          '嘗試添加第二個 Line 節點被阻止，現有 Line 節點:',
          existingLineNodes.map((n) => n.id)
        );
        return; // 阻止添加新的 Line 節點
      }

      const newNode = {
        id,
        type: 'line_webhook_input',
        data: {
          external_service_config_id: '', // 初始為空，讓用戶選擇
          webhook_url: '', // 初始為空，需要創建後才有
          output_handles: ['text', 'image'], // 固定的輸出類型
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

  // 添加 Line Message節點
  const handleAddLineMessageNode = useCallback(
    (position) => {
      const id = `message_${Date.now()}`;
      const nodeCallbacksObject = getNodeCallbacks(id, 'message');

      const newNode = {
        id,
        type: 'line_send_message',
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

  // 添加 Extract data 節點
  const handleAddExtractDataNode = useCallback(
    (position) => {
      const id = `extract_${Date.now()}`;
      const nodeCallbacksObject = getNodeCallbacks(id, 'extractData');

      const newNode = {
        id,
        type: 'extract_data',
        data: {
          model: '1', // 預設模型 ID
          columns: [
            {
              name: '',
              type: 'text',
              description: ''
            }
          ],
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
          topK: 5, // 添加默認的 top_k 值
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

  // 添加事件節點
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

  // 連接處理函數
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

      // 檢查目標節點是否為AI節點
      const isAINode =
        targetNode &&
        (targetNode.type === 'aiCustomInput' || targetNode.type === 'ai');

      // 檢查目標節點是否為Extract Data節點
      const isExtractDataNode =
        targetNode && targetNode.type === 'extract_data';

      // 檢查源節點類型
      const sourceNode = nodes.find((node) => node.id === params.source);
      const isBrowserExtensionInput =
        sourceNode && sourceNode.type === 'browserExtensionInput';

      // 檢查源節點是否為CustomInputNode
      const isCustomInputNode = sourceNode && sourceNode.type === 'customInput';

      // 如果是CustomInputNode，檢查輸出連線限制
      if (isCustomInputNode) {
        console.log('源節點是CustomInputNode，檢查連線限制');

        // 檢查該輸出handle是否已有連線
        const existingEdges = edges.filter(
          (edge) =>
            edge.source === params.source && edge.sourceHandle === sourceHandle
        );

        if (existingEdges.length > 0) {
          console.log(`Input的輸出已有連線，拒絕新連線`);

          // 使用通知系統提示用戶
          if (typeof window !== 'undefined' && window.notify) {
            window.notify({
              message: `Input已有連線，請先刪除現有連線`,
              type: 'error',
              duration: 3000
            });
          }

          return; // 不創建新連線
        }
      }

      // 檢查知識檢索節點的連線限制
      if (targetNode && targetNode.type === 'knowledgeRetrieval') {
        console.log('目標是知識檢索節點，檢查連線限制');

        // 檢查是否已有輸入連線
        const existingEdges = edges.filter(
          (edge) =>
            edge.target === targetNodeId && edge.targetHandle === 'passage'
        );

        if (existingEdges.length > 0) {
          console.log(`知識檢索節點已有輸入連線，拒絕新連線`);

          // 使用通知系統提示用戶
          if (typeof window !== 'undefined' && window.notify) {
            window.notify({
              message: `知識檢索節點只能有一個輸入連線，請先刪除現有連線`,
              type: 'error',
              duration: 3000
            });
          }

          return; // 不創建新連線
        }
      }

      // 檢查源節點是否為知識檢索節點
      if (sourceNode && sourceNode.type === 'knowledgeRetrieval') {
        console.log('源節點是知識檢索節點，檢查連線限制');

        // 檢查是否已有輸出連線
        const existingEdges = edges.filter(
          (edge) =>
            edge.source === params.source && edge.sourceHandle === 'output'
        );

        if (existingEdges.length > 0) {
          console.log(`知識檢索節點已有輸出連線，拒絕新連線`);

          // 使用通知系統提示用戶
          if (typeof window !== 'undefined' && window.notify) {
            window.notify({
              message: `知識檢索節點只能有一個輸出連線，請先刪除現有連線`,
              type: 'error',
              duration: 3000
            });
          }

          return; // 不創建新連線
        }
      }

      // 檢查源節點是否為extractData節點，只能有一個輸出
      if (sourceNode && sourceNode.type === 'extract_data') {
        console.log('源節點是Extract Data節點，檢查連線限制');

        // 檢查是否已有輸出連線
        const existingEdges = edges.filter(
          (edge) =>
            edge.source === params.source && edge.sourceHandle === 'output'
        );

        if (existingEdges.length > 0) {
          console.log(`Extract Data節點已有輸出連線，拒絕新連線`);

          // 使用通知系統提示用戶
          if (typeof window !== 'undefined' && window.notify) {
            window.notify({
              message: `Extract Data節點只能有一個輸出連線，請先刪除現有連線`,
              type: 'error',
              duration: 3000
            });
          }

          return; // 不創建新連線
        }
      }

      // 檢查目標節點是否為Line Message節點
      if (targetNode && targetNode.type === 'line_send_message') {
        console.log('目標是LineMessage節點，檢查連線限制');

        // 檢查是否已有輸入連線
        const existingEdges = edges.filter(
          (edge) =>
            edge.target === targetNodeId && edge.targetHandle === 'message'
        );

        if (existingEdges.length > 0) {
          console.log(`LineMessage節點已有輸入連線，拒絕新連線`);

          // 使用通知系統提示用戶
          if (typeof window !== 'undefined' && window.notify) {
            window.notify({
              message: `LineMessage節點只能有一個輸入連線，請先刪除現有連線`,
              type: 'error',
              duration: 3000
            });
          }

          return; // 不創建新連線
        }
      }

      // 處理AI節點的連線限制
      if (isAINode) {
        console.log('目標是AI節點，檢查連線限制');

        // 允許多個連接到 context-input，但仍限制 prompt-input 只能有一個連線
        if (targetHandle === 'prompt-input') {
          // 檢查 prompt-input 是否已經有連線
          const existingEdges = edges.filter(
            (edge) =>
              edge.target === targetNodeId &&
              edge.targetHandle === 'prompt-input'
          );

          if (existingEdges.length > 0) {
            console.log(`AI節點的 Prompt 已有連線，拒絕新連線`);

            // 使用通知系統提示用戶
            if (typeof window !== 'undefined' && window.notify) {
              window.notify({
                message: `AI節點的 Prompt 已有連線，請先刪除現有連線`,
                type: 'error',
                duration: 3000
              });
            }

            return; // 不創建新連線
          }
        }
        // context-input 允許多個連線，所以不進行檢查
      }

      // 檢查 Extract Data 節點的連線限制
      if (isExtractDataNode) {
        console.log('目標是Extract Data節點，檢查連線限制');
        // 檢查是否已有輸入連線
        const existingEdges = edges.filter(
          (edge) =>
            edge.target === targetNodeId &&
            edge.targetHandle === 'context-input'
        );
        console.log(existingEdges);
        if (existingEdges.length > 0) {
          console.log(`Extract Data節點已有輸入連線，拒絕新連線`);

          // 使用通知系統提示用戶
          if (typeof window !== 'undefined' && window.notify) {
            window.notify({
              message: `Extract Data節點只能有一個輸入連線，請先刪除現有連線`,
              type: 'error',
              duration: 3000
            });
          }

          return; // 不創建新連線
        }
      }

      // 處理瀏覽器擴展輸出節點
      if (isBrowserExtensionOutput) {
        console.log('目標是瀏覽器擴展輸出節點');

        if (targetHandle === 'new-connection' || !targetHandle) {
          // 創建新的 handle ID
          const currentHandles = targetNode.data.inputHandles || [];

          // 找出最大索引
          let maxIndex = -1;
          currentHandles.forEach((handle) => {
            if (handle.id && handle.id.startsWith('output')) {
              const indexStr = handle.id.substring(6); // 提取 'output' 後面的部分
              const index = parseInt(indexStr, 10);
              if (!isNaN(index) && index > maxIndex) {
                maxIndex = index;
              }
            }
          });

          // 新的 handle ID 使用下一個索引
          const newIndex = maxIndex + 1;
          targetHandle = `output${newIndex}`;
          console.log(`創建新的 handle: ${targetHandle}`);

          // 添加新 handle 到節點
          safeSetNodes((nds) =>
            nds.map((node) => {
              if (node.id === targetNodeId) {
                const newHandles = [...currentHandles, { id: targetHandle }];
                console.log(`更新節點 ${targetNodeId} 的 handles:`, newHandles);

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

        // 檢查是否已存在完全相同的連接
        const connectionExists = edges.some(
          (edge) =>
            edge.source === params.source &&
            edge.target === targetNodeId &&
            edge.targetHandle === targetHandle &&
            edge.sourceHandle === sourceHandle
        );

        if (connectionExists) {
          console.log(`連接已存在，不重複創建`);
          return; // 直接返回，不創建新連接
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

        // 直接使用 setEdges 避免 safeSetEdges 可能的重複調用問題
        setEdges((currentEdges) => {
          // 在更新函數內部再次檢查，防止競態條件
          const exists = currentEdges.some(
            (edge) =>
              edge.source === params.source &&
              edge.target === targetNodeId &&
              edge.targetHandle === targetHandle &&
              edge.sourceHandle === sourceHandle
          );

          if (exists) {
            console.log(`在 setEdges 中發現連接已存在，跳過`);
            return currentEdges;
          }

          return [...currentEdges, newEdge];
        });

        // 給 React Flow 一些時間來更新 handle
        setTimeout(() => {
          try {
            const event = new CustomEvent('nodeInternalsChanged', {
              detail: { id: targetNodeId }
            });
            window.dispatchEvent(event);
          } catch (error) {
            console.error('無法刷新節點:', error);
          }
        }, 10);

        // 重要：對於瀏覽器擴展輸出節點，在這裡直接返回，避免執行下面的通用邏輯
        return;
      }

      // 對於其他節點，使用標準邏輯
      try {
        // 創建新的邊緣 ID，確保唯一性
        const edgeId = `${params.source}-${targetNodeId}-${
          targetHandle || 'input'
        }-${sourceHandle}-${Date.now()}`;

        // 創建新的邊緣配置，處理來自 browserExtensionInput 的連接
        let edgeConfig = {
          ...params,
          id: edgeId,
          type: 'custom-edge'
        };

        // 如果源節點是瀏覽器擴展輸入節點，設置邊的標籤為對應項目的名稱
        if (isBrowserExtensionInput && sourceNode?.data?.items) {
          // 從 sourceHandle 獲取正確的項目
          const itemIndex = sourceNode.data.items.findIndex((item, idx) => {
            const outputKey = item.id || `a${idx + 1}`;
            return outputKey === sourceHandle;
          });

          if (itemIndex !== -1 && sourceNode.data.items[itemIndex]) {
            edgeConfig.label = sourceNode.data.items[itemIndex].name || '';
            console.log(`設置連接標籤為項目名稱: ${edgeConfig.label}`);
          }
        }

        // 使用 addEdge 函數添加邊緣
        safeSetEdges((currentEdges) => {
          // 創建新邊緣
          return addEdge(edgeConfig, currentEdges);
        });
      } catch (error) {
        console.error('在使用 addEdge 時出錯:', error);

        // 手動創建邊緣作為備用方案
        safeSetEdges((eds) => {
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
    },
    [nodes, edges, safeSetNodes, safeSetEdges]
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
        case 'line_webhook_input': // 修正 Line 節點的檢查
          missingCallbacks = !node.data.updateNodeData || !node.data.onSelect;
          console.log(`Line 節點 ${nodeId} 回調檢查:`, {
            hasUpdateNodeData: !!node.data.updateNodeData,
            hasOnSelect: !!node.data.onSelect,
            missingCallbacks
          });
          break;
        case 'line_send_message': // 添加 Line Message 節點的檢查
          missingCallbacks = !node.data.updateNodeData || !node.data.onSelect;
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

  const deleteEdgesByHandle = useCallback(
    (nodeId, handleId) => {
      console.log(`刪除與節點 ${nodeId} handle ${handleId} 相關的所有邊緣`);

      // 找出所有連接到指定節點和 handle 的邊緣
      const edgesToDelete = edges.filter((edge) => {
        const isTargetMatch =
          edge.target === nodeId && edge.targetHandle === handleId;

        // 也要處理多連線格式的邊緣（例如 output0_1, output0_2）
        const isMultiConnectionMatch =
          edge.target === nodeId &&
          edge.targetHandle &&
          edge.targetHandle.startsWith(handleId + '_');

        return isTargetMatch || isMultiConnectionMatch;
      });

      if (edgesToDelete.length > 0) {
        console.log(
          `找到 ${edgesToDelete.length} 個要刪除的邊緣:`,
          edgesToDelete.map((e) => e.id)
        );

        // 從邊緣列表中移除這些邊緣
        safeSetEdges((currentEdges) =>
          currentEdges.filter(
            (edge) => !edgesToDelete.some((toDelete) => toDelete.id === edge.id)
          )
        );
      } else {
        console.log(`沒有找到與 ${nodeId}:${handleId} 相關的邊緣`);
      }
    },
    [edges, safeSetEdges]
  );
  // 在 useFlowNodes hook 的 useEffect 中註冊全域函數
  useEffect(() => {
    // 將 deleteEdgesByHandle 函數註冊到 window 對象，供組件使用
    if (typeof window !== 'undefined') {
      window.deleteEdgesByHandle = deleteEdgesByHandle;
    }

    // 清理函數
    return () => {
      if (typeof window !== 'undefined') {
        delete window.deleteEdgesByHandle;
      }
    };
  }, [deleteEdgesByHandle]);

  return {
    nodes,
    setNodes: safeSetNodes,
    edges,
    setEdges: safeSetEdges,
    onNodesChange: handleNodesChange,
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
    handleAddLineMessageNode,
    handleAddEventNode,
    updateNodeFunctions,
    handleAddEndNode,
    handleAddTimerNode,
    handleNodeSelection,
    handleAddExtractDataNode,
    undo,
    redo,
    getNodeCallbacks,
    handleAutoLayout, // 新增的自動排版函數
    deleteEdgesByHandle // 新增
  };
}
