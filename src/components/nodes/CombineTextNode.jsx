import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import { Handle, Position, useEdges, useNodes } from 'reactflow';
import IconBase from '../icons/IconBase';
import CombineTextEditor from '../text/CombineTextEditor';

const CombineTextNode = ({ data, isConnectable, id }) => {
  const edges = useEdges();
  const nodes = useNodes();

  // 狀態管理
  const [textToCombine, setTextToCombine] = useState(data?.textToCombine || '');
  const [showInputPanel, setShowInputPanel] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [inputHandles, setInputHandles] = useState(
    data?.inputHandles || [{ id: 'text0' }]
  );
  const [activeTab, setActiveTab] = useState(data?.activeTab || 'editor');
  const [editorContent, setEditorContent] = useState('');
  const [editorHtmlContent, setEditorHtmlContent] = useState(
    data?.editorHtmlContent || ''
  );

  // 初始化標記，避免重複初始化
  const [isInitialized, setIsInitialized] = useState(false);

  // Refs
  const textareaRef = useRef(null);
  const previewRef = useRef(null);
  const inputPanelRef = useRef(null);

  // 重要：不再使用防抖，而是控制更新頻率
  const lastUpdateTime = useRef(0);
  const updateThrottleTime = 1000; // 1秒更新一次父組件狀態

  // 計算當前連線數量
  const connectionCount = edges.filter((edge) => edge.target === id).length;

  // 獲取 flow_id 的方法
  const getFlowId = useCallback(() => {
    if (data?.flowId) {
      return data.flowId;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const urlFlowId = urlParams.get('flowId') || urlParams.get('flow_id');
    if (urlFlowId) {
      return urlFlowId;
    }

    const pathMatch = window.location.pathname.match(/\/flow\/([^\/]+)/);
    if (pathMatch) {
      return pathMatch[1];
    }

    if (typeof window !== 'undefined' && window.currentFlowId) {
      return window.currentFlowId;
    }

    return '9e956c37-20ea-47a5-bcd5-3cafc35b967d';
  }, [data]);

  // 從邊緣獲取連線的節點信息
  const getConnectedNodes = useCallback(() => {
    const connectedEdges = edges.filter((edge) => edge.target === id);
    return connectedEdges.map((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      return {
        id: edge.source,
        name: getNodeDisplayName(sourceNode),
        outputName: edge.sourceHandle || 'output',
        handleId: edge.targetHandle,
        nodeType: sourceNode?.type || 'unknown',
        data: `QOCA_NODE_ID_${edge.source}_NODE_OUTPUT_NAME_${
          edge.sourceHandle || 'output'
        }`,
        code: `QOCA_NODE_ID_${edge.source}_NODE_OUTPUT_NAME_${
          edge.sourceHandle || 'output'
        }`,
        color: getNodeTagColor(getNodeDisplayName(sourceNode))
      };
    });
  }, [edges, nodes, id]);

  // 獲取節點顯示名稱的輔助函數
  const getNodeDisplayName = (sourceNode) => {
    if (!sourceNode) return 'Unknown';

    switch (sourceNode.type) {
      case 'customInput':
      case 'input':
        return 'Input.TEXT';
      case 'aiCustomInput':
      case 'ai':
        return 'AI.TEXT';
      case 'aim_ml':
        return 'ML Node.TEXT';
      case 'browserExtensionInput':
        return 'Browser Extension Input.TEXT';
      case 'webhook_input':
        return 'Webhook.TEXT';
      case 'knowledgeRetrieval':
        return 'Knowledge Retrieval.TEXT';
      case 'extract_data':
        return 'Extract Data Node.TEXT';
      case 'line_webhook_input':
        return 'Line Webhook Input.TEXT';
      case 'httpRequest':
        return 'Http Request Node.TEXT';
      case 'schedule_trigger':
        return 'schedule node.TEXT';
      default:
        return `${
          sourceNode.type.charAt(0).toUpperCase() + sourceNode.type.slice(1)
        }.TEXT`;
    }
  };

  // 獲取節點標籤顏色
  const getNodeTagColor = (nodeName) => {
    const colorMap = {
      'Input.TEXT': '#3b82f6',
      'AI.TEXT': '#f97316',
      'ML Node.TEXT': '#ef4444',
      'Browser Extension Input.TEXT': '#14b8a6',
      'Webhook.TEXT': '#22c55e',
      'Knowledge Retrieval.TEXT': '#a855f7',
      'Extract Data Node.TEXT': '#ec4899',
      'Line Webhook Input.TEXT': '#6366f1',
      'Http Request Node.TEXT': '#eab308',
      'schedule node.TEXT': '#a78bfa'
    };
    return colorMap[nodeName] || '#6b7280';
  };

  // 更新父組件狀態 - 使用節流而不是防抖
  const updateParentState = useCallback(
    (key, value) => {
      if (data && typeof data.updateNodeData === 'function') {
        const now = Date.now();

        // 對於關鍵狀態立即更新
        if (key === 'activeTab' || key === 'inputHandles') {
          data.updateNodeData(key, value);
          return;
        }

        // 對於文字內容，使用節流控制更新頻率
        if (now - lastUpdateTime.current > updateThrottleTime) {
          lastUpdateTime.current = now;
          data.updateNodeData(key, value);
        }
      }
    },
    [data]
  );

  // 生成預設的 JSON 模板
  const generateDefaultJson = useCallback(() => {
    const flowId = getFlowId();
    return JSON.stringify(
      {
        flow_id: flowId,
        func_id: '',
        data: ''
      },
      null,
      2
    );
  }, [getFlowId]);

  // 生成預覽內容
  const generatePreviewContent = useCallback(() => {
    if (!textareaRef.current) {
      return textToCombine || '';
    }

    const editorTextContent = textareaRef.current.getValue
      ? textareaRef.current.getValue()
      : textToCombine;

    return editorTextContent || '';
  }, [textToCombine]);

  // 處理文字內容變更 - 大幅簡化
  const handleTextChange = useCallback(
    (e) => {
      const newContent = e.target.value;

      // 立即更新本地狀態以保持響應性
      setTextToCombine(newContent);
      setEditorContent(newContent);

      // 節流更新父組件狀態
      updateParentState('textToCombine', newContent);

      // HTML 內容更新
      if (textareaRef.current?.innerHTML !== undefined) {
        const htmlContent = textareaRef.current.innerHTML || '';
        setEditorHtmlContent(htmlContent);
        updateParentState('editorHtmlContent', htmlContent);
      }
    },
    [updateParentState]
  );

  // 關閉輸入面板
  const closeInputPanel = useCallback(() => {
    setShowInputPanel(false);
    setFilterText('');
  }, []);

  // 處理panel顯示控制
  const handleShowPanel = useCallback(
    (show) => {
      if (activeTab === 'editor') {
        setShowInputPanel(show);
        if (!show) {
          setFilterText('');
        }
      }
    },
    [activeTab]
  );

  // 處理標籤點擊
  const handleTagClick = useCallback(
    (nodeInfo) => {
      if (textareaRef.current && textareaRef.current.insertTagAtCursor) {
        textareaRef.current.insertTagAtCursor(nodeInfo);

        // 獲取更新後的內容
        setTimeout(() => {
          if (textareaRef.current && textareaRef.current.getValue) {
            const newContent = textareaRef.current.getValue();
            setTextToCombine(newContent);
            setEditorContent(newContent);

            // 立即更新父組件狀態（標籤插入是重要操作）
            if (data && typeof data.updateNodeData === 'function') {
              data.updateNodeData('textToCombine', newContent);
            }
          }
        }, 0);
      }
      closeInputPanel();
    },
    [closeInputPanel, data]
  );

  // 處理標籤拖拽開始
  const handleTagDragStart = useCallback((e, nodeInfo) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(nodeInfo));
    e.dataTransfer.effectAllowed = 'copy';
  }, []);

  // 處理標籤插入完成
  const handleTagInsert = useCallback(
    (tag) => {
      console.log('標籤已插入:', tag);

      setTimeout(() => {
        if (textareaRef.current && textareaRef.current.getValue) {
          const newContent = textareaRef.current.getValue();
          setTextToCombine(newContent);
          setEditorContent(newContent);

          // 立即更新父組件狀態
          if (data && typeof data.updateNodeData === 'function') {
            data.updateNodeData('textToCombine', newContent);
          }

          const htmlContent = textareaRef.current.innerHTML || '';
          setEditorHtmlContent(htmlContent);
          if (data && typeof data.updateNodeData === 'function') {
            data.updateNodeData('editorHtmlContent', htmlContent);
          }
        }
      }, 0);
    },
    [data]
  );

  // 處理滾輪事件
  const handleWheel = useCallback((e) => {
    const target = e.currentTarget;
    const isScrollable = target.scrollHeight > target.clientHeight;

    if (isScrollable) {
      e.stopPropagation();
      const deltaY = e.deltaY;
      const currentScrollTop = target.scrollTop;
      const maxScrollTop = target.scrollHeight - target.clientHeight;

      const newScrollTop = Math.max(
        0,
        Math.min(maxScrollTop, currentScrollTop + deltaY)
      );

      target.scrollTop = newScrollTop;
      e.preventDefault();
    } else {
      e.stopPropagation();
      e.preventDefault();
    }
  }, []);

  // 處理滑鼠事件
  const handleMouseDown = useCallback((e) => {
    e.stopPropagation();
  }, []);

  const handleMouseMove = useCallback((e) => {
    e.stopPropagation();
  }, []);

  const handleMouseUp = useCallback((e) => {
    e.stopPropagation();
  }, []);

  // 過濾連線節點
  const filteredNodes = getConnectedNodes().filter((node) =>
    node.name.toLowerCase().includes(filterText.toLowerCase())
  );

  // 處理 Tab 切換
  const handleTabChange = useCallback(
    (newTab) => {
      // 在切換到 preview 前保存當前編輯器狀態
      if (activeTab === 'editor' && newTab === 'preview') {
        if (textareaRef.current) {
          const textContent = textareaRef.current.getValue
            ? textareaRef.current.getValue()
            : textToCombine;
          const htmlContent = textareaRef.current.innerHTML || '';

          setTextToCombine(textContent);
          setEditorHtmlContent(htmlContent);

          // 立即更新父組件狀態
          if (data && typeof data.updateNodeData === 'function') {
            data.updateNodeData('textToCombine', textContent);
            data.updateNodeData('editorHtmlContent', htmlContent);
          }
        }
      }

      setActiveTab(newTab);

      // 立即更新父組件狀態
      if (data && typeof data.updateNodeData === 'function') {
        data.updateNodeData('activeTab', newTab);
      }
    },
    [activeTab, textToCombine, data]
  );

  // 🔧 一次性初始化
  useEffect(() => {
    if (!isInitialized && data) {
      console.log('執行一次性初始化同步');

      if (data.activeTab && data.activeTab !== activeTab) {
        setActiveTab(data.activeTab);
      }
      if (
        data.editorHtmlContent &&
        data.editorHtmlContent !== editorHtmlContent
      ) {
        setEditorHtmlContent(data.editorHtmlContent);
      }
      if (data.textToCombine && data.textToCombine !== textToCombine) {
        setTextToCombine(data.textToCombine);
        setEditorContent(data.textToCombine);
      }

      setIsInitialized(true);
    }
  }, [data, isInitialized, activeTab, editorHtmlContent, textToCombine]);

  // 初始化預設內容
  useEffect(() => {
    if (!textToCombine && data?.textToCombine === undefined && isInitialized) {
      const defaultContent = generateDefaultJson();
      setTextToCombine(defaultContent);
      setEditorContent(defaultContent);

      if (data && typeof data.updateNodeData === 'function') {
        data.updateNodeData('textToCombine', defaultContent);
      }
    }
  }, [
    textToCombine,
    data?.textToCombine,
    generateDefaultJson,
    isInitialized,
    data
  ]);

  // 動態管理輸入 handles
  useEffect(() => {
    const singleHandle = [{ id: 'text' }];

    if (JSON.stringify(singleHandle) !== JSON.stringify(inputHandles)) {
      setInputHandles(singleHandle);
      if (data && typeof data.updateNodeData === 'function') {
        data.updateNodeData('inputHandles', singleHandle);
      }
    }
  }, [inputHandles, data]);

  // 移除會導致無限重新渲染的 useEffect，只保留必要的外部同步
  useEffect(() => {
    if (!isInitialized) return;

    let hasChanges = false;

    // 只有在數據真正不同時才同步
    if (
      data?.textToCombine !== undefined &&
      data.textToCombine !== textToCombine &&
      Math.abs(data.textToCombine.length - textToCombine.length) > 5 // 只有當差異較大時才同步
    ) {
      setTextToCombine(data.textToCombine);
      setEditorContent(data.textToCombine);
      hasChanges = true;
    }

    if (data?.activeTab !== undefined && data.activeTab !== activeTab) {
      setActiveTab(data.activeTab);
      hasChanges = true;
    }

    if (hasChanges) {
      console.log('外部資料有重大變更，同步本地狀態');
    }
  }, [
    data?.textToCombine,
    data?.activeTab,
    isInitialized,
    textToCombine,
    activeTab
  ]);

  return (
    <>
      <div className='rounded-lg shadow-md overflow-hidden w-96'>
        {/* Header section */}
        <div className='bg-gray-100 p-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <div className='w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-white mr-2'>
                <IconBase type='combine_text' />
              </div>
              <span className='font-medium'>Combine Text</span>
            </div>
            {connectionCount > 0 && (
              <span className='text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full'>
                {/* {connectionCount} 個連線 */}
                已連線
              </span>
            )}
          </div>
        </div>

        {/* Content area */}
        <div className='bg-white p-4'>
          <div className='mb-2'>
            <label className='block text-sm text-gray-700 mb-1 font-bold'>
              Compose
            </label>

            {/* Tab 切換器 */}
            <div className='flex mb-4 bg-gray-100 rounded-lg p-1 mt-4'>
              <button
                onClick={() => handleTabChange('editor')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'editor'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}>
                Editor
              </button>
              <button
                onClick={() => handleTabChange('preview')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'preview'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}>
                Preview
              </button>
            </div>

            {/* 內容區域 */}
            <div className='relative'>
              {activeTab === 'editor' ? (
                <CombineTextEditor
                  key={`editor-${isInitialized}`}
                  ref={textareaRef}
                  value={isInitialized ? undefined : textToCombine} // 初始化後不再傳遞 value
                  onChange={handleTextChange}
                  onTagInsert={handleTagInsert}
                  placeholder='點擊此處編輯內容...'
                  className='bg-gray-900 text-white border-gray-300'
                  flowId={getFlowId()}
                  initialHtmlContent={editorHtmlContent}
                  shouldShowPanel={connectionCount > 0}
                  showInputPanel={showInputPanel}
                  onShowPanel={handleShowPanel}
                  style={{
                    minHeight: '220px',
                    maxHeight: '400px',
                    color: 'rgba(255, 255, 255, 0.9)'
                  }}
                  onWheel={handleWheel}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                />
              ) : (
                <div
                  ref={previewRef}
                  className='font-mono text-sm bg-gray-100 text-gray-800 p-3 rounded border'
                  style={{
                    fontFamily:
                      'Monaco, Menlo, Consolas, "Courier New", monospace',
                    minHeight: '220px',
                    maxHeight: '400px',
                    overflow: 'auto'
                  }}
                  onWheel={handleWheel}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}>
                  <pre className='whitespace-pre-wrap'>
                    {generatePreviewContent()}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Handle */}
      <Handle
        type='target'
        position={Position.Left}
        id='text'
        style={{
          background: '#e5e7eb',
          border: '1px solid #D3D3D3',
          width: '12px',
          height: '12px',
          left: '-6px',
          top: '50%',
          transform: 'translateY(-50%)'
        }}
        isConnectable={isConnectable}
      />

      <Handle
        type='source'
        position={Position.Right}
        id='output'
        style={{
          background: '#e5e7eb',
          border: '1px solid #D3D3D3',
          width: '12px',
          height: '12px',
          right: '-6px',
          top: '50%',
          transform: 'translateY(-50%)'
        }}
        isConnectable={isConnectable}
      />

      {/* 輸入面板 */}
      {showInputPanel && connectionCount > 0 && activeTab === 'editor' && (
        <div className='fixed inset-0 z-[9999]'>
          {/* 透明背景層 */}
          <div
            className='absolute inset-0 bg-transparent pointer-events-auto'
            onClick={closeInputPanel}
          />

          {/* 面板內容 */}
          <div
            ref={inputPanelRef}
            className='absolute bg-white rounded-lg shadow-xl w-80 flex flex-col pointer-events-auto border border-gray-200 z-10 max-h-96'
            style={{
              left: `${(data?.position?.x || 0) - 320}px`,
              top: `${data?.position?.y || 0}px`
            }}
            onClick={(e) => e.stopPropagation()}>
            {/* 標題欄 */}
            <div className='flex items-center justify-between border-b p-2'>
              {/* 搜尋框 */}
              <div className='relative flex-1 mr-2'>
                <div className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'>
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
                    <circle
                      cx='11'
                      cy='11'
                      r='8'></circle>
                    <line
                      x1='21'
                      y1='21'
                      x2='16.65'
                      y2='16.65'></line>
                  </svg>
                </div>
                <input
                  type='text'
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  placeholder='Search...'
                  className='w-full pl-10 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              <button
                onClick={closeInputPanel}
                className='text-gray-400 hover:text-gray-600 transition-colors'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'>
                  <line
                    x1='18'
                    y1='6'
                    x2='6'
                    y2='18'></line>
                  <line
                    x1='6'
                    y1='6'
                    x2='18'
                    y2='18'></line>
                </svg>
              </button>
            </div>

            {/* 節點列表 */}
            <div className='flex-1 overflow-y-auto p-4'>
              <span className='mb-3 block'>Input</span>
              <div className='flex flex-col items-start'>
                {filteredNodes.map((nodeInfo, index) => (
                  <div
                    key={`${nodeInfo.id}-${index}`}
                    className='flex items-center px-3 py-2 rounded cursor-pointer text-white text-sm font-medium hover:opacity-80 transition-opacity mr-2 mb-2'
                    style={{ backgroundColor: nodeInfo.color }}
                    onClick={() => handleTagClick(nodeInfo)}
                    onDragStart={(e) => handleTagDragStart(e, nodeInfo)}
                    draggable
                    title='點擊插入或拖拽到文字區域'>
                    {nodeInfo.name}
                  </div>
                ))}

                {filteredNodes.length === 0 && (
                  <div className='text-gray-500 text-sm text-center py-4'>
                    {filterText ? '沒有找到符合的節點' : '沒有連線的節點'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default memo(CombineTextNode);
