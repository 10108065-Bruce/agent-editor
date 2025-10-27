/* eslint-disable no-unused-vars */
// src/components/FlowEditor.jsx
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  forwardRef,
  useImperativeHandle
} from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  ReactFlowProvider,
  useReactFlow,
  Panel
} from 'reactflow';
import useFlowNodes from '../hooks/useFlowNodes';
import NodeSidebar from '../components/layout/NodeSidebar';
import APAAssistant from '../components/APAAssistant';
import enhancedNodeTypes from '../components/enhancedNodeType';
import SaveButton from '../components/buttons/SaveButton';
import FileIOService from '../services/FileIOService';
import { iframeBridge } from '../services/IFrameBridgeService';

import 'reactflow/dist/style.css';
import { CustomEdge } from '../components/CustomEdge';
import { WorkflowDataConverter, workflowAPIService } from '../services/index';

import LoadWorkflowButton from '../components/buttons/LoadWorkflowButton';
import Notification from '../components/common/Notification';
import SaveFlowDialog from '../components/common/SaveFlowDialog';
import AutoLayoutButton from '../components/buttons/AutoLayoutButton';
import { calculateNodeDimensions } from '../utils/nodeDimensions';
// import ChatButton from '../components/buttons/ChatButton';
import FlowCheckButton from '../components/buttons/FlowCheckButton';
import { tokenService } from '../services/TokenService';

// 內部 ReactFlow 組件，使用 useReactFlow hook
const ReactFlowWithControls = forwardRef(
  (
    {
      nodes,
      edges,
      onNodesChange,
      onEdgesChange,
      onConnect,
      onNodesDelete,
      nodeTypes,
      edgeTypes,
      defaultViewport,
      onSelectionChange,
      onInit,
      onDrop,
      onDragOver,
      sidebarVisible,
      isLocked = false,
      runhistory = false
    },
    ref
  ) => {
    const reactFlowInstance = useReactFlow();

    const zoomConfig = useMemo(
      () => ({
        minZoom: 0.1, // 最小縮放
        maxZoom: 1.5, // 最大縮放
        padding: 0.15, // fit view 邊距
        duration: 800 // 動畫時長
      }),
      []
    );

    // 根據 sidebar 狀態計算動態 padding
    const getDynamicPadding = useCallback(() => {
      if (!reactFlowInstance) return zoomConfig.padding;

      const container = reactFlowInstance.getViewport();
      const containerWidth = window.innerWidth;
      const sidebarWidth = 272; // 17rem = 272px (根據你的 left: '17rem')

      if (sidebarVisible && !runhistory) {
        // sidebar 顯示時,左側需要更多 padding
        const leftPaddingRatio = sidebarWidth / containerWidth;

        return {
          top: zoomConfig.padding,
          right: zoomConfig.padding,
          bottom: zoomConfig.padding,
          left: leftPaddingRatio + zoomConfig.padding // 左側加上 sidebar 寬度比例
        };
      }

      // sidebar 隱藏時,使用統一 padding
      return zoomConfig.padding;
    }, [sidebarVisible, runhistory, reactFlowInstance, zoomConfig.padding]);

    const fitViewToNodes = useCallback(
      (padding, maxZoom, duration) => {
        if (!reactFlowInstance) {
          console.warn('ReactFlow 實例尚未初始化,無法自動縮放畫布');
          return;
        }

        try {
          reactFlowInstance.fitView({
            padding: padding ?? zoomConfig.padding,
            maxZoom: maxZoom ?? zoomConfig.maxZoom,
            minZoom: zoomConfig.minZoom,
            duration: duration ?? zoomConfig.duration,
            includeHiddenNodes: false
          });
        } catch (error) {
          console.error('自動縮放畫布時發生錯誤:', error);
        }
      },
      [reactFlowInstance, zoomConfig]
    );

    const isEditDisabled = isLocked || runhistory;

    // 根據sidebar狀態計算controls的樣式
    const controlsStyle = useMemo(() => {
      return {
        left: sidebarVisible && !runhistory ? '17rem' : '10px', // 如果sidebar顯示，將controls向右移動
        transition: 'left 0.3s ease' // 添加過渡效果使移動更平滑
      };
    }, [sidebarVisible, runhistory]);

    return (
      <>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={isEditDisabled ? () => {} : onNodesChange} // 鎖定時禁用節點變更
          onEdgesChange={isEditDisabled ? () => {} : onEdgesChange} // 鎖定時禁用邊緣變更
          onConnect={isEditDisabled ? () => {} : onConnect} // 鎖定時禁用連接
          onNodesDelete={isEditDisabled ? () => {} : onNodesDelete} // 鎖定時禁用節點刪除
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultViewport={defaultViewport}
          onSelectionChange={onSelectionChange}
          deleteKeyCode={isEditDisabled ? [] : ['Backspace', 'Delete']} // 鎖定時禁用刪除鍵
          onInit={onInit}
          onDrop={isEditDisabled ? () => {} : onDrop} // 鎖定時禁用拖放
          onDragOver={isEditDisabled ? () => {} : onDragOver} // 鎖定時禁用拖放
          nodesDraggable={!isEditDisabled} // 鎖定時節點不可拖拽
          nodesConnectable={!isEditDisabled} // 鎖定時節點不可連接
          elementsSelectable={!isEditDisabled} // 鎖定時元素不可選擇
          proOptions={{ hideAttribution: true }}
          // 統一配置縮放範圍
          minZoom={zoomConfig.minZoom}
          maxZoom={zoomConfig.maxZoom}
          fitViewOptions={{
            padding: zoomConfig.padding,
            maxZoom: zoomConfig.maxZoom,
            minZoom: zoomConfig.minZoom,
            duration: zoomConfig.duration
          }}>
          <MiniMap />
          <Controls
            style={controlsStyle}
            showFitView={false}
          />{' '}
          {/* 使用動態樣式控制位置 */}
          <Background />
          {/* 添加縮放視圖按鈕 */}
          <Panel position='bottom-right'>
            <button
              className='bg-white p-2 rounded-md shadow-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300'
              onClick={() => fitViewToNodes(0.1)}
              title='縮放視圖以顯示所有節點'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'>
                <path d='M15 3h6v6'></path>
                <path d='M9 21H3v-6'></path>
                <path d='M21 3l-7 7'></path>
                <path d='M3 21l7-7'></path>
              </svg>
            </button>
          </Panel>
        </ReactFlow>
      </>
    );
  }
);

// 添加節點類型轉換函數
const getReactFlowNodeType =
  ((sidebarNodeType) => {
    const typeMapping = {
      input: 'customInput',
      ai: 'aiCustomInput',
      'browser extension input': 'browserExtensionInput',
      'browser extension output': 'browserExtensionOutput',
      'knowledge retrieval': 'knowledgeRetrieval',
      end: 'end',
      webhook: 'webhook',
      http_request: 'httpRequest',
      event: 'event',
      timer: 'timer',
      line_webhook_input: 'line_webhook_input',
      line_send_message: 'line_send_message',
      extract_data: 'extract_data',
      aim_ml: 'aim_ml',
      schedule_trigger: 'schedule_trigger',
      webhook_input: 'webhook_input',
      webhook_output: 'webhook_output',
      combine_text: 'combine_text',
      router_switch: 'router_switch',
      speech_to_text: 'speech_to_text'
    };

    return typeMapping[sidebarNodeType] || 'default';
  },
  []);

// 全局狀態管理 - 在組件外部定義，避免組件重新掛載時重置
let globalNodeListLoaded = false;
let globalNodeListPromise = null;
let globalNodeListData = null;

// 清理全局狀態的函數
const resetGlobalNodeListState = () => {
  globalNodeListLoaded = false;
  globalNodeListPromise = null;
  globalNodeListData = null;
};

// 使用 forwardRef 將 FlowEditor 包裝起來，使其可以接收 ref
const FlowEditor = forwardRef(
  (
    {
      initialTitle,
      onTitleChange,
      runhistory = false,
      runHistorySnapshot = null
    },
    ref
  ) => {
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const reactFlowControlsRef = useRef(null);
    const isInitialized = useRef(false);
    const [isSaving, setIsSaving] = useState(false); // 添加保存狀態
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [isLocked, setIsLocked] = useState(false);

    // 使用 useMemo 記憶化 nodeTypes 和 edgeTypes，這樣它們在每次渲染時保持穩定
    const nodeTypes = useMemo(() => enhancedNodeTypes, []);
    const edgeTypes = useMemo(() => ({ 'custom-edge': CustomEdge }), []);

    // 使用 useMemo 記憶化 defaultViewport
    const defaultViewport = useMemo(() => ({ x: 0, y: 0, zoom: 1.3 }), []);

    // 新增節點清單相關的狀態
    const [nodeList, setNodeList] = useState([]);
    const [nodeListLoading, setNodeListLoading] = useState(true);
    const [nodeListError, setNodeListError] = useState(null);

    const [validationFailures, setValidationFailures] = useState([]);

    const {
      nodes,
      edges,
      onNodesChange,
      onEdgesChange,
      onConnect,
      onNodesDelete,
      handleAddNode,
      handleAddInputNode,
      handleAddAINode,
      handleAddBrowserExtensionOutput,
      handleAddBrowserExtensionInput,
      updateNodeFunctions,
      handleAddIfElseNode,
      handleAddKnowledgeRetrievalNode,
      handleAddEndNode,
      handleAddWebhookNode,
      handleAddHttpRequestNode,
      handleAddEventNode,
      handleAddTimerNode,
      handleAddLineNode,
      handleAddLineMessageNode,
      handleAddExtractDataNode,
      handleAddQOCAAimNode,
      handleAddScheduleTriggerNode,
      handleAddWebhookInputNode,
      handleAddWebhookOutputNode,
      handleAddCombineTextNode,
      handleNodeSelection,
      handleAddRouterSwitchNode,
      handleAddSpeechToTextNode,
      undo,
      redo,
      setNodes: setFlowNodes,
      setEdges: setFlowEdges,
      getNodeCallbacks,
      handleAutoLayout,
      startWorkflowLoading,
      finishWorkflowLoading
    } = useFlowNodes();

    // 儲存流程元資料
    const [flowMetadata, setFlowMetadata] = useState({
      id: null,
      title: initialTitle || '',
      lastSaved: null,
      version: 1
    });

    // 在 FlowEditor 組件中添加保存對話框狀態和處理函數
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [saveDialogCallback, setSaveDialogCallback] = useState(null);

    // 檢查是否在 iframe 中
    const isInIframe = useMemo(() => {
      try {
        return window.self !== window.top;
      } catch {
        return true;
      }
    }, []);

    // 處理 Run History Snapshot 的 useEffect
    useEffect(() => {
      if (runHistorySnapshot && runhistory) {
        try {
          // 使用新的轉換方法
          const { nodes: transformedNodes, edges: transformedEdges } =
            WorkflowDataConverter.transformRunHistoryToReactFlowFormat(
              runHistorySnapshot
            );
          // 為載入的節點重新添加回調函數(雖然是唯讀,但某些組件可能需要這些函數來正常渲染)
          const nodesWithCallbacks = transformedNodes.map((node) => {
            const nodeCallbacks = getNodeCallbacks(node.id, node.type);

            return {
              ...node,
              data: {
                ...node.data,
                ...nodeCallbacks,
                // 確保唯讀標記
                isReadOnly: true
              }
            };
          });

          // 設置節點和連線
          setFlowNodes(nodesWithCallbacks);
          setFlowEdges(transformedEdges);

          // 延遲執行畫布縮放以顯示所有節點
          setTimeout(() => {
            if (
              reactFlowControlsRef.current &&
              reactFlowControlsRef.current.fitViewToNodes
            ) {
              reactFlowControlsRef.current.fitViewToNodes(0.1, 1.5, 800);
            }
          }, 500);
        } catch (error) {
          console.error('載入 Run History Snapshot 時發生錯誤:', error);
          // setError('無法載入執行歷史快照');
        }
      }
    }, [runHistorySnapshot]);

    // loadNodeList 方法 -使用全局狀態
    const loadNodeList = useCallback(async () => {
      const loadId = Date.now();

      // 如果已經在載入中，返回同一個 Promise
      if (globalNodeListPromise) {
        return globalNodeListPromise;
      }

      // 如果已經載入完成，直接使用緩存的數據
      if (globalNodeListLoaded && globalNodeListData) {
        setNodeList(globalNodeListData);
        setNodeListLoading(false);
        setNodeListError(null);
        return globalNodeListData;
      }

      // 檢查 localStorage 緩存
      const cacheKey = 'nodeListCache';
      const cacheTimeKey = 'nodeListCacheTime';
      const cacheExpiry = 5 * 1000; // 5秒緩存

      try {
        const cached = localStorage.getItem(cacheKey);
        const cacheTime = localStorage.getItem(cacheTimeKey);

        if (cached && cacheTime) {
          const isExpired = Date.now() - parseInt(cacheTime) > cacheExpiry;
          if (!isExpired) {
            const cachedData = JSON.parse(cached);
            setNodeList(cachedData);
            setNodeListLoading(false);
            setNodeListError(null);
            globalNodeListLoaded = true;
            globalNodeListData = cachedData;
            return cachedData;
          } else {
            console.warn(`[${loadId}] 緩存已過期，重新載入`);
          }
        }
      } catch (error) {
        console.warn(`[${loadId}] 讀取緩存失敗:`, error);
      }

      // 創建載入 Promise
      globalNodeListPromise = (async () => {
        try {
          setNodeListLoading(true);
          setNodeListError(null);

          const nodeListData = await workflowAPIService.getNodeList();
          // 更新狀態
          setNodeList(nodeListData);
          globalNodeListLoaded = true;
          globalNodeListData = nodeListData;

          // 緩存結果
          try {
            localStorage.setItem(cacheKey, JSON.stringify(nodeListData));
            localStorage.setItem(cacheTimeKey, Date.now().toString());
          } catch (error) {
            console.warn(`[${loadId}] 緩存節點清單失敗:`, error);
          }

          return nodeListData;
        } catch (error) {
          console.error(`[${loadId}] 載入節點清單失敗:`, error);
          setNodeListError(error.message || '載入節點清單失敗');

          // 設定預設節點清單作為備用
          const defaultNodeList = [];
          setNodeList(defaultNodeList);
          globalNodeListData = defaultNodeList;

          throw error;
        } finally {
          setNodeListLoading(false);
          globalNodeListPromise = null; // 重置 Promise
        }
      })();

      return globalNodeListPromise;
    }, []);

    // 改進的 useEffect - 只在組件掛載時執行一次
    useEffect(() => {
      if (!isInIframe) {
        const effectId = Date.now();

        // 如果全局狀態顯示已載入且有數據，直接使用
        if (globalNodeListLoaded && globalNodeListData) {
          setNodeList(globalNodeListData);
          setNodeListLoading(false);
          setNodeListError(null);
          return;
        }

        // 如果沒有正在進行的請求，開始載入
        if (!globalNodeListPromise) {
          loadNodeList().catch((error) => {
            console.error(`[${effectId}] useEffect 中載入節點清單失敗:`, error);
          });
        } else {
          globalNodeListPromise
            .then((data) => {
              if (data) {
                setNodeList(data);
                setNodeListLoading(false);
                setNodeListError(null);
              }
            })
            .catch((error) => {
              console.error(`[${effectId}] 等待中的載入請求失敗:`, error);
            });
        }
      }
    }, []); // 空依賴數組確保只在掛載時執行一次

    // 組件卸載時的清理 - 可選的清理策略
    useEffect(() => {
      return () => {
        console.log('FlowEditor 組件卸載');
        // 如果需要在每次組件卸載時清理全局狀態，取消註釋下面的行
        // resetGlobalNodeListState();
      };
    }, []);

    // 切換側邊欄顯示狀態
    const toggleSidebar = useCallback(() => {
      setSidebarVisible((prev) => !prev);
    }, []);

    // 添加一個內部方法來處理工作流加載
    const handleLoadWorkflow = useCallback(async (flowId) => {
      try {
        // 呼叫已經在 useImperativeHandle 中定義的 loadWorkflow 方法
        const success = await loadWorkflowImpl(flowId);
        return success;
      } catch (error) {
        console.error('無法載入工作流:', error);
        window.notify({
          message: '載入工作流失敗',
          type: 'error',
          duration: 2000
        });
        return false;
      }
    }, []);

    // 實現 loadWorkflow 的邏輯，這將在 useImperativeHandle 中被引用
    const loadWorkflowImpl = async (flowId) => {
      tokenService.setWorkflowId(flowId);
      if (flowId !== 'new') {
        try {
          // 在開始載入前暫停清理功能
          if (startWorkflowLoading) {
            startWorkflowLoading();
          }

          const response = await workflowAPIService.loadWorkflow(flowId);
          const apiData = response.data || response;
          // eslint-disable-next-line no-prototype-builtins
          if (apiData.hasOwnProperty('is_locked')) {
            setIsLocked(apiData.is_locked);
          }

          // 處理驗證失敗
          if (apiData && apiData.failures && apiData.failures.length > 0) {
            setValidationFailures(apiData.failures);
          } else {
            setValidationFailures([]);
          }

          const { nodes: transformedNodes, edges: transformedEdges } =
            WorkflowDataConverter.transformToReactFlowFormat(apiData);

          // 為載入的節點重新添加回調函數
          const nodesWithCallbacks = transformedNodes.map((node) => {
            const nodeCallbacks = getNodeCallbacks(node.id, node.type);

            if (node.type === 'combine_text') {
              return {
                ...node,
                data: {
                  ...node.data,
                  textToCombine: node.data.textToCombine || '',
                  editorHtmlContent: node.data.editorHtmlContent || '',
                  activeTab: node.data.activeTab || 'editor',
                  inputHandles: node.data.inputHandles || [{ id: 'text' }],
                  ...nodeCallbacks
                }
              };
            }

            return {
              ...node,
              data: {
                ...node.data,
                ...nodeCallbacks
              }
            };
          });

          // 同時設置節點和邊緣，避免中間狀態
          setFlowNodes(nodesWithCallbacks);
          setFlowEdges(transformedEdges);

          // 確保所有設置完成後再恢復清理功能
          setTimeout(() => {
            debugBrowserExtensionOutput(transformedNodes, transformedEdges);

            setFlowMetadata((prev) => ({
              ...prev,
              id: apiData.flow_id,
              title: apiData.flow_name || prev.flow_name,
              version: apiData.version || prev.version
            }));

            if (typeof window !== 'undefined') {
              window.currentFlowId = apiData.flow_id;
            }

            console.log('載入工作流後立即更新節點函數...');

            // 延遲更新節點函數和視圖縮放
            setTimeout(() => {
              console.log('載入工作流後再次確認節點函數...');
              updateNodeFunctions();

              if (
                reactFlowControlsRef.current &&
                reactFlowControlsRef.current.fitViewToNodes
              ) {
                console.log('載入工作流後，執行一次畫布縮放以顯示所有節點...');
                reactFlowControlsRef.current.fitViewToNodes(0.1, 1.5, 800);
              }

              // 所有操作完成後恢復清理功能
              if (finishWorkflowLoading) {
                finishWorkflowLoading();
              }
            }, 500);
          }, 100);

          window.notify({
            message: '工作流載入成功',
            type: 'success',
            duration: 2000
          });

          return true;
        } catch (error) {
          console.error('載入工作流失敗:', error);

          // 載入失敗時也要恢復清理功能
          if (finishWorkflowLoading) {
            finishWorkflowLoading();
          }

          window.notify({
            message: '載入工作流失敗',
            type: 'error',
            duration: 2000
          });
          return false;
        }
      }
    };

    const handleLockToggle = useCallback(
      async (newLockState) => {
        // 檢查是否有有效的 flow ID
        if (!flowMetadata.id || flowMetadata.id === 'new') {
          return;
        }

        try {
          // 調用 API 切換鎖定狀態
          await workflowAPIService.toggleWorkflowLock(
            flowMetadata.id,
            newLockState
          );

          // 更新本地狀態
          setIsLocked(newLockState);
        } catch (error) {
          console.error('切換鎖定狀態失敗:', error);
          window.notify({
            message: '切換鎖定狀態失敗',
            type: 'error',
            duration: 3000
          });
        }
      },
      [flowMetadata.id]
    );

    // 向父組件暴露方法
    useImperativeHandle(ref, () => ({
      // 導出流程數據的方法
      exportFlowData: () => {
        return {
          id: flowMetadata.id || `flow_${Date.now()}`,
          title: flowMetadata.title || '未命名流程',
          version: flowMetadata.version || 1,
          nodes,
          edges,
          metadata: {
            lastModified: new Date().toISOString(),
            savedAt: new Date().toISOString(),
            nodeCount: nodes.length,
            edgeCount: edges.length
          }
        };
      },
      // 設置流程標題的方法
      setFlowTitle: (title) => {
        if (title && typeof title === 'string') {
          setFlowMetadata((prev) => ({ ...prev, title }));
          return true;
        }
        return false;
      },
      setFlowId: (flowId) => {
        if (flowId && typeof flowId === 'string') {
          setFlowMetadata((prev) => ({ ...prev, flowId }));
          return true;
        }
        return false;
      },
      loadWorkflow: loadWorkflowImpl,
      // saveWorkflow 方法
      saveWorkflow: saveToServer,
      // 暴露 fitViewToNodes 方法給父組件
      fitViewToNodes: () => {
        if (
          reactFlowControlsRef.current &&
          reactFlowControlsRef.current.fitViewToNodes
        ) {
          reactFlowControlsRef.current.fitViewToNodes();
        }
      },
      // 暴露重新載入節點清單的方法
      reloadNodeList: () => {
        console.log('手動重新載入節點清單');
        resetGlobalNodeListState();
        return loadNodeList();
      },
      toggleLock: handleLockToggle,
      getIsLocked: () => isLocked,
      focusNode: (nodeId) => {
        if (!reactFlowInstance) {
          console.warn('ReactFlow 實例尚未初始化');
          return;
        }

        try {
          // 獲取節點
          const node = reactFlowInstance.getNode(nodeId);
          if (!node) {
            console.warn(`找不到節點: ${nodeId}`);
            return;
          }

          // 設定視口中心到節點位置
          const x = node.position.x + (node.width || 150) / 2;
          const y = node.position.y + (node.height || 50) / 2;

          // 使用動畫移動到節點位置
          reactFlowInstance.setCenter(x, y, {
            zoom: 1.2, // 適當的縮放等級
            duration: 800 // 動畫時長
          });

          const allNodes = reactFlowInstance.getNodes();
          const updatedNodes = allNodes.map((n) => ({
            ...n,
            selected: n.id === nodeId // 只選中目標節點
          }));

          reactFlowInstance.setNodes(updatedNodes);
        } catch (error) {
          console.error('聚焦節點時發生錯誤:', error);
        }
      }
    }));

    useEffect(() => {
      // 設置全局 currentFlowId，供 CombineTextNode 使用
      if (typeof window !== 'undefined') {
        window.currentFlowId = flowMetadata.id;
      }

      // 清理函數
      return () => {
        if (typeof window !== 'undefined') {
          delete window.currentFlowId;
        }
      };
    }, [flowMetadata.id]);

    // 在首次渲染時初始化節點函數
    useEffect(() => {
      if (!isInitialized.current) {
        if (updateNodeFunctions) {
          updateNodeFunctions();
        }
        isInitialized.current = true;
      }
    }, [updateNodeFunctions]);

    // 處理標題變更
    const handleTitleChange = useCallback(
      (title) => {
        if (isLocked || runhistory) return; // 鎖定時不允許修改標題
        setFlowMetadata((prev) => ({ ...prev, title }));

        // 如果提供了標題變更回調函數，則呼叫它
        if (onTitleChange && typeof onTitleChange === 'function') {
          onTitleChange(title);
        }
      },
      [onTitleChange, isLocked]
    );

    // 修改輔助函數，添加節點類型參數
    const getViewportCenterPosition = useCallback(
      (nodeType) => {
        if (!reactFlowInstance) {
          return { x: 400, y: 300 }; // 預設位置
        }

        try {
          // 獲取視窗中心的流程座標
          let centerPosition;

          // 方法1: 使用 screenToFlowPosition
          const reactFlowBounds =
            reactFlowWrapper.current?.getBoundingClientRect();
          if (reactFlowBounds) {
            const centerX = reactFlowBounds.left + reactFlowBounds.width / 2;
            const centerY = reactFlowBounds.top + reactFlowBounds.height / 2;

            centerPosition = reactFlowInstance.screenToFlowPosition({
              x: centerX,
              y: centerY
            });
          } else {
            // 方法2: 使用 viewport 計算
            const viewport = reactFlowInstance.getViewport();
            const containerWidth = reactFlowWrapper.current?.clientWidth || 800;
            const containerHeight =
              reactFlowWrapper.current?.clientHeight || 600;

            centerPosition = {
              x: (-viewport.x + containerWidth / 2) / viewport.zoom,
              y: (-viewport.y + containerHeight / 2) / viewport.zoom
            };
          }

          // 計算節點尺寸
          const nodeDimensions = calculateNodeDimensions({
            type: nodeType,
            data: {} // 使用預設數據來計算基本尺寸
          });

          // 將節點中心對齊到視窗中心
          // 節點左上角位置 = 視窗中心位置 - 節點尺寸的一半
          const adjustedPosition = {
            x: centerPosition.x - nodeDimensions.width / 2,
            y: centerPosition.y - nodeDimensions.height / 2
          };

          return adjustedPosition;
        } catch (error) {
          console.error('計算視窗中心位置失敗:', error);
          return { x: 400, y: 300 };
        }
      },
      [reactFlowInstance]
    );

    // 處理從側邊欄選擇的節點類型，加入位置參數支援拖放
    const handleNodeTypeSelection = useCallback(
      (nodeTypeOrOperator, position = null) => {
        if (isLocked || runhistory) return;

        // 使用提供的位置（拖拽）或視窗中心位置（點擊）
        let nodePosition = position;

        // 如果沒有提供位置（點擊側邊欄），計算置中位置
        if (!position && reactFlowInstance) {
          try {
            // 取得視窗中心位置
            const reactFlowBounds =
              reactFlowWrapper.current?.getBoundingClientRect();
            if (reactFlowBounds) {
              const centerX = reactFlowBounds.left + reactFlowBounds.width / 2;
              const centerY = reactFlowBounds.top + reactFlowBounds.height / 2;

              const centerPosition = reactFlowInstance.screenToFlowPosition({
                x: centerX,
                y: centerY
              });

              // 根據節點類型取得對應的 ReactFlow 類型
              const reactFlowNodeType =
                getReactFlowNodeType(nodeTypeOrOperator);

              // 計算節點尺寸
              const nodeDimensions = calculateNodeDimensions({
                type: reactFlowNodeType,
                data: {}
              });

              // 調整位置，讓節點中心對齊視窗中心
              nodePosition = {
                x: centerPosition.x - nodeDimensions.width / 2,
                y: centerPosition.y - nodeDimensions.height / 2
              };
            }
          } catch (error) {
            console.error('計算置中位置失敗:', error);
            nodePosition = { x: 400, y: 300 };
          }
        }

        // 支援原有的節點類型名稱和新的 operator 名稱
        const nodeType = nodeTypeOrOperator;

        switch (nodeType) {
          case 'basic_input':
          case 'input':
            handleAddInputNode(nodePosition);
            break;
          case 'ask_ai':
          case 'ai':
            handleAddAINode(nodePosition);
            break;
          case 'if/else':
            handleAddIfElseNode(nodePosition);
            break;
          case 'browser_extension_input':
          case 'browser extension input':
            handleAddBrowserExtensionInput(nodePosition);
            break;
          case 'browser_extension_output':
          case 'browser extension output':
            handleAddBrowserExtensionOutput(nodePosition);
            break;
          case 'knowledge_retrieval':
          case 'knowledge retrieval':
            handleAddKnowledgeRetrievalNode(nodePosition);
            break;
          case 'end':
            handleAddEndNode(nodePosition);
            break;
          case 'webhook':
            handleAddWebhookNode(nodePosition);
            break;
          case 'http_request':
            handleAddHttpRequestNode(nodePosition);
            break;
          case 'event':
            handleAddEventNode(nodePosition);
            break;
          case 'timer':
            handleAddTimerNode(nodePosition);
            break;
          case 'line_webhook_input':
            handleAddLineNode(nodePosition);
            break;
          case 'line_send_message':
            handleAddLineMessageNode(nodePosition);
            break;
          case 'extract_data':
            handleAddExtractDataNode(nodePosition);
            break;
          case 'aim_ml':
            handleAddQOCAAimNode(nodePosition);
            break;
          case 'schedule_trigger':
            handleAddScheduleTriggerNode(nodePosition);
            break;
          case 'webhook_input':
            handleAddWebhookInputNode(nodePosition);
            break;
          case 'webhook_output':
            handleAddWebhookOutputNode(nodePosition);
            break;
          case 'combine_text':
            handleAddCombineTextNode(nodePosition);
            break;
          case 'router_switch':
            handleAddRouterSwitchNode(nodePosition);
            break;
          case 'speech_to_text':
            handleAddSpeechToTextNode(nodePosition);
            break;
          default:
            handleAddNode(nodePosition);
        }
      },
      [
        handleAddInputNode,
        handleAddAINode,
        handleAddIfElseNode,
        handleAddBrowserExtensionInput,
        handleAddBrowserExtensionOutput,
        handleAddKnowledgeRetrievalNode,
        handleAddEndNode,
        handleAddWebhookNode,
        handleAddHttpRequestNode,
        handleAddEventNode,
        handleAddTimerNode,
        handleAddLineNode,
        handleAddLineMessageNode,
        handleAddExtractDataNode,
        handleAddQOCAAimNode,
        handleAddNode,
        handleAddScheduleTriggerNode,
        handleAddWebhookInputNode,
        handleAddWebhookOutputNode,
        handleAddCombineTextNode,
        handleAddRouterSwitchNode,
        handleAddSpeechToTextNode,
        reactFlowInstance,
        isLocked,
        runhistory
      ]
    );

    // Drag and drop implementation
    const onDragOver = useCallback(
      (event) => {
        if (isLocked || runhistory) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        // Optional: Add visual feedback
        if (reactFlowWrapper.current) {
          reactFlowWrapper.current.classList.add('drag-over');
        }
      },
      [isLocked, runhistory]
    );

    const onDrop = useCallback(
      (event) => {
        if (isLocked || runhistory) return;
        event.preventDefault();

        if (!reactFlowInstance) return;

        const type = event.dataTransfer.getData('application/reactflow');

        if (typeof type === 'undefined' || !type) {
          return;
        }

        // Get the position where the node is dropped
        const reactFlowBounds =
          reactFlowWrapper.current.getBoundingClientRect();
        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top
        });

        // Call the appropriate handler based on node type
        handleNodeTypeSelection(type, position);

        // Clean up visual feedback
        if (reactFlowWrapper.current) {
          reactFlowWrapper.current.classList.remove('drag-over');
        }
      },
      [reactFlowInstance, handleNodeTypeSelection, isLocked, runhistory]
    );

    const onDragStart = useCallback(
      (event, nodeType) => {
        if (isLocked || runhistory) return;
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
      },
      [isLocked, runhistory]
    );

    /**
     * 將流程資料儲存到本地檔案
     */
    const saveToLocalFile = useCallback(async () => {
      try {
        // 準備要儲存的資料
        const flowData = {
          id: flowMetadata.id || `flow_${Date.now()}`,
          title: flowMetadata.title || '未命名流程',
          version: flowMetadata.version || 1,
          nodes,
          edges,
          metadata: {
            lastModified: new Date().toISOString(),
            savedAt: new Date().toISOString(),
            nodeCount: nodes.length,
            edgeCount: edges.length
          }
        };

        // 根據標題和日期產生檔案名稱
        const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const safeTitle = (flowMetadata.title || '未命名_流程').replace(
          /\s+/g,
          '_'
        );
        const filename = `${safeTitle}_${date}.json`;

        // 儲存檔案
        const result = await FileIOService.saveToFile(flowData, filename);

        if (result.success) {
          console.log(`檔案已儲存為：${result.filename}`);
          window.notify({
            message: `已儲存到 ${result.filename}`,
            type: 'success',
            duration: 2000
          });

          // 更新元資料
          setFlowMetadata({
            ...flowMetadata,
            title: flowMetadata.title || '未命名流程',
            lastSaved: new Date().toISOString(),
            version: (flowMetadata.version || 0) + 1
          });
        }

        return result;
      } catch (error) {
        console.error('儲存檔案時發生錯誤：', error);
        window.notify({
          message: '無法儲存檔案，請稍後再試',
          type: 'error',
          duration: 3000
        });
        throw error;
      }
    }, [nodes, edges, flowMetadata]);

    /**
     * 將流程數據發送給父頁面以觸發下載
     */
    const sendDataForDownload = useCallback(async () => {
      if (!isInIframe) {
        // 如果不在 iframe 中，直接使用本地下載
        return saveToLocalFile();
      }

      try {
        // 準備要發送的數據
        const flowData = {
          id: flowMetadata.id || `flow_${Date.now()}`,
          title: flowMetadata.title || '未命名流程',
          version: flowMetadata.version || 1,
          nodes,
          edges,
          metadata: {
            lastModified: new Date().toISOString(),
            savedAt: new Date().toISOString(),
            nodeCount: nodes.length,
            edgeCount: edges.length
          }
        };

        // 根據標題和日期產生檔案名稱
        const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const safeTitle = (flowMetadata.title || '未命名_流程').replace(
          /\s+/g,
          '_'
        );
        const filename = `${safeTitle}_${date}.json`;

        // 使用 IFrameBridgeService 發送下載請求
        const result = iframeBridge.requestDownload(flowData, filename);

        if (result) {
          window.notify({
            message: `已發送下載請求`,
            type: 'success',
            duration: 2000
          });
        } else {
          window.notify({
            message: '發送下載請求失敗',
            type: 'error',
            duration: 3000
          });
        }

        return { success: result };
      } catch (error) {
        console.error('準備下載數據時發生錯誤：', error);
        window.notify({
          message: '無法發送下載請求，請稍後再試',
          type: 'error',
          duration: 3000
        });
        throw error;
      }
    }, [nodes, edges, flowMetadata, isInIframe, saveToLocalFile]);

    // 修改保存函數來設置保存狀態
    const saveToServer = useCallback(async () => {
      if (isLocked || runhistory) return;

      // 檢查是否為 create 模式且沒有 title
      const isCreateMode = !flowMetadata.id || flowMetadata.id === 'new';
      const isTitleValid =
        flowMetadata.title && flowMetadata.title.trim().length > 0;

      // 如果是 create 模式且沒有 title，顯示對話框
      if (isCreateMode && !isTitleValid) {
        setShowSaveDialog(true);
        return;
      }

      // 設置保存中狀態
      setIsSaving(true);

      try {
        // 檢查保存前的連線
        debugConnections(edges, '保存前');
        // 重要：在轉換前檢查所有 BrowserExtensionOutput 節點的資料完整性
        nodes.forEach((node) => {
          if (node.type === 'combine_text') {
            console.log(`保存前檢查 Combine Text 節點 ${node.id}:`, {
              textToCombine: node.data.textToCombine,
              editorHtmlContent: node.data.editorHtmlContent,
              activeTab: node.data.activeTab,
              inputHandles: node.data.inputHandles
            });
          }
          if (node.type === 'browserExtensionOutput') {
            console.log(`保存前檢查節點 ${node.id}:`, {
              inputHandles: node.data.inputHandles || [],
              node_input: node.data.node_input || {}
            });

            // 確保 inputHandles 和 node_input 同步
            if (node.data.inputHandles && node.data.node_input) {
              const handleMismatch = node.data.inputHandles.some(
                (handle) => !node.data.node_input[handle.id]
              );

              if (handleMismatch) {
                console.warn(
                  `節點 ${node.id} 的 inputHandles 和 node_input 不同步`
                );
              }
            }
          }
        });
        const flowData = {
          id: flowMetadata.id || `flow_${Date.now()}`,
          title: flowMetadata.title || '未命名流程',
          version: flowMetadata.version || 1,
          nodes,
          edges,
          metadata: {
            lastModified: new Date().toISOString(),
            savedAt: new Date().toISOString(),
            nodeCount: nodes.length,
            edgeCount: edges.length
          }
        };

        const apiData = WorkflowDataConverter.convertReactFlowToAPI(flowData);
        debugAINodeConnections(nodes, edges);
        debugAINodeAPIData(apiData);
        // 添加調試代碼
        if (apiData && apiData.flow_pipeline) {
          debugNodeInputsBeforeSave(apiData.flow_pipeline);
        }

        // 根據是否有 flow_id 決定使用 POST 還是 PUT
        let response;
        let flowIdToUse = flowMetadata.id || null; // 新增變數來捕獲要使用的 flow_id
        if (flowMetadata.id) {
          // 更新現有流程
          response = await workflowAPIService.updateWorkflow(apiData);
          const responseData = response.data || response;
          // 處理驗證失敗
          if (
            responseData &&
            responseData.failures &&
            responseData.failures.length > 0
          ) {
            setValidationFailures(response.failures);
          } else {
            setValidationFailures([]);
          }

          window.notify({
            message: '流程更新成功',
            type: 'success',
            duration: 2000
          });

          setFlowMetadata((prev) => ({
            ...prev,
            lastSaved: new Date().toISOString()
          }));
        } else {
          // 創建新流程
          response = await workflowAPIService.createWorkflow(apiData);
          console.log('FlowEditor: 創建流程成功', response);

          if (
            response &&
            response.data &&
            response.data.failures &&
            response.data.failures.length > 0
          ) {
            setValidationFailures(response.data.failures);
          } else {
            setValidationFailures([]);
          }

          // 捕獲從後端回傳的 flow_id
          flowIdToUse = response?.data?.flow_id;
          // 如果後端回傳了 flow_id，更新流程元數據
          if (flowIdToUse) {
            setFlowMetadata((prev) => ({
              ...prev,
              id: flowIdToUse,
              lastSaved: new Date().toISOString()
            }));
          }

          // 檢查是否在 iframe 中運行
          const isInIframe = window.self !== window.top;

          // 如果在 iframe 中，觸發事件通知父頁面
          if (isInIframe) {
            console.log('在 iframe 中檢測到新創建的流程，發送事件到父窗口');

            try {
              // 使用 iframeBridge 發送 flowSaved 事件
              iframeBridge.sendToParent({
                type: 'FLOW_SAVED',
                flowId: flowIdToUse,
                success: true,
                title: flowMetadata.title || '未命名流程',
                isNewFlow: true,
                currentPath: window.location.pathname,
                isNewPath: window.location.pathname.includes('/new'),
                timestamp: new Date().toISOString()
              });
            } catch (error) {
              console.error('向父頁面發送事件失敗：', error);
            }
          }

          window.notify({
            message: '流程創建成功',
            type: 'success',
            duration: 2000
          });
        }

        // 使用捕獲的 flowIdToUse 而不是 flowMetadata.id
        if (flowIdToUse) {
          setTimeout(async () => {
            // 保存後再次檢查連線
            console.log('使用 flow_id 重新加載工作流:', flowIdToUse);
            await handleLoadWorkflow(flowIdToUse);
            debugConnections(edges, '保存後重新加載');
            debugAINodeConnections(nodes, edges);
          }, 1000);
        } else {
          console.warn('沒有可用的 flow_id，無法重新加載工作流');
        }

        return response;
      } catch (error) {
        console.error('FlowEditor: 儲存流程時發生錯誤：', error);
        window.notify({
          message: '無法儲存流程，請稍後再試',
          type: 'error',
          duration: 3000
        });

        throw error;
      } finally {
        // 無論成功或失敗，都重置保存狀態
        setIsSaving(false);
      }
    }, [isLocked, nodes, edges, flowMetadata, handleLoadWorkflow]);

    // 處理對話框中的保存操作
    const handleDialogSave = useCallback(
      async (flowName) => {
        if (isLocked) return;
        console.log(`對話框觸發的保存，流程名稱: ${flowName}`);
        console.log('當前 flowMetadata:', flowMetadata);

        setIsSaving(true); // 設置保存狀態

        try {
          // 立即創建包含新標題的 flowData，不依賴狀態更新
          const flowDataWithNewTitle = {
            id: flowMetadata.id || `flow_${Date.now()}`,
            title: flowName, // 直接使用對話框傳入的標題
            version: flowMetadata.version || 1,
            nodes,
            edges,
            metadata: {
              lastModified: new Date().toISOString(),
              savedAt: new Date().toISOString(),
              nodeCount: nodes.length,
              edgeCount: edges.length
            }
          };

          console.log('創建的 flowData:', flowDataWithNewTitle);

          // 將數據轉換為 API 格式
          const apiData =
            WorkflowDataConverter.convertReactFlowToAPI(flowDataWithNewTitle);

          console.log('轉換後的 API 數據:', apiData);
          console.log('API 中的 flow_name:', apiData.flow_name);

          // 直接調用 API
          let response;
          let flowIdToUse = flowMetadata.id || null;

          if (flowMetadata.id) {
            // 更新現有流程
            console.log('更新現有流程，flow_id:', flowMetadata.id);
            response = await workflowAPIService.updateWorkflow(apiData);
            console.log('更新流程成功:', response);

            window.notify({
              message: '流程更新成功',
              type: 'success',
              duration: 2000
            });
          } else {
            // 創建新流程
            response = await workflowAPIService.createWorkflow(apiData);

            flowIdToUse = response?.data?.flow_id;

            // 檢查是否在 iframe 中運行並發送事件
            const isInIframe = window.self !== window.top;
            if (isInIframe) {
              try {
                iframeBridge.sendToParent({
                  type: 'FLOW_SAVED',
                  flowId: flowIdToUse,
                  success: true,
                  title: flowName, // 使用正確的標題
                  isNewFlow: true,
                  currentPath: window.location.pathname,
                  isNewPath: window.location.pathname.includes('/new'),
                  timestamp: new Date().toISOString()
                });
              } catch (error) {
                console.error('向父頁面發送事件失敗：', error);
              }
            }

            window.notify({
              message: '流程創建成功',
              type: 'success',
              duration: 2000
            });
          }

          // 更新本地狀態（這次是在保存成功後更新）
          setFlowMetadata((prev) => {
            const newMetadata = {
              ...prev,
              id: flowIdToUse || prev.id,
              title: flowName, // 確保標題正確更新
              lastSaved: new Date().toISOString()
            };
            console.log('更新 flowMetadata:', newMetadata);
            return newMetadata;
          });

          // 關閉對話框
          setShowSaveDialog(false);

          // 如果有新的 flow_id，重新加載工作流
          if (flowIdToUse) {
            setTimeout(async () => {
              console.log('重新加載工作流:', flowIdToUse);
              await handleLoadWorkflow(flowIdToUse);
              // 執行回調函數
              if (saveDialogCallback) {
                const finalFlowId = flowIdToUse || flowMetadata.id;
                console.log('執行回調函數，flow_id:', finalFlowId);
                saveDialogCallback(finalFlowId);
                setSaveDialogCallback(null);
              }
            }, 1000);
          }

          return {
            success: true,
            flow_id: flowIdToUse || flowMetadata.id,
            ...response
          };
        } catch (error) {
          console.error('對話框觸發的保存失敗:', error);
          window.notify({
            message: '無法儲存流程，請稍後再試',
            type: 'error',
            duration: 3000
          });
          throw error;
        } finally {
          setIsSaving(false); // 重置保存狀態
        }
      },
      [
        nodes,
        edges,
        flowMetadata,
        saveDialogCallback,
        handleLoadWorkflow,
        isLocked
      ]
    );

    // 關閉保存對話框
    const closeSaveDialog = useCallback(() => {
      setShowSaveDialog(false);
      setSaveDialogCallback(null);
    }, []);

    // 顯示保存對話框的函數
    const showSaveFlowDialog = useCallback(
      (callback) => {
        if (isLocked) return;
        setSaveDialogCallback(() => callback); // 保存回調函數
        setShowSaveDialog(true);
      },
      [isLocked]
    );
    /**
     * 從本地檔案載入流程資料
     */
    const loadFromLocalFile = useCallback(async () => {
      try {
        // 開啟檔案對話框並讀取檔案
        const result = await FileIOService.readFromFile();

        if (result.success && result.data) {
          console.log('檔案已載入：', result.filename);
          window.notify({
            message: `已載入 ${result.filename}`,
            type: 'success',
            duration: 2000
          });

          // 驗證載入的資料是否具有所需的結構
          if (!result.data.nodes || !result.data.edges) {
            throw new Error('無效的流程檔案格式');
          }

          // 使用載入的資料更新流程
          setFlowNodes(result.data.nodes);
          setFlowEdges(result.data.edges);

          // 更新元資料
          setFlowMetadata({
            id: result.data.id || `flow_${Date.now()}`,
            title: result.data.title || '匯入的流程',
            lastSaved:
              result.data.metadata?.savedAt || new Date().toISOString(),
            version: result.data.version || 1
          });

          // 確保載入的節點已新增函數
          updateNodeFunctions();

          // 如果在 iframe 中，通知父頁面標題已變更
          if (isInIframe && onTitleChange) {
            onTitleChange(result.data.title || '匯入的流程');
          }

          // 載入完成後，執行一次畫布縮放以顯示所有節點
          setTimeout(() => {
            if (
              reactFlowControlsRef.current &&
              reactFlowControlsRef.current.fitViewToNodes
            ) {
              reactFlowControlsRef.current.fitViewToNodes();
            }
          }, 300);
        }

        return result;
      } catch (error) {
        console.error('載入檔案時發生錯誤：', error);
        window.notify({
          message: '無法載入檔案',
          type: 'error',
          duration: 3000
        });
        throw error;
      }
    }, [
      setFlowNodes,
      setFlowEdges,
      updateNodeFunctions,
      isInIframe,
      onTitleChange
    ]);

    // 處理來自 ReactFlow 的節點選擇
    const handleSelectionChange = useCallback(
      ({ nodes: selectedNodes }) => {
        if (selectedNodes && selectedNodes.length > 0) {
          // 選擇選取節點中的第一個節點
          handleNodeSelection(selectedNodes[0].id);
        }
      },
      [handleNodeSelection]
    );

    // 當 initialTitle 改變時更新流程元資料
    useEffect(() => {
      if (initialTitle) {
        setFlowMetadata((prev) => {
          // Only update if the title has changed
          if (prev.title !== initialTitle) {
            return { ...prev, title: initialTitle };
          }
          return prev;
        });
      }
    }, [initialTitle]); // Only depends on initialTitle
    useEffect(() => {
      // 監聽來自 Line 節點的保存請求
      const handleSaveRequest = (event) => {
        if (isLocked) return;
        console.log('收到來自 Line 節點的保存請求', event.detail);
        const { callback } = event.detail;

        if (flowMetadata.id) {
          // 如果已經有 flow_id，直接執行回調
          callback(flowMetadata.id);
        } else {
          // 如果沒有 flow_id，顯示保存對話框
          showSaveFlowDialog(callback);
        }
      };

      window.addEventListener('requestSaveFlow', handleSaveRequest);

      return () => {
        window.removeEventListener('requestSaveFlow', handleSaveRequest);
      };
    }, [flowMetadata.id, showSaveFlowDialog, isLocked]);

    // 格式化驗證失敗訊息
    const formatValidationErrors = useCallback((failures) => {
      if (!failures || failures.length === 0) return [];

      // 分離 flow 類型和 node 類型的錯誤
      const flowErrors = [];
      const nodeErrors = [];

      failures.forEach((failure) => {
        // 提取節點ID的最後幾位數字用於識別
        const nodeIdSuffix = failure.id ? failure.id.slice(-3) : '???';

        // 根據節點類型顯示友好名稱
        const nodeTypeNames = {
          router_switch: 'Router',
          webhook_output: 'Webhook Response',
          line_send_message: 'Line Message',
          aim_ml: 'QOCA aim',
          node_parameters_validation: '節點參數驗證'
        };

        const nodeName =
          nodeTypeNames[failure.details?.node_operator] ||
          nodeTypeNames[failure.name] ||
          failure.name ||
          '未知節點';

        // 合併錯誤訊息
        const errorMessage = failure.error_messages.join(' ');

        // 根據 failure_type 分類
        if (failure.failure_type === 'flow') {
          flowErrors.push(errorMessage);
        } else {
          // 節點級別的錯誤
          nodeErrors.push(`${nodeName} (${nodeIdSuffix}) ${errorMessage}`);
        }
      });

      // 將 flow 錯誤放在前面，node 錯誤放在後面
      return [...flowErrors, ...nodeErrors];
    }, []);

    const handleCheckWorkflow = useCallback(async () => {
      try {
        const flowData = {
          id: flowMetadata.id,
          title: flowMetadata.title || '未命名流程',
          version: flowMetadata.version || 1,
          nodes,
          edges,
          metadata: {
            lastModified: new Date().toISOString(),
            savedAt: new Date().toISOString(),
            nodeCount: nodes.length,
            edgeCount: edges.length
          }
        };

        const apiData = WorkflowDataConverter.convertReactFlowToAPI(flowData);

        const response = await workflowAPIService.checkWorkflow(apiData);

        const checkResult = response.data || response;

        // 處理驗證失敗
        if (
          checkResult &&
          checkResult.failures &&
          checkResult.failures.length > 0
        ) {
          setValidationFailures(checkResult.failures);
        } else {
          setValidationFailures([]);
        }

        return checkResult;
      } catch (error) {
        console.error('檢查工作流失敗:', error);
        throw error;
      }
    }, [
      flowMetadata.id,
      flowMetadata.title,
      flowMetadata.version,
      nodes,
      edges
    ]);
    return (
      <div
        className='relative w-full h-screen'
        style={{ height: 'calc(100vh - 64px)' }}>
        {/* APA Assistant at top */}
        <APAAssistant
          title={flowMetadata.title}
          onTitleChange={handleTitleChange}
          isLocked={isLocked || runhistory}
          runhistory={runhistory}
          isNew={(!flowMetadata.id || flowMetadata.id === 'new') && !runhistory}
          onLockToggle={handleLockToggle}
          flowId={flowMetadata.id}
        />

        {/* 添加通知系統 */}
        <Notification />

        {/* Full-screen ReactFlow wrapped in ReactFlowProvider */}
        <ReactFlowProvider>
          <div
            className='w-full h-full'
            ref={reactFlowWrapper}>
            <ReactFlowWithControls
              ref={reactFlowControlsRef}
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodesDelete={onNodesDelete}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              defaultViewport={defaultViewport}
              onSelectionChange={handleSelectionChange}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              sidebarVisible={sidebarVisible} // 將sidebar狀態傳遞給子組件
              isLocked={isLocked}
              runhistory={runhistory}
            />
          </div>
        </ReactFlowProvider>

        {/* Absolute positioned sidebar */}
        <div
          className={`absolute top-0 left-0 h-full transition-transform duration-300 transform ${
            sidebarVisible ? 'translate-x-0' : '-translate-x-full'
          }`}>
          {!runhistory && (
            <NodeSidebar
              handleButtonClick={handleNodeTypeSelection}
              onDragStart={onDragStart}
              nodes={nodes}
              nodeList={nodeList} // 傳遞節點清單
              isLoading={nodeListLoading} // 傳遞載入狀態
              onRetryLoad={loadNodeList} // 傳遞重新載入函數
              isLocked={isLocked}
            />
          )}

          {/* Sidebar toggle button */}
          {!runhistory && (
            <button
              className='absolute top-1/2 -right-6 bg-white border border-gray-300 rounded-r-md p-1 shadow-md'
              onClick={toggleSidebar}>
              {sidebarVisible ? (
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'>
                  <polyline points='15 18 9 12 15 6'></polyline>
                </svg>
              ) : (
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'>
                  <polyline points='9 18 15 12 9 6'></polyline>
                </svg>
              )}
            </button>
          )}
        </div>

        {/* Action buttons */}
        <div className='absolute top-4 right-4 z-10 flex flex-col items-end'>
          <div className='flex space-x-2'>
            {/* Separator */}
            {!runhistory && (
              <div className='flex bg-white border rounded-full shadow-md p-3 space-x-2'>
                {/* <LoadWorkflowButton onLoad={handleLoadWorkflow} /> */}
                {/* <ChatButton /> */}
                <FlowCheckButton
                  onClick={handleCheckWorkflow}
                  errors={formatValidationErrors(validationFailures)}
                  unreadCount={validationFailures.length - 1}
                />
                {/* Separator */}
                <div className='h-10 w-px bg-gray-300 self-center'></div>
                {/* Auto Layout Button */}
                <div className='ml-2'>
                  <AutoLayoutButton
                    onLayout={handleAutoLayout}
                    disabled={isSaving || nodes.length === 0 || isLocked}
                    isLocked={isLocked}
                  />
                </div>

                {/* Server save button */}
                <div className='ml-2'>
                  <SaveButton
                    onSave={saveToServer}
                    title={flowMetadata.title}
                    flowId={flowMetadata.id} // 傳入流程ID
                    disabled={isSaving}
                    isLocked={isLocked}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 保存流程對話框 - 添加在最後，確保 z-index 最高 */}
        <SaveFlowDialog
          isOpen={showSaveDialog}
          onClose={closeSaveDialog}
          onSave={handleDialogSave}
          title='請先儲存您的 Flow'
        />
      </div>
    );
  }
);

// Set display name for React DevTools
FlowEditor.displayName = 'FlowEditor';

function WorkflowBuilder() {
  // 根據用戶角色或權限定義白名單
  const userNodeWhitelist = [
    'input',
    'ai',
    'browser extension input',
    'browser extension output',
    'knowledge retrieval'
  ];

  // 傳遞白名單給 FlowEditor
  return (
    <FlowEditor
      initialTitle='My Workflow'
      nodeWhitelist={userNodeWhitelist}
    />
  );
}

// 調試連接
const debugConnections = (edges, message) => {
  // 按目标节点分组所有边缘
  const edgesByTarget = {};
  edges.forEach((edge) => {
    if (!edgesByTarget[edge.target]) {
      edgesByTarget[edge.target] = [];
    }
    edgesByTarget[edge.target].push(edge);
  });

  // 输出每个目标节点的所有输入连接
  Object.entries(edgesByTarget).forEach(([targetId, targetEdges]) => {
    // 按目标句柄分组
    const byHandle = {};
    targetEdges.forEach((edge) => {
      const handle = edge.targetHandle || 'input';
      if (!byHandle[handle]) {
        byHandle[handle] = [];
      }
      byHandle[handle].push(edge);
    });

    // 输出每个句柄的连接数量
    Object.entries(byHandle).forEach(([handle, handleEdges]) => {
      console.log(`  句柄 ${handle}: ${handleEdges.length} 个连接`);
      handleEdges.forEach((edge) => {
        console.log(
          `    来源: ${edge.source}, 句柄: ${edge.sourceHandle || 'output'}`
        );
      });
    });
  });

  console.groupEnd();
};

// 調試瀏覽器擴展輸出節點
const debugBrowserExtensionOutput = (nodes, edges) => {
  console.group('瀏覽器擴展輸出節點調試');

  // 找出所有的 browserExtensionOutput 節點
  const outputNodes = nodes.filter(
    (node) => node.type === 'browserExtensionOutput'
  );
  console.log(`找到 ${outputNodes.length} 個瀏覽器擴展輸出節點`);

  // 對每個輸出節點進行檢查
  outputNodes.forEach((node) => {
    console.group(`節點: ${node.id}`);

    // 獲取所有連接到該節點的邊緣
    const nodeEdges = edges.filter((edge) => edge.target === node.id);
    console.log(`找到 ${nodeEdges.length} 個連接到該節點的邊緣`);

    // 檢查每個邊緣的標籤（潛在的 return_name）
    nodeEdges.forEach((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      console.log(`連接 ${edge.id}:`, {
        source: edge.source,
        sourceType: sourceNode?.type,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        returnName: edge.label || '(未設置)',
        sourceNodeData: sourceNode?.data
          ? Object.keys(sourceNode.data)
          : '(無數據)'
      });

      // 詳細檢查源節點的數據，以便找出正確的 return_name
      if (sourceNode) {
        if (sourceNode.type === 'customInput' && sourceNode.data?.fields) {
          const outputIndex = edge.sourceHandle
            ? parseInt(edge.sourceHandle.split('-')[1] || 0)
            : 0;
          const field = sourceNode.data.fields[outputIndex];
          console.log(`源節點 ${sourceNode.id} 的欄位 ${outputIndex}:`, {
            inputName: field?.inputName,
            defaultValue: field?.defaultValue
          });
        } else if (
          sourceNode.type === 'browserExtensionInput' &&
          sourceNode.data?.items
        ) {
          const outputIndex = edge.sourceHandle
            ? parseInt(edge.sourceHandle.split('-')[1] || 0)
            : 0;
          const item = sourceNode.data.items[outputIndex];
          console.log(`源節點 ${sourceNode.id} 的項目 ${outputIndex}:`, {
            name: item?.name,
            icon: item?.icon
          });
        }
      }
    });

    console.groupEnd(); // 結束節點調試組
  });

  console.groupEnd(); // 結束整體調試組
};

/**
 * 調試 AI 節點的連線情況
 */
const debugAINodeConnections = (nodes, edges) => {
  console.group('AI節點連線調試');

  // 找出所有的 AI 節點
  const aiNodes = nodes.filter(
    (node) => node.type === 'aiCustomInput' || node.type === 'ai'
  );
  console.log(`找到 ${aiNodes.length} 個 AI 節點`);

  // 對每個 AI 節點進行檢查
  aiNodes.forEach((node) => {
    console.group(`節點: ${node.id}`);

    // 獲取所有連接到該節點的邊緣
    const nodeEdges = edges.filter((edge) => edge.target === node.id);
    console.log(`找到 ${nodeEdges.length} 個連接到該節點的邊緣`);

    // 分類邊緣
    const promptEdges = nodeEdges.filter(
      (edge) => edge.targetHandle === 'prompt-input'
    );
    const contextEdges = nodeEdges.filter(
      (edge) =>
        edge.targetHandle.includes('context-input') ||
        edge.targetHandle.startsWith('context_')
    );

    console.log(`Prompt 連線: ${promptEdges.length}`);
    console.log(`Context 連線: ${contextEdges.length}`);

    // 檢查每個邊緣的詳細信息
    contextEdges.forEach((edge, index) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      console.log(`Context 連線 ${index + 1}:`, {
        source: edge.source,
        sourceType: sourceNode?.type,
        sourceHandle: edge.sourceHandle,
        label: edge.label,
        sourceData:
          sourceNode?.data?.length || Object.keys(sourceNode?.data || {}).length
      });
    });

    console.groupEnd(); // 結束節點調試組
  });

  console.groupEnd(); // 結束整體調試組
};

/**
 * 調試 AI 節點的 API 數據
 */
const debugAINodeAPIData = (apiData) => {
  console.group('AI節點 API 數據調試');

  if (apiData.flow_pipeline) {
    const aiNodes = apiData.flow_pipeline.filter(
      (node) => node.operator === 'ask_ai'
    );

    console.log(`找到 ${aiNodes.length} 個 AI 節點`);

    aiNodes.forEach((node) => {
      console.group(`節點 ${node.id}`);

      if (node.node_input) {
        // 檢查 context 輸入
        const contextInputs = Object.keys(node.node_input).filter(
          (key) => key.includes('context-input') || key.startsWith('context_')
        );

        console.log(`Context 輸入數量: ${contextInputs.length}`);

        contextInputs.forEach((key) => {
          const input = node.node_input[key];
          console.log(`輸入 ${key}:`, {
            node_id: input.node_id,
            output_name: input.output_name,
            return_name: input.return_name
          });
        });

        // 檢查 prompt 輸入
        if (node.node_input['prompt-input']) {
          const promptInput = node.node_input['prompt-input'];
          console.log('Prompt 輸入:', {
            node_id: promptInput.node_id,
            output_name: promptInput.output_name,
            return_name: promptInput.return_name
          });
        }
      }

      console.groupEnd();
    });
  }

  console.groupEnd();
};

// 將調試函數暴露到 window 對象，方便在開發時使用
if (typeof window !== 'undefined') {
  window.debugAINodeConnections = debugAINodeConnections;
  window.debugAINodeAPIData = debugAINodeAPIData;
  window.resetGlobalNodeListState = resetGlobalNodeListState;
}

/**
 * 在 API 數據發送前調試節點輸入數據
 */
const debugNodeInputsBeforeSave = (flowPipeline) => {
  console.group('保存前節點輸入調試');

  // 遍歷所有節點
  flowPipeline.forEach((node) => {
    // 只檢查瀏覽器擴展輸出節點
    if (node.operator === 'browser_extension_output' && node.node_input) {
      console.group(`節點 ${node.id} (${node.operator}) 的輸入:`);

      // 檢查每個輸入連接，包括空連線
      Object.entries(node.node_input).forEach(([key, input]) => {
        const isEmpty = input.is_empty || !input.node_id;
        console.log(`輸入 ${key}:`, {
          node_id: input.node_id || '(空)',
          output_name: input.output_name,
          type: input.type,
          return_name: input.return_name || '(未設置)',
          isEmpty: isEmpty ? '是' : '否'
        });
      });

      console.groupEnd(); // 結束節點調試組
    }
  });

  console.groupEnd(); // 結束整體調試組
};

export default FlowEditor;
