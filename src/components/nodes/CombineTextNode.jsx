import React, {
  memo,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo
} from 'react';
import { Handle, Position, useEdges, useNodes } from 'reactflow';
import IconBase from '../icons/IconBase';
import CombineTextEditor from '../text/CombineTextEditor';
import CopytIncon from '../../assets/text-copy-off.png';
import { flushSync } from 'react-dom';
import { formatNodeTitle } from '../../utils/nodeUtils';

const CombineTextNode = ({ data, isConnectable, id }) => {
  const edges = useEdges();
  const nodes = useNodes();

  // 簡化的狀態管理
  const [content, setContent] = useState(data?.textToCombine || '');
  const [showInputPanel, setShowInputPanel] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [inputHandles, setInputHandles] = useState(
    data?.inputHandles || [{ id: 'text0' }]
  );
  const [activeTab, setActiveTab] = useState(data?.activeTab || 'editor');
  const [editorHtmlContent, setEditorHtmlContent] = useState(
    data?.editorHtmlContent || ''
  );
  const [isInitialized, setIsInitialized] = useState(false);

  // Refs
  const textareaRef = useRef(null);
  const previewRef = useRef(null);
  const inputPanelRef = useRef(null);

  // 性能優化的 refs
  const stableContentRef = useRef(data?.textToCombine || '');
  const updateTimeoutRef = useRef(null);
  const isUpdatingRef = useRef(false);
  const lastRenderContentRef = useRef(''); // 追蹤上次渲染的內容

  // 使用 useMemo 記憶化計算結果
  const connectionCount = useMemo(
    () => edges.filter((edge) => edge.target === id).length,
    [edges, id]
  );

  // 安全地獲取編輯器內容
  const getEditorContent = useCallback(() => {
    if (!textareaRef.current) return null;

    try {
      if (typeof textareaRef.current.getValue === 'function') {
        return textareaRef.current.getValue();
      }
    } catch (error) {
      console.warn('獲取編輯器內容失敗:', error);
    }

    return null;
  }, []);

  // 統一的內容更新方法
  const updateContent = useCallback(
    (newContent) => {
      if (isUpdatingRef.current) return;

      // 防止空內容覆蓋有效內容
      if (!newContent && stableContentRef.current) {
        console.warn('拒絕空內容更新，保持現有內容');
        return;
      }

      // 防止相同內容的重複更新
      if (newContent === stableContentRef.current) {
        return;
      }

      isUpdatingRef.current = true;

      try {
        // 更新穩定引用
        stableContentRef.current = newContent;

        // 更新狀態
        setContent(newContent);

        // 更新父組件
        if (data && typeof data.updateNodeData === 'function') {
          data.updateNodeData('textToCombine', newContent);
        }
      } finally {
        // 延遲重置更新標記
        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 100);
      }
    },
    [data]
  );

  // 獲取當前內容的統一方法 - 優化記憶化
  const getCurrentContent = useCallback(() => {
    // 如果在 editor 模式，優先從編輯器獲取
    if (activeTab === 'editor') {
      const editorContent = getEditorContent();
      if (editorContent !== null) {
        return editorContent;
      }
    }

    // 從狀態或穩定引用獲取
    return content || stableContentRef.current || '';
  }, [activeTab, content, getEditorContent]);

  // 防抖的文字內容變更處理
  const handleTextChange = useCallback(
    (e) => {
      const newContent = e.target.value;

      // 清除之前的更新計時器
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      // 延遲更新，避免頻繁觸發
      updateTimeoutRef.current = setTimeout(() => {
        updateContent(newContent, 'handleTextChange');

        // 更新 HTML 內容
        if (textareaRef.current) {
          try {
            const htmlContent = textareaRef.current.innerHTML || '';
            if (htmlContent !== editorHtmlContent) {
              setEditorHtmlContent(htmlContent);
              if (data && typeof data.updateNodeData === 'function') {
                data.updateNodeData('editorHtmlContent', htmlContent);
              }
            }
          } catch (error) {
            console.warn('更新 HTML 內容失敗:', error);
          }
        }
      }, 300); // 增加防抖時間
    },
    [updateContent, editorHtmlContent, data]
  );

  // 處理標籤插入
  const handleTagInsert = useCallback(() => {
    // 延遲獲取編輯器內容，確保 DOM 更新完成
    setTimeout(() => {
      const editorContent = getEditorContent();
      if (editorContent) {
        updateContent(editorContent, 'handleTagInsert');

        // 更新 HTML 內容
        if (textareaRef.current) {
          try {
            const htmlContent = textareaRef.current.innerHTML || '';
            setEditorHtmlContent(htmlContent);
            if (data && typeof data.updateNodeData === 'function') {
              data.updateNodeData('editorHtmlContent', htmlContent);
            }
          } catch (error) {
            console.warn('更新 HTML 內容失敗:', error);
          }
        }
      }
    }, 200);
  }, [getEditorContent, updateContent, data]);

  // Tab 切換處理
  const handleTabChange = useCallback(
    (newTab) => {
      // 如果從 editor 切換到 preview，先同步內容
      if (activeTab === 'editor' && newTab === 'preview') {
        const currentContent = getEditorContent();
        if (currentContent && currentContent !== stableContentRef.current) {
          try {
            flushSync(() => {
              updateContent(currentContent, 'handleTabChange');
              setActiveTab(newTab);
            });
          } catch (error) {
            console.error('flushSync 失敗:', error);
            updateContent(currentContent, 'handleTabChange');
            setActiveTab(newTab);
          }

          // 更新父組件狀態
          if (data && typeof data.updateNodeData === 'function') {
            data.updateNodeData('activeTab', newTab);
          }

          return;
        }
      }

      // 其他情況直接切換
      setActiveTab(newTab);
      if (data && typeof data.updateNodeData === 'function') {
        data.updateNodeData('activeTab', newTab);
      }
    },
    [activeTab, getEditorContent, updateContent, data]
  );

  // 記憶化的複製功能
  const copyToClipboard = useCallback(async () => {
    try {
      const selection = window.getSelection();
      let textToCopy = '';
      let copyType = '';

      if (selection && selection.toString().trim()) {
        textToCopy = selection.toString();
        copyType = '選取內容';
      } else {
        textToCopy = getCurrentContent();
        copyType = 'Preview內容';
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(textToCopy);
          if (typeof window !== 'undefined' && window.notify) {
            window.notify({
              message: `已複製${copyType}到剪貼板`,
              type: 'success',
              duration: 2000
            });
          }
          return;
        } catch (clipboardError) {
          console.warn('Clipboard API 失敗，嘗試 fallback:', clipboardError);
        }
      }

      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      textArea.style.cssText =
        'position:fixed;top:0;left:0;opacity:0;pointer-events:none;';

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      if (successful) {
        if (typeof window !== 'undefined' && window.notify) {
          window.notify({
            message: `已複製${copyType}到剪貼板`,
            type: 'success',
            duration: 2000
          });
        }
      } else {
        throw new Error('所有複製方法都失敗');
      }
    } catch (error) {
      console.error('複製失敗:', error);
      if (typeof window !== 'undefined' && window.notify) {
        window.notify({
          message: '複製失敗，請手動複製 Prompt',
          type: 'error',
          duration: 3000
        });
      }
    }
  }, [getCurrentContent]);

  // 記憶化的面板控制函數
  const closeInputPanel = useCallback(() => {
    setShowInputPanel(false);
    setFilterText('');
  }, []);

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

  // 記憶化的標籤處理函數
  const handleTagClick = useCallback(
    (nodeInfo) => {
      console.log('標籤被點擊:', nodeInfo);
      if (textareaRef.current && textareaRef.current.insertTagAtCursor) {
        textareaRef.current.insertTagAtCursor(nodeInfo);

        // 延遲獲取更新後的內容
        setTimeout(() => {
          const newContent = getEditorContent();
          if (newContent) {
            updateContent(newContent, 'handleTagClick');
          }
        }, 100);
      }
      closeInputPanel();
    },
    [getEditorContent, updateContent, closeInputPanel]
  );

  const handleTagDragStart = useCallback((e, nodeInfo) => {
    console.log('🔥 標籤開始拖曳:', nodeInfo);

    // 設置拖曳數據
    e.dataTransfer.setData('text/plain', JSON.stringify(nodeInfo));
    e.dataTransfer.effectAllowed = 'copy';

    // 添加視覺反饋 - 使用拖曳時的透明度
    e.target.style.opacity = '0.5';

    console.log('🎯 拖曳數據已設置，效果:', e.dataTransfer.effectAllowed);
  }, []);

  const handleTagDragEnd = useCallback((e) => {
    console.log('🏁 標籤拖曳結束');
    e.target.style.opacity = '1';
  }, []);

  // 記憶化的事件處理函數
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

  const handleMouseDown = useCallback((e) => e.stopPropagation(), []);
  const handleMouseMove = useCallback((e) => e.stopPropagation(), []);
  const handleMouseUp = useCallback((e) => e.stopPropagation(), []);

  // 記憶化的 getFlowId
  const getFlowId = useCallback(() => {
    if (data?.flowId) return data.flowId;

    const urlParams = new URLSearchParams(window.location.search);
    const urlFlowId = urlParams.get('flowId') || urlParams.get('flow_id');
    if (urlFlowId) return urlFlowId;

    const pathMatch = window.location.pathname.match(/\/flow\/([^\/]+)/);
    if (pathMatch) return pathMatch[1];

    if (typeof window !== 'undefined' && window.currentFlowId) {
      return window.currentFlowId;
    }

    return '';
  }, [data?.flowId]);

  // 記憶化連線節點信息
  const connectedNodesInfo = useMemo(() => {
    const connectedEdges = edges.filter((edge) => edge.target === id);
    return connectedEdges.map((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);

      // 獲取節點顯示名稱
      const getNodeDisplayName = (sourceNode) => {
        if (!sourceNode) return 'Unknown';
        switch (sourceNode.type) {
          case 'customInput':
          case 'input':
            return 'Input';
          case 'aiCustomInput':
          case 'ai':
            return 'AI';
          case 'aim_ml':
            return 'ML Node';
          case 'browserExtensionInput':
            return 'Browser Extension Input';
          case 'webhook_input':
            return 'Webhook Input Node';
          case 'knowledgeRetrieval':
            return 'Knowledge Retrieval';
          case 'extract_data':
            return 'Extract Data Node';
          case 'line_webhook_input':
            return 'Line Webhook Input';
          case 'httpRequest':
            return 'HTTP Request Node';
          case 'schedule_trigger':
            return 'Schedule node';
          case 'combine_text':
            return 'Combine Text Node';
          case 'webhook_output':
            return 'Webhook Output Node';
          case 'browserExtensionOutput':
            return 'Browser Extension Output';
          case 'router_switch':
            return 'Router Switch Node';
          default:
            return `${
              sourceNode.type.charAt(0).toUpperCase() + sourceNode.type.slice(1)
            }`;
        }
      };

      // 獲取節點標籤顏色
      const getNodeTagColor = (nodeName) => {
        const colorMap = {
          Input: '#0075FF',
          AI: '#FFAA1E',
          'Knowledge Retrieval': '#87CEEB',
          'Browser Extension Input': '#1FCD28',
          'Line Webhook Input': '#06C755',
          'Extract Data Node': '#D97706',
          'ML Node': '#098D7F',
          'HTTP Request Node': '#F8D7DA',
          'Schedule node': '#DCCAFA',
          'Webhook Input Node': '#FC6165',
          'Combine Text Node': '#4E7ECF',
          'Router Switch Node': '#00ced1'
        };
        return colorMap[nodeName] || '#6b7280';
      };

      const nodeName = getNodeDisplayName(sourceNode);

      return {
        id: edge.source,
        name: nodeName,
        outputName: edge.sourceHandle || 'output',
        handleId: edge.targetHandle,
        nodeType: sourceNode?.type || 'unknown',
        data: `QOCA__NODE_ID__${edge.source}__NODE_OUTPUT_NAME__${
          edge.sourceHandle || 'output'
        }`,
        code: `QOCA__NODE_ID__${edge.source}__NODE_OUTPUT_NAME__${
          edge.sourceHandle || 'output'
        }`,
        color: getNodeTagColor(nodeName)
      };
    });
  }, [edges, nodes, id]);

  // 過濾連線節點 - 記憶化
  const filteredNodes = useMemo(
    () =>
      connectedNodesInfo.filter((node) =>
        node.name.toLowerCase().includes(filterText.toLowerCase())
      ),
    [connectedNodesInfo, filterText]
  );

  // 記憶化的 Preview 內容
  const previewContent = useMemo(() => {
    const displayContent = getCurrentContent();

    // 只在內容真的改變時才輸出 log
    if (displayContent !== lastRenderContentRef.current) {
      console.log('Preview 內容更新:', displayContent?.substring(0, 100));
      lastRenderContentRef.current = displayContent;
    }

    return displayContent || '點擊此處編輯內容...';
  }, [getCurrentContent]);

  // 初始化
  useEffect(() => {
    if (!isInitialized && data) {
      console.log('執行一次性初始化同步');

      const initialContent = data.textToCombine || '';
      stableContentRef.current = initialContent;
      lastRenderContentRef.current = initialContent; // 初始化 lastRenderContentRef

      if (data.activeTab && data.activeTab !== activeTab) {
        setActiveTab(data.activeTab);
      }
      if (
        data.editorHtmlContent &&
        data.editorHtmlContent !== editorHtmlContent
      ) {
        setEditorHtmlContent(data.editorHtmlContent);
      }
      if (initialContent !== content) {
        setContent(initialContent);
      }

      setIsInitialized(true);
    }
  }, [data, isInitialized, activeTab, editorHtmlContent, content]);

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

  // 優化的邊緣連線同步 - 使用唯一的連線識別
  useEffect(() => {
    const connectedEdges = edges.filter((edge) => edge.target === id);

    if (
      connectedEdges.length > 0 &&
      data &&
      typeof data.updateNodeData === 'function'
    ) {
      const currentNodeInput = data.node_input || {};
      const newNodeInput = {};

      // 使用 node_id + output_name 作為唯一連線識別
      const existingConnections = new Map();
      Object.entries(currentNodeInput).forEach(([key, value]) => {
        if (key.startsWith('text') && value.node_id) {
          const connectionKey = `${value.node_id}:${
            value.output_name || 'output'
          }`;
          existingConnections.set(connectionKey, {
            key,
            value,
            index: parseInt(key.replace('text', '')) || 0
          });
        }
      });

      const sortedEdges = connectedEdges.sort((a, b) => {
        // 使用相同的 key 格式
        const aConnectionKey = `${a.source}:${a.sourceHandle || 'output'}`;
        const bConnectionKey = `${b.source}:${b.sourceHandle || 'output'}`;

        const aExisting = existingConnections.get(aConnectionKey);
        const bExisting = existingConnections.get(bConnectionKey);

        if (aExisting && bExisting) {
          return aExisting.index - bExisting.index;
        } else if (aExisting) {
          return -1;
        } else if (bExisting) {
          return 1;
        } else {
          return a.source.localeCompare(b.source);
        }
      });

      const usedIndices = new Set();

      sortedEdges.forEach((edge) => {
        // 使用相同的 key 格式檢查現有連線
        const connectionKey = `${edge.source}:${edge.sourceHandle || 'output'}`;
        const existingConnection = existingConnections.get(connectionKey);
        let inputKey;

        if (existingConnection) {
          inputKey = existingConnection.key;
          usedIndices.add(existingConnection.index);
        } else {
          let newIndex = 0;
          while (usedIndices.has(newIndex)) {
            newIndex++;
          }
          inputKey = `text${newIndex}`;
          usedIndices.add(newIndex);
        }

        const sourceNode = nodes.find((n) => n.id === edge.source);
        let returnName = edge.label || 'output';

        if (sourceNode) {
          if (
            sourceNode.type === 'customInput' ||
            sourceNode.type === 'input'
          ) {
            if (sourceNode.data?.fields?.[0]?.inputName) {
              returnName = sourceNode.data.fields[0].inputName;
            }
          } else if (sourceNode.type === 'browserExtensionInput') {
            const targetItem = sourceNode.data?.items?.find(
              (item) => item.id === edge.sourceHandle
            );
            if (targetItem?.name) {
              returnName = targetItem.name;
            }
          } else if (
            sourceNode.type === 'aiCustomInput' ||
            sourceNode.type === 'ai'
          ) {
            returnName = 'output';
          } else if (sourceNode.type === 'knowledgeRetrieval') {
            returnName = 'output';
          } else if (sourceNode.type === 'schedule_trigger') {
            returnName = 'trigger';
          } else if (sourceNode.type === 'router_switch') {
            // 為 Router Switch Node 設置正確的 return_name
            returnName = edge.sourceHandle || 'output';
          }
        }

        newNodeInput[inputKey] = {
          node_id: edge.source,
          output_name: edge.sourceHandle || 'output',
          type: 'string',
          return_name: returnName
        };
      });

      // 只在真的有變化時才更新
      if (JSON.stringify(currentNodeInput) !== JSON.stringify(newNodeInput)) {
        data.updateNodeData('node_input', newNodeInput);
      }
    }
  }, [edges, id, data, nodes]);

  // 清理計時器
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div className='rounded-lg shadow-md overflow-hidden w-96'>
        {/* Header section */}
        <div className='bg-[#dbeafe] p-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <div className='w-6 h-6 flex items-center justify-center text-white mr-2'>
                <IconBase type='combine_text' />
              </div>
              <span className='font-medium'>
                {formatNodeTitle('Combine Text', id)}
              </span>
            </div>
            {connectionCount > 0 && (
              <span className='text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full'>
                已連線
              </span>
            )}
          </div>
        </div>

        {/* Content area */}
        <div className='bg-white p-4'>
          <div className='mb-2'>
            <div className='flex items-center justify-between'>
              <label className='block text-sm text-gray-700 font-bold'>
                Compose
              </label>
              <div className='group relative'>
                <button
                  onClick={copyToClipboard}
                  className='px-3 py-1 text-white rounded-md transition-colors text-sm flex items-center space-x-1'>
                  <img
                    src={CopytIncon}
                    alt='Copy Icon'
                    className='text-white'
                    width={16}
                    height={16}
                  />
                </button>
                <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[10000]'>
                  複製
                  <div className='absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800'></div>
                </div>
              </div>
            </div>

            {/* Tab 切換器 */}
            <div className='flex mb-4 bg-gray-100 rounded-lg p-1 mt-2'>
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
                  value={isInitialized ? undefined : content}
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
                    overflow: 'auto',
                    wordBreak: 'break-all',
                    overflowWrap: 'anywhere'
                  }}
                  onWheel={handleWheel}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}>
                  <pre
                    className='whitespace-pre-wrap'
                    style={{
                      wordBreak: 'break-all',
                      whiteSpace: 'pre-wrap',
                      margin: 0
                    }}>
                    {previewContent}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Handles */}
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

      {/* Input Panel - 修復拖曳功能 */}
      {showInputPanel && connectionCount > 0 && activeTab === 'editor' && (
        <div className='fixed inset-0 z-[9998]'>
          <div
            className='absolute inset-0 bg-transparent pointer-events-auto'
            onClick={closeInputPanel}
          />
          <div
            ref={inputPanelRef}
            className='absolute bg-white rounded-lg shadow-xl w-80 flex flex-col pointer-events-auto border border-gray-200 z-[9999]'
            style={{
              left: `${(data?.position?.x || 0) - 320}px`,
              top: `${data?.position?.y || 0}px`,
              maxHeight: '400px'
            }}
            onClick={(e) => e.stopPropagation()}>
            <div className='flex items-center justify-between border-b p-2 flex-shrink-0'>
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
                className='text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0'>
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
            <div
              className='flex-1 overflow-y-auto p-4 min-h-0'
              style={{ maxHeight: 'calc(400px - 60px)' }}
              onWheelCapture={(e) => e.stopPropagation()}
              onMouseDownCapture={(e) => e.stopPropagation()}>
              <span className='mb-3 block text-sm font-medium text-gray-700'>
                Input
              </span>
              <div className='flex flex-col items-start'>
                {filteredNodes.map((nodeInfo, index) => (
                  <div
                    key={`${nodeInfo.id}-${index}`}
                    className='flex items-center px-3 py-2 rounded cursor-pointer text-white text-sm font-medium hover:opacity-80 transition-all duration-200 mr-2 mb-2 w-full select-none'
                    style={{
                      backgroundColor: nodeInfo.color,
                      userSelect: 'none'
                    }}
                    onClick={() => handleTagClick(nodeInfo)}
                    onDragStart={(e) => handleTagDragStart(e, nodeInfo)}
                    onDragEnd={handleTagDragEnd}
                    draggable
                    title='點擊插入或拖拽到文字區域'>
                    <span className='truncate pointer-events-none'>
                      {nodeInfo.name} ({nodeInfo.id.slice(-3)})
                    </span>
                  </div>
                ))}
                {filteredNodes.length === 0 && (
                  <div className='text-gray-500 text-sm text-center py-8 w-full'>
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
