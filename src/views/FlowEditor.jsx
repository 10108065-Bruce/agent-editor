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
import MockApiService from '../services/MockAPIService';
import FileIOService from '../services/FileIOService';
import DownloadButton from '../components/buttons/DownloadButton';
import { iframeBridge } from '../services/IFrameBridgeService';

import 'reactflow/dist/style.css';
import { CustomEdge } from '../components/CustomEdge';
// 使用 forwardRef 將 FlowEditor 包裝起來，使其可以接收 ref
const FlowEditor = forwardRef(({ initialTitle, onTitleChange }, ref) => {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const isInitialized = useRef(false);

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
    title: initialTitle || 'APA 診間小幫手',
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
    }
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
   * 準備流程資料並透過 MockApiService 儲存
   */
  const saveFlowData = useCallback(async () => {
    console.log('FlowEditor: 準備儲存流程資料...');

    // 準備需要儲存的資料
    const flowData = {
      id: flowMetadata.id || `flow_${Date.now()}`,
      title: flowMetadata.title,
      version: flowMetadata.version,
      nodes,
      edges,
      metadata: {
        lastModified: new Date().toISOString(),
        nodeCount: nodes.length,
        edgeCount: edges.length
      }
    };

    try {
      // 呼叫模擬 API 服務儲存資料
      console.log('FlowEditor: 呼叫 API 儲存流程...');
      const response = await MockApiService.saveFlow(flowData);

      // 成功儲存後更新流程元資料
      setFlowMetadata({
        ...flowMetadata,
        id: response.flowId || flowMetadata.id,
        lastSaved: response.timestamp,
        version: flowMetadata.version + 1
      });

      console.log('FlowEditor: 流程儲存成功', response);
      showNotification('流程儲存成功', 'success');

      // 通知流程已保存
      if (isInIframe) {
        iframeBridge.sendToParent({
          type: 'FLOW_SAVED',
          success: true,
          flowId: response.flowId,
          timestamp: new Date().toISOString()
        });
      }

      return response;
    } catch (error) {
      console.error('FlowEditor: 儲存流程時發生錯誤：', error);
      showNotification('儲存流程時發生錯誤', 'error');

      // 通知儲存失敗
      if (isInIframe) {
        iframeBridge.sendToParent({
          type: 'FLOW_SAVED',
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }

      throw error;
    }
  }, [nodes, edges, flowMetadata, showNotification, isInIframe]);

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
            <LoadFileButton onLoad={loadFromLocalFile} />
            {isInIframe ? (
              <DownloadButton onDownload={sendDataForDownload} />
            ) : (
              <SaveFileButton onSave={saveToLocalFile} />
            )}
          </div>

          {/* Separator */}
          <div className='h-10 w-px bg-gray-300'></div>

          {/* Undo/Redo */}
          <button
            className='bg-white p-2 rounded-md shadow-md border border-gray-200'
            onClick={undo}
            title='Undo'>
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
              <path d='M3 7v6h6'></path>
              <path d='M21 17a9 9 0 0 0-9-9H3'></path>
            </svg>
          </button>
          <button
            className='bg-white p-2 rounded-md shadow-md border border-gray-200'
            onClick={redo}
            title='Redo'>
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
              <path d='M21 7v6h-6'></path>
              <path d='M3 17a9 9 0 0 1 9-9h9'></path>
            </svg>
          </button>

          {/* Server save button */}
          <div className='ml-2'>
            <SaveButton onSave={saveFlowData} />
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

export default FlowEditor;
