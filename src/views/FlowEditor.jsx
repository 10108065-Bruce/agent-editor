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
  ReactFlowProvider
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

// 使用 forwardRef 將 FlowEditor 包裝起來，使其可以接收 ref
const FlowEditor = forwardRef(({ initialTitle, onTitleChange }, ref) => {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const isInitialized = useRef(false);
  const [isSaving, setIsSaving] = useState(false); // 添加保存狀態

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
    handleNodeSelection,
    undo,
    redo,
    setNodes: setFlowNodes,
    setEdges: setFlowEdges
  } = useFlowNodes();

  // 儲存流程元資料
  const [flowMetadata, setFlowMetadata] = useState({
    id: null,
    title: initialTitle || '',
    lastSaved: null,
    version: 1
  });

  // 增加通知狀態
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'info'
  });

  // 檢查是否在 iframe 中
  const isInIframe = useMemo(() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  }, []);

  // 添加一個內部方法來處理工作流加載
  const handleLoadWorkflow = useCallback(async (flowId) => {
    try {
      // 呼叫已經在 useImperativeHandle 中定義的 loadWorkflow 方法
      const success = await loadWorkflowImpl(flowId);
      return success;
    } catch (error) {
      console.error('無法載入工作流:', error);
      showNotification('載入工作流失敗', 'error');
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

        setFlowNodes(transformedNodes);
        setFlowEdges(transformedEdges);

        setFlowMetadata((prev) => ({
          ...prev,
          id: apiData.flow_id,
          title: apiData.flow_name || prev.flow_name,
          version: apiData.version || prev.version
        }));

        // 重要：確保在設置節點後立即更新節點函數
        console.log('載入工作流後立即更新節點函數...');
        updateNodeFunctions();

        // 再次確保函數更新，增加一個延遲的更新以捕獲任何同步更新可能錯過的節點
        setTimeout(() => {
          console.log('載入工作流後再次確認節點函數...');
          updateNodeFunctions();
        }, 300);

        showNotification('工作流載入成功', 'success');
        return true;
      } catch (error) {
        console.error('載入工作流失敗:', error);
        showNotification('載入工作流失敗', 'error');
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
    loadWorkflow: loadWorkflowImpl
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

  // 顯示通知的輔助函數
  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'info' });
    }, 3000);
  }, []);

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
        case 'line':
          handleAddLineNode(nodePosition);
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
        showNotification(`已儲存到 ${result.filename}`, 'success');

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
      showNotification('無法儲存檔案', 'error');
      throw error;
    }
  }, [nodes, edges, flowMetadata, showNotification]);

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
        showNotification('已發送下載請求', 'success');
      } else {
        showNotification('發送下載請求失敗', 'error');
      }

      return { success: result };
    } catch (error) {
      console.error('準備下載數據時發生錯誤：', error);
      showNotification('發送下載請求失敗', 'error');
      throw error;
    }
  }, [
    nodes,
    edges,
    flowMetadata,
    isInIframe,
    saveToLocalFile,
    showNotification
  ]);

  // 修改保存函數來設置保存狀態
  const saveToServer = useCallback(async () => {
    // 設置保存中狀態
    setIsSaving(true);

    try {
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
      console.log('FlowEditor: 將流程數據轉換為 API 格式:', apiData);

      // 根據是否有 flow_id 決定使用 POST 還是 PUT
      let response;
      if (flowMetadata.id) {
        // 更新現有流程
        response = await workflowAPIService.updateWorkflow(apiData);
        console.log('FlowEditor: 更新流程成功', response);
        showNotification('流程更新成功', 'success');
      } else {
        // 創建新流程
        response = await workflowAPIService.createWorkflow(apiData);
        console.log('FlowEditor: 創建流程成功', response);

        // 如果後端回傳了 flow_id，更新流程元數據
        if (response && response.flow_id) {
          setFlowMetadata((prev) => ({
            ...prev,
            id: response.flow_id,
            lastSaved: new Date().toISOString()
          }));
        }

        showNotification('流程創建成功', 'success');
      }

      // 無論創建還是更新，都更新最後儲存時間
      setFlowMetadata((prev) => ({
        ...prev,
        lastSaved: new Date().toISOString()
      }));

      return response;
    } catch (error) {
      console.error('FlowEditor: 儲存流程時發生錯誤：', error);
      showNotification('儲存流程時發生錯誤', 'error');
      throw error;
    } finally {
      // 無論成功或失敗，都重置保存狀態
      setIsSaving(false);
    }
  }, [nodes, edges, flowMetadata, showNotification]);

  /**
   * 從本地檔案載入流程資料
   */
  const loadFromLocalFile = useCallback(async () => {
    try {
      // 開啟檔案對話框並讀取檔案
      const result = await FileIOService.readFromFile();

      if (result.success && result.data) {
        console.log('檔案已載入：', result.filename);
        showNotification(`已載入 ${result.filename}`, 'success');

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
      }

      return result;
    } catch (error) {
      console.error('載入檔案時發生錯誤：', error);
      showNotification('無法載入檔案', 'error');
      throw error;
    }
  }, [
    setFlowNodes,
    setFlowEdges,
    showNotification,
    updateNodeFunctions,
    isInIframe,
    onTitleChange
  ]);

  const [sidebarVisible, setSidebarVisible] = useState(true);

  const toggleSidebar = useCallback(() => {
    setSidebarVisible((prev) => !prev);
  }, []);

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

  return (
    <div className='relative w-full h-screen'>
      {/* APA Assistant at top */}
      <APAAssistant
        title={flowMetadata.title}
        onTitleChange={handleTitleChange}
      />

      {/* Notification */}
      {notification.show && (
        <div
          className={`absolute top-16 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-md shadow-md z-20 text-sm ${
            notification.type === 'error'
              ? 'bg-red-100 text-red-700 border border-red-200'
              : notification.type === 'success'
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-blue-100 text-blue-700 border border-blue-200'
          }`}>
          {notification.message}
        </div>
      )}

      {/* Full-screen ReactFlow wrapped in ReactFlowProvider */}
      <ReactFlowProvider>
        <div
          className='w-full h-full'
          ref={reactFlowWrapper}>
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
            onSelectionChange={handleSelectionChange}
            deleteKeyCode={['Backspace', 'Delete']}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}>
            <MiniMap />
            <Controls />
            <Background />
          </ReactFlow>
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
          <div className='flex space-x-2 mr-2'>
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
          <div className='h-10 w-px bg-gray-300'></div>

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

export default FlowEditor;
