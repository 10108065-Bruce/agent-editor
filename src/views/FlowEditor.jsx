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
import {
  SaveFileButton,
  LoadFileButton
} from '../components/buttons/FileButtons';
import FileIOService from '../services/FileIOService';
import DownloadButton from '../components/buttons/DownloadButton';
import { iframeBridge } from '../services/IFrameBridgeService';

import 'reactflow/dist/style.css';
import { CustomEdge } from '../components/CustomEdge';
import {
  WorkflowDataConverter,
  workflowAPIService
} from '../services/WorkflowServicesIntegration';

import LoadWorkflowButton from '../components/buttons/LoadWorkflowButton';
import Notification from '../components/common/Notification';
import SaveFlowDialog from '../components/common/SaveFlowDialog';
import AutoLayoutButton from '../components/buttons/AutoLayoutButton';

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
      sidebarVisible // 添加sidebar狀態參數
    },
    ref
  ) => {
    const reactFlowInstance = useReactFlow();

    // 自動縮放畫布以顯示所有節點
    const fitViewToNodes = useCallback(
      (padding = 0.1, maxZoom = 1.85, duration = 800) => {
        if (!reactFlowInstance) {
          console.warn('ReactFlow 實例尚未初始化，無法自動縮放畫布');
          return;
        }

        console.log('自動縮放畫布以顯示所有節點...');

        try {
          // 使用 ReactFlow 的 fitView 方法自動縮放畫布
          reactFlowInstance.fitView({
            padding, // 邊緣留白，值越大顯示的節點佔比越小
            maxZoom, // 限制最大縮放，防止縮放過大
            duration, // 動畫持續時間（毫秒）
            includeHiddenNodes: false // 不包含隱藏節點
          });

          console.log('畫布縮放完成');
        } catch (error) {
          console.error('自動縮放畫布時發生錯誤：', error);
        }
      },
      [reactFlowInstance]
    );

    // 重要：將 fitViewToNodes 方法暴露給父組件
    useImperativeHandle(ref, () => ({
      fitViewToNodes
    }));

    // 根據sidebar狀態計算controls的樣式
    const controlsStyle = useMemo(() => {
      return {
        left: sidebarVisible ? '17rem' : '10px', // 如果sidebar顯示，將controls向右移動
        transition: 'left 0.3s ease' // 添加過渡效果使移動更平滑
      };
    }, [sidebarVisible]);

    return (
      <>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodesDelete={onNodesDelete}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultViewport={defaultViewport}
          onSelectionChange={onSelectionChange}
          deleteKeyCode={['Backspace', 'Delete']}
          onInit={onInit}
          onDrop={onDrop}
          onDragOver={onDragOver}>
          <MiniMap />
          <Controls style={controlsStyle} /> {/* 使用動態樣式控制位置 */}
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

// 使用 forwardRef 將 FlowEditor 包裝起來，使其可以接收 ref
const FlowEditor = forwardRef(({ initialTitle, onTitleChange }, ref) => {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const reactFlowControlsRef = useRef(null);
  const isInitialized = useRef(false);
  const [isSaving, setIsSaving] = useState(false); // 添加保存狀態
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // 使用 useMemo 記憶化 nodeTypes 和 edgeTypes，這樣它們在每次渲染時保持穩定
  const nodeTypes = useMemo(() => enhancedNodeTypes, []);
  const edgeTypes = useMemo(() => ({ 'custom-edge': CustomEdge }), []);

  // 使用 useMemo 記憶化 defaultViewport
  const defaultViewport = useMemo(() => ({ x: 0, y: 0, zoom: 1.3 }), []);
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
    handleAddHTTPNode,
    handleAddEventNode,
    handleAddTimerNode,
    handleAddLineNode,
    handleAddLineMessageNode,
    handleAddExtractDataNode,
    handleNodeSelection,
    undo,
    redo,
    setNodes: setFlowNodes,
    setEdges: setFlowEdges,
    getNodeCallbacks,
    handleAutoLayout
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
    // 先判斷flowId是否為new
    if (flowId !== 'new') {
      try {
        const apiData = await workflowAPIService.loadWorkflow(flowId);

        const { nodes: transformedNodes, edges: transformedEdges } =
          WorkflowDataConverter.transformToReactFlowFormat(apiData);
        // 🔧 重要修復：為載入的節點重新添加回調函數
        const nodesWithCallbacks = transformedNodes.map((node) => {
          console.log(`為載入的節點 ${node.id} (${node.type}) 添加回調函數`);

          // 獲取該節點類型的回調函數
          const nodeCallbacks = getNodeCallbacks(node.id, node.type);
          console.log(nodeCallbacks);
          return {
            ...node,
            data: {
              ...node.data,
              // 添加回調函數到節點數據中
              ...nodeCallbacks
            }
          };
        });

        // console.log('載入的節點（已添加回調）:', nodesWithCallbacks);
        setFlowNodes(nodesWithCallbacks);
        setFlowEdges(transformedEdges);

        debugBrowserExtensionOutput(transformedNodes, transformedEdges);

        setFlowMetadata((prev) => ({
          ...prev,
          id: apiData.flow_id,
          title: apiData.flow_name || prev.flow_name,
          version: apiData.version || prev.version
        }));

        // 重要：確保在設置節點後立即更新節點函數
        console.log('載入工作流後立即更新節點函數...');
        // updateNodeFunctions();

        // 再次確保函數更新，增加一個延遲的更新以捕獲任何同步更新可能錯過的節點
        setTimeout(() => {
          console.log('載入工作流後再次確認節點函數...');
          updateNodeFunctions();

          // 載入完成後，執行一次畫布縮放以顯示所有節點
          if (
            reactFlowControlsRef.current &&
            reactFlowControlsRef.current.fitViewToNodes
          ) {
            console.log('載入工作流後，執行一次畫布縮放以顯示所有節點...');
            reactFlowControlsRef.current.fitViewToNodes(0.1, 1.85, 800);
          }
        }, 300);

        window.notify({
          message: '工作流載入成功',
          type: 'success',
          duration: 2000
        });
        return true;
      } catch (error) {
        console.error('載入工作流失敗:', error);
        window.notify({
          message: '載入工作流失敗',
          type: 'error',
          duration: 2000
        });
        return false;
      }
    }
  };

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
    // 暴露 fitViewToNodes 方法給父組件
    fitViewToNodes: () => {
      if (
        reactFlowControlsRef.current &&
        reactFlowControlsRef.current.fitViewToNodes
      ) {
        reactFlowControlsRef.current.fitViewToNodes();
      }
    } // 新增 setToken 方法
    // setToken: (token) => {
    //   if (token && typeof token === 'string') {
    //     // 如果 TokenService 已導入，則直接使用
    //     if (typeof tokenService !== 'undefined') {
    //       tokenService.setToken(token);
    //       return true;
    //     }

    //     // 或者存儲到 localStorage
    //     try {
    //       localStorage.setItem('api_token', token);
    //       console.log('Token 已設置到 FlowEditor');
    //       return true;
    //     } catch (error) {
    //       console.error('保存 token 失敗:', error);
    //       return false;
    //     }
    //   }
    //   return false;
    // }
  }));

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
      setFlowMetadata((prev) => ({ ...prev, title }));

      // 如果提供了標題變更回調函數，則呼叫它
      if (onTitleChange && typeof onTitleChange === 'function') {
        onTitleChange(title);
      }
    },
    [onTitleChange]
  );

  // 處理從側邊欄選擇的節點類型，加入位置參數支持拖放
  const handleNodeTypeSelection = useCallback(
    (nodeType, position = null) => {
      // Default position for click-added nodes
      const defaultPosition = {
        x: Math.random() * 400,
        y: Math.random() * 400
      };

      // Use provided position (from drag & drop) or default position
      const nodePosition = position || defaultPosition;
      switch (nodeType) {
        case 'input':
          handleAddInputNode(nodePosition);
          break;
        case 'ai':
          handleAddAINode(nodePosition);
          break;
        case 'if/else':
          handleAddIfElseNode(nodePosition);
          break;
        case 'browser extension input':
          handleAddBrowserExtensionInput(nodePosition);
          break;
        case 'browser extension output':
          handleAddBrowserExtensionOutput(nodePosition);
          break;
        case 'knowledge retrieval':
          handleAddKnowledgeRetrievalNode(nodePosition);
          break;
        case 'end':
          handleAddEndNode(nodePosition);
          break;
        case 'webhook':
          handleAddWebhookNode(nodePosition);
          break;
        case 'http':
          handleAddHTTPNode(nodePosition);
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
      handleAddHTTPNode,
      handleAddEventNode,
      handleAddTimerNode,
      handleAddLineNode,
      handleAddLineMessageNode,
      handleAddExtractDataNode,
      handleAddNode
    ]
  );

  // Drag and drop implementation
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    // Optional: Add visual feedback
    if (reactFlowWrapper.current) {
      reactFlowWrapper.current.classList.add('drag-over');
    }
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      if (!reactFlowInstance) return;

      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      // Get the position where the node is dropped
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
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
    [reactFlowInstance, handleNodeTypeSelection]
  );

  const onDragStart = useCallback((event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  }, []);

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
    // 設置保存中狀態
    setIsSaving(true);

    try {
      // 檢查保存前的連線
      debugConnections(edges, '保存前');
      // 重要：在轉換前檢查所有 BrowserExtensionOutput 節點的資料完整性
      nodes.forEach((node) => {
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
      console.log('FlowEditor: 將流程數據轉換為 API 格式:', apiData);

      // 根據是否有 flow_id 決定使用 POST 還是 PUT
      let response;
      let flowIdToUse = flowMetadata.id || null; // 新增變數來捕獲要使用的 flow_id
      if (flowMetadata.id) {
        // 更新現有流程
        response = await workflowAPIService.updateWorkflow(apiData);
        console.log('FlowEditor: 更新流程成功', response);
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
        // 捕獲從後端回傳的 flow_id
        flowIdToUse = response?.flow_id;
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
  }, [nodes, edges, flowMetadata, handleLoadWorkflow]);

  // 處理對話框中的保存操作
  const handleDialogSave = useCallback(
    async (flowName) => {
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
          console.log('創建新流程');
          response = await workflowAPIService.createWorkflow(apiData);
          console.log('創建流程成功:', response);

          flowIdToUse = response?.flow_id;
          console.log('獲得新的 flow_id:', flowIdToUse);

          // 檢查是否在 iframe 中運行並發送事件
          const isInIframe = window.self !== window.top;
          if (isInIframe) {
            console.log('在 iframe 中，發送事件到父頁面');
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
    [nodes, edges, flowMetadata, saveDialogCallback, handleLoadWorkflow]
  );

  // 關閉保存對話框
  const closeSaveDialog = useCallback(() => {
    setShowSaveDialog(false);
    setSaveDialogCallback(null);
  }, []);

  // 顯示保存對話框的函數
  const showSaveFlowDialog = useCallback((callback) => {
    setSaveDialogCallback(() => callback); // 保存回調函數
    setShowSaveDialog(true);
  }, []);
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
          lastSaved: result.data.metadata?.savedAt || new Date().toISOString(),
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
  }, [flowMetadata.id, showSaveFlowDialog]);
  return (
    <div className='relative w-full h-screen'>
      {/* APA Assistant at top */}
      <APAAssistant
        title={flowMetadata.title}
        onTitleChange={handleTitleChange}
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
          />
        </div>
      </ReactFlowProvider>

      {/* Absolute positioned sidebar */}
      <div
        className={`absolute top-0 left-0 h-full transition-transform duration-300 transform ${
          sidebarVisible ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <NodeSidebar
          handleButtonClick={handleNodeTypeSelection}
          onDragStart={onDragStart}
          nodes={nodes}
        />

        {/* Sidebar toggle button */}
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
      </div>

      {/* Action buttons */}
      <div className='absolute top-4 right-4 z-10 flex flex-col items-end'>
        <div className='flex space-x-2'>
          {/* File operations */}
          <div className='flex space-x-2'>
            <LoadWorkflowButton onLoad={handleLoadWorkflow} />
            {/* <LoadFileButton onLoad={loadFromLocalFile} />
            <LoadFileButton onLoad={loadFromServer} /> */}
            {/* {isInIframe ? (
              <DownloadButton onDownload={sendDataForDownload} />
            ) : (
              // <SaveFileButton onSave={saveToLocalFile} />
              <SaveFileButton onSave={saveToServer} />
            )} */}
          </div>

          {/* Separator */}
          <div className='h-10 w-px bg-gray-300 self-center'></div>

          {/* Auto Layout Button */}
          <div className='ml-2'>
            <AutoLayoutButton
              onLayout={handleAutoLayout}
              disabled={isSaving || nodes.length === 0}
            />
          </div>

          {/* Separator */}
          <div className='h-10 w-px bg-gray-300 self-center'></div>

          {/* Server save button */}
          <div className='ml-2'>
            <SaveButton
              onSave={saveToServer}
              title={flowMetadata.title}
              flowId={flowMetadata.id} // 傳入流程ID
              disabled={isSaving}
            />
          </div>
        </div>
        {/* Flow metadata info - now positioned below the action buttons */}
        {flowMetadata.lastSaved && (
          <div className='mt-2 bg-white px-3 py-1 rounded-md shadow text-xs text-gray-500 z-10'>
            Last saved: {new Date(flowMetadata.lastSaved).toLocaleTimeString()}{' '}
            | Version: {flowMetadata.version}
          </div>
        )}
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
});

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
  console.group(`调试连接 - ${message}`);

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
    console.log(`节点 ${targetId} 的输入连接 (${targetEdges.length}):`);

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
}

/**
 * 在 API 數據發送前調試節點輸入數據
 */
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
