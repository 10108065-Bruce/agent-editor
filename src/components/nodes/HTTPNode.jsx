import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import { Handle, Position, useEdges, useNodes } from 'reactflow';
import IconBase from '../icons/IconBase';
import AddIcon from '../icons/AddIcon';
import CombineTextEditor from '../text/CombineTextEditor';
import { formatNodeTitle } from '../../utils/nodeUtils';

const HttpRequestNode = ({ data, isConnectable, id }) => {
  // 管理各個狀態
  const [localUrl, setLocalUrl] = useState(data?.url || '');
  const [localMethod, setLocalMethod] = useState(data?.method || 'GET');
  const [headers, setHeaders] = useState(
    data?.headers || [{ key: '', value: '' }]
  );
  const [localBody, setLocalBody] = useState(data?.body || '');
  const [editorHtmlContent, setEditorHtmlContent] = useState(
    data?.editorHtmlContent || ''
  );
  const [isInitialized, setIsInitialized] = useState(false);

  const edges = useEdges();
  const nodes = useNodes();

  // 計算 body 連線數量
  const bodyConnectionCount = edges.filter(
    (edge) => edge.target === id && edge.targetHandle === 'body'
  ).length;

  // Body 編輯器相關
  const bodyEditorRef = useRef(null);
  const [showInputPanel, setShowInputPanel] = useState(false);
  const [filterText, setFilterText] = useState('');

  // IME 和用戶輸入狀態追蹤 - URL 欄位
  const isComposingUrlRef = useRef(false);
  const updateUrlTimeoutRef = useRef(null);
  const lastExternalUrlRef = useRef(data?.url || '');
  const isUserInputUrlRef = useRef(false);

  // IME 和用戶輸入狀態追蹤 - Body 欄位
  const isComposingBodyRef = useRef(false);
  const updateBodyTimeoutRef = useRef(null);
  const lastExternalBodyRef = useRef(data?.body || '');
  const isUserInputBodyRef = useRef(false);

  // Header 欄位的 IME 狀態追蹤
  const isComposingHeaderKeyRef = useRef({});
  const isComposingHeaderValueRef = useRef({});
  const updateHeaderTimeoutRef = useRef({});
  const isUserInputHeaderRef = useRef({});
  const lastExternalHeaderRef = useRef({});

  // 初始化處理
  useEffect(() => {
    if (!isInitialized && data) {
      const initialContent = data.body || '';
      const initialHtmlContent = data.editorHtmlContent || '';

      if (initialContent) {
        setLocalBody(initialContent);
        lastExternalBodyRef.current = initialContent;
      }

      if (initialHtmlContent) {
        setEditorHtmlContent(initialHtmlContent);
      }

      setIsInitialized(true);
    }
  }, [data, isInitialized]);

  // 邊緣變化監聽 - 處理斷開連線的標籤清理
  useEffect(() => {
    const connectedEdges = edges.filter(
      (edge) => edge.target === id && edge.targetHandle === 'body'
    );

    if (data && typeof data.updateNodeData === 'function') {
      const currentNodeInput = data.node_input || {};
      const newNodeInput = {};

      // 記錄連接狀態，用於檢測刪除的連接
      const currentConnections = new Set();
      const previousConnections = new Set();

      // 收集當前連接
      connectedEdges.forEach((edge) => {
        const connectionKey = `${edge.source}:${edge.sourceHandle || 'output'}`;
        currentConnections.add(connectionKey);
      });

      // 收集之前的連接
      Object.entries(currentNodeInput).forEach(([key, value]) => {
        if (key.startsWith('body') && value.node_id) {
          const connectionKey = `${value.node_id}:${
            value.output_name || 'output'
          }`;
          previousConnections.add(connectionKey);
        }
      });

      // 找出被刪除的連接
      const deletedConnections = Array.from(previousConnections).filter(
        (connectionKey) => !currentConnections.has(connectionKey)
      );

      // 清理被刪除連接對應的tags
      if (
        deletedConnections.length > 0 &&
        bodyEditorRef.current &&
        typeof bodyEditorRef.current.cleanupTagsByConnection === 'function'
      ) {
        let totalCleaned = 0;
        deletedConnections.forEach((connectionKey) => {
          const [nodeId, outputName] = connectionKey.split(':');
          const cleaned = bodyEditorRef.current.cleanupTagsByConnection(
            nodeId,
            outputName
          );
          totalCleaned += cleaned;
        });

        if (totalCleaned > 0) {
          console.log(`成功清理了 ${totalCleaned} 個斷開連接的tag`);
        }
      }

      // 建立新的 node_input
      const sortedEdges = connectedEdges.sort((a, b) => {
        return a.source.localeCompare(b.source);
      });

      sortedEdges.forEach((edge, index) => {
        const inputKey = `body${index}`;

        // 查找源節點以獲取 return_name
        const sourceNode = nodes.find((n) => n.id === edge.source);
        let returnName = edge.label || '';

        if (sourceNode) {
          if (
            sourceNode.type === 'customInput' ||
            sourceNode.type === 'input'
          ) {
            if (sourceNode.data?.fields?.[0]?.inputName) {
              returnName = sourceNode.data.fields[0].inputName || returnName;
            }
          } else if (sourceNode.type === 'browserExtensionInput') {
            const targetItem = sourceNode.data?.items?.find(
              (item) => item.id === edge.sourceHandle
            );
            if (targetItem?.name) {
              returnName = targetItem.name;
            }
          } else {
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

  // 改進的同步狀態
  useEffect(() => {
    if (
      data?.url !== undefined &&
      data.url !== lastExternalUrlRef.current &&
      !isComposingUrlRef.current &&
      !isUserInputUrlRef.current
    ) {
      setLocalUrl(data.url);
      lastExternalUrlRef.current = data.url;
    }
  }, [data?.url]);

  useEffect(() => {
    if (data?.method && data.method !== localMethod) {
      setLocalMethod(data.method);
    }
  }, [data?.method, localMethod]);

  useEffect(() => {
    if (
      data?.headers &&
      JSON.stringify(data.headers) !== JSON.stringify(headers)
    ) {
      setHeaders(data.headers);
    }
  }, [data?.headers, headers]);

  useEffect(() => {
    if (
      data?.body !== undefined &&
      data.body !== lastExternalBodyRef.current &&
      !isComposingBodyRef.current &&
      !isUserInputBodyRef.current
    ) {
      setLocalBody(data.body);
      lastExternalBodyRef.current = data.body;
    }

    if (
      data?.editorHtmlContent !== undefined &&
      data.editorHtmlContent !== editorHtmlContent
    ) {
      setEditorHtmlContent(data.editorHtmlContent);
    }
  }, [data?.body, data?.editorHtmlContent, editorHtmlContent]);

  const updateParentState = useCallback(
    (key, value) => {
      if (data && typeof data.updateNodeData === 'function') {
        data.updateNodeData(key, value);
        return true;
      }
      if (data) {
        data[key] = value;
        return true;
      }
      return false;
    },
    [data]
  );

  // 取得編輯器內容
  const getEditorContent = useCallback(() => {
    if (!bodyEditorRef.current) return null;
    try {
      if (typeof bodyEditorRef.current.getValue === 'function') {
        return bodyEditorRef.current.getValue();
      }
    } catch (error) {
      console.warn('獲取編輯器內容失敗:', error);
    }
    return null;
  }, []);

  // Body 編輯器變更處理
  const handleBodyChange = useCallback(
    (e) => {
      const newBody = e.target.value;

      // 立即更新本地狀態
      isUserInputBodyRef.current = true;
      setLocalBody(newBody);
      lastExternalBodyRef.current = newBody;

      // 清除之前的計時器
      if (updateBodyTimeoutRef.current) {
        clearTimeout(updateBodyTimeoutRef.current);
      }

      // 使用極短的延遲（10ms）來批量處理快速輸入
      updateBodyTimeoutRef.current = setTimeout(() => {
        // 立即更新父組件狀態
        updateParentState('body', newBody);

        // 更新 HTML 內容
        if (bodyEditorRef.current) {
          try {
            const htmlContent = bodyEditorRef.current.innerHTML || '';
            if (htmlContent !== editorHtmlContent) {
              setEditorHtmlContent(htmlContent);
              updateParentState('editorHtmlContent', htmlContent);
            }
          } catch (error) {
            console.warn('更新 HTML 內容失敗:', error);
          }
        }

        isUserInputBodyRef.current = false;
      }, 10); // 改為 10ms
    },
    [updateParentState, editorHtmlContent]
  );

  // 處理標籤插入
  const handleTagInsert = useCallback(() => {
    setTimeout(() => {
      const editorContent = getEditorContent();
      if (editorContent) {
        setLocalBody(editorContent);
        updateParentState('body', editorContent);

        if (bodyEditorRef.current) {
          try {
            const htmlContent = bodyEditorRef.current.innerHTML || '';
            setEditorHtmlContent(htmlContent);
            updateParentState('editorHtmlContent', htmlContent);
          } catch (error) {
            console.warn('更新 HTML 內容失敗:', error);
          }
        }
      }
    }, 200);
  }, [getEditorContent, updateParentState]);

  // Body IME 組合處理
  const handleBodyCompositionStart = useCallback(() => {
    isComposingBodyRef.current = true;
    isUserInputBodyRef.current = true;
    if (updateBodyTimeoutRef.current) {
      clearTimeout(updateBodyTimeoutRef.current);
      updateBodyTimeoutRef.current = null;
    }
  }, []);

  const handleBodyCompositionEnd = useCallback(
    (e) => {
      isComposingBodyRef.current = false;
      const finalValue = e.target.value;

      // 立即更新所有狀態
      setLocalBody(finalValue);
      lastExternalBodyRef.current = finalValue;

      // 立即更新父組件，不使用延遲
      updateParentState('body', finalValue);

      // 更新 HTML 內容
      if (bodyEditorRef.current) {
        try {
          const htmlContent = bodyEditorRef.current.innerHTML || '';
          if (htmlContent !== editorHtmlContent) {
            setEditorHtmlContent(htmlContent);
            updateParentState('editorHtmlContent', htmlContent);
          }
        } catch (error) {
          console.warn('更新 HTML 內容失敗:', error);
        }
      }

      // 重置標記
      setTimeout(() => {
        isUserInputBodyRef.current = false;
      }, 10);
    },
    [updateParentState, editorHtmlContent]
  );

  // Body 鍵盤事件處理
  const handleBodyKeyDown = useCallback((e) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      isUserInputBodyRef.current = true;
      setTimeout(() => {
        isUserInputBodyRef.current = false;
      }, 300);
    }
  }, []);

  // URL 變更處理 - 支援 IME
  const handleUrlChange = useCallback(
    (e) => {
      const newUrl = e.target.value;
      isUserInputUrlRef.current = true;
      setLocalUrl(newUrl);
      lastExternalUrlRef.current = newUrl;

      if (updateUrlTimeoutRef.current) {
        clearTimeout(updateUrlTimeoutRef.current);
      }

      if (!isComposingUrlRef.current) {
        updateUrlTimeoutRef.current = setTimeout(() => {
          updateParentState('url', newUrl);
          setTimeout(() => {
            isUserInputUrlRef.current = false;
          }, 100);
        }, 150);
      }
    },
    [updateParentState]
  );

  const handleUrlCompositionStart = useCallback(() => {
    isComposingUrlRef.current = true;
    isUserInputUrlRef.current = true;
    if (updateUrlTimeoutRef.current) {
      clearTimeout(updateUrlTimeoutRef.current);
      updateUrlTimeoutRef.current = null;
    }
  }, []);

  const handleUrlCompositionEnd = useCallback(
    (e) => {
      isComposingUrlRef.current = false;
      const finalValue = e.target.value;
      setLocalUrl(finalValue);
      lastExternalUrlRef.current = finalValue;
      updateParentState('url', finalValue);
      setTimeout(() => {
        isUserInputUrlRef.current = false;
      }, 200);
    },
    [updateParentState]
  );

  const handleUrlKeyDown = useCallback((e) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      isUserInputUrlRef.current = true;
      setTimeout(() => {
        isUserInputUrlRef.current = false;
      }, 300);
    }
  }, []);

  // Method 變更處理
  const handleMethodChange = useCallback(
    (e) => {
      const newMethod = e.target.value;
      setLocalMethod(newMethod);
      updateParentState('method', newMethod);
    },
    [updateParentState]
  );

  // Headers 處理函數保持不變
  const handleAddHeader = useCallback(() => {
    const newHeader = { key: '', value: '' };
    const newHeaders = [...headers, newHeader];
    setHeaders(newHeaders);
    updateParentState('headers', newHeaders);
  }, [headers, updateParentState]);

  const handleDeleteHeader = useCallback(
    (index) => {
      const newHeaders = headers.filter((_, i) => i !== index);
      setHeaders(newHeaders);
      updateParentState('headers', newHeaders);

      // 清理該索引的相關 ref
      delete isComposingHeaderKeyRef.current[index];
      delete isComposingHeaderValueRef.current[index];
      delete updateHeaderTimeoutRef.current[`key_${index}`];
      delete updateHeaderTimeoutRef.current[`value_${index}`];
      delete isUserInputHeaderRef.current[`key_${index}`];
      delete isUserInputHeaderRef.current[`value_${index}`];
      delete lastExternalHeaderRef.current[`key_${index}`];
      delete lastExternalHeaderRef.current[`value_${index}`];
    },
    [headers, updateParentState]
  );

  const handleHeaderKeyChange = useCallback(
    (index, value) => {
      const fieldKey = `key_${index}`;
      isUserInputHeaderRef.current[fieldKey] = true;

      const newHeaders = [...headers];
      newHeaders[index].key = value;
      setHeaders(newHeaders);
      lastExternalHeaderRef.current[fieldKey] = value;

      if (updateHeaderTimeoutRef.current[fieldKey]) {
        clearTimeout(updateHeaderTimeoutRef.current[fieldKey]);
      }

      if (!isComposingHeaderKeyRef.current[index]) {
        updateHeaderTimeoutRef.current[fieldKey] = setTimeout(() => {
          updateParentState('headers', newHeaders);
          setTimeout(() => {
            isUserInputHeaderRef.current[fieldKey] = false;
          }, 100);
        }, 150);
      }
    },
    [headers, updateParentState]
  );

  const handleHeaderValueChange = useCallback(
    (index, value) => {
      const fieldKey = `value_${index}`;
      isUserInputHeaderRef.current[fieldKey] = true;

      const newHeaders = [...headers];
      newHeaders[index].value = value;
      setHeaders(newHeaders);
      lastExternalHeaderRef.current[fieldKey] = value;

      if (updateHeaderTimeoutRef.current[fieldKey]) {
        clearTimeout(updateHeaderTimeoutRef.current[fieldKey]);
      }

      if (!isComposingHeaderValueRef.current[index]) {
        updateHeaderTimeoutRef.current[fieldKey] = setTimeout(() => {
          updateParentState('headers', newHeaders);
          setTimeout(() => {
            isUserInputHeaderRef.current[fieldKey] = false;
          }, 100);
        }, 150);
      }
    },
    [headers, updateParentState]
  );

  const handleHeaderKeyCompositionStart = useCallback((index) => {
    isComposingHeaderKeyRef.current[index] = true;
    isUserInputHeaderRef.current[`key_${index}`] = true;
    const fieldKey = `key_${index}`;
    if (updateHeaderTimeoutRef.current[fieldKey]) {
      clearTimeout(updateHeaderTimeoutRef.current[fieldKey]);
      updateHeaderTimeoutRef.current[fieldKey] = null;
    }
  }, []);

  const handleHeaderKeyCompositionEnd = useCallback(
    (index, e) => {
      isComposingHeaderKeyRef.current[index] = false;
      const finalValue = e.target.value;
      const newHeaders = [...headers];
      newHeaders[index].key = finalValue;
      setHeaders(newHeaders);
      lastExternalHeaderRef.current[`key_${index}`] = finalValue;
      updateParentState('headers', newHeaders);
      setTimeout(() => {
        isUserInputHeaderRef.current[`key_${index}`] = false;
      }, 200);
    },
    [headers, updateParentState]
  );

  const handleHeaderValueCompositionStart = useCallback((index) => {
    isComposingHeaderValueRef.current[index] = true;
    isUserInputHeaderRef.current[`value_${index}`] = true;
    const fieldKey = `value_${index}`;
    if (updateHeaderTimeoutRef.current[fieldKey]) {
      clearTimeout(updateHeaderTimeoutRef.current[fieldKey]);
      updateHeaderTimeoutRef.current[fieldKey] = null;
    }
  }, []);

  const handleHeaderValueCompositionEnd = useCallback(
    (index, e) => {
      isComposingHeaderValueRef.current[index] = false;
      const finalValue = e.target.value;
      const newHeaders = [...headers];
      newHeaders[index].value = finalValue;
      setHeaders(newHeaders);
      lastExternalHeaderRef.current[`value_${index}`] = finalValue;
      updateParentState('headers', newHeaders);
      setTimeout(() => {
        isUserInputHeaderRef.current[`value_${index}`] = false;
      }, 200);
    },
    [headers, updateParentState]
  );

  const handleHeaderKeyDown = useCallback((index, type, e) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      const fieldKey = `${type}_${index}`;
      isUserInputHeaderRef.current[fieldKey] = true;
      setTimeout(() => {
        isUserInputHeaderRef.current[fieldKey] = false;
      }, 300);
    }
  }, []);

  // 獲取當前 flow_id
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

  // 獲取連線節點信息
  const connectedNodesInfo = React.useMemo(() => {
    const connectedEdges = edges.filter(
      (edge) => edge.target === id && edge.targetHandle === 'body'
    );

    return connectedEdges.map((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);

      const getNodeDisplayName = (sourceNode) => {
        if (!sourceNode) return 'Unknown';
        switch (sourceNode.type) {
          case 'customInput':
          case 'input':
            return 'Input';
          case 'aiCustomInput':
          case 'ai':
            return 'AI';
          case 'combine_text':
            return 'Combine Text Node';
          case 'knowledgeRetrieval':
            return 'Knowledge Retrieval';
          case 'aim_ml':
            return `QOCA aim Node - ${edge.sourceHandle}`;
          default:
            return (
              sourceNode.type.charAt(0).toUpperCase() + sourceNode.type.slice(1)
            );
        }
      };

      const getNodeTagColor = (nodeName) => {
        const lowerNodeName = nodeName.toLowerCase();
        const colorMap = [
          { keyword: 'combine text node', color: '#4E7ECF' },
          { keyword: 'knowledge retrieval', color: '#87CEEB' },
          { keyword: 'qoca aim node', color: '#098D7F' },
          { keyword: 'input', color: '#0075FF' },
          { keyword: 'ai', color: '#FFAA1E' }
        ];
        for (const { keyword, color } of colorMap) {
          if (lowerNodeName.includes(keyword)) {
            return color;
          }
        }
        return '#6b7280';
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
        }__ENDMARKER__`,
        code: `QOCA__NODE_ID__${edge.source}__NODE_OUTPUT_NAME__${
          edge.sourceHandle || 'output'
        }__ENDMARKER__`,
        color: getNodeTagColor(nodeName)
      };
    });
  }, [edges, nodes, id]);

  // 過濾連線節點
  const filteredNodes = React.useMemo(
    () =>
      connectedNodesInfo.filter((node) =>
        node.name.toLowerCase().includes(filterText.toLowerCase())
      ),
    [connectedNodesInfo, filterText]
  );

  // 處理標籤點擊
  const handleTagClick = useCallback(
    (nodeInfo) => {
      if (bodyEditorRef.current && bodyEditorRef.current.insertTagAtCursor) {
        bodyEditorRef.current.insertTagAtCursor(nodeInfo);
        setTimeout(() => {
          const newContent = getEditorContent();
          if (newContent) {
            setLocalBody(newContent);
            updateParentState('body', newContent);
          }
        }, 100);
      }
      setShowInputPanel(false);
      setFilterText('');
    },
    [getEditorContent, updateParentState]
  );

  const handleTagDragStart = useCallback((e, nodeInfo) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(nodeInfo));
    e.dataTransfer.effectAllowed = 'copy';
    e.target.style.opacity = '0.5';
  }, []);

  const handleTagDragEnd = useCallback((e) => {
    e.target.style.opacity = '1';
  }, []);

  const closeInputPanel = useCallback(() => {
    setShowInputPanel(false);
    setFilterText('');
  }, []);

  const handleShowPanel = useCallback((show) => {
    setShowInputPanel(show);
    if (!show) {
      setFilterText('');
    }
  }, []);

  // 清理計時器
  useEffect(() => {
    return () => {
      if (updateUrlTimeoutRef.current) {
        clearTimeout(updateUrlTimeoutRef.current);
      }
      if (updateBodyTimeoutRef.current) {
        clearTimeout(updateBodyTimeoutRef.current);
      }
      Object.values(updateHeaderTimeoutRef.current).forEach((timeout) => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  const methodOptions = [
    { value: 'GET', label: 'GET' },
    { value: 'POST', label: 'POST' }
  ];

  const handleBodyBlur = useCallback(() => {
    // 清除任何待處理的更新計時器
    if (updateBodyTimeoutRef.current) {
      clearTimeout(updateBodyTimeoutRef.current);
      updateBodyTimeoutRef.current = null;
    }

    // 獲取當前編輯器內容
    const currentContent = getEditorContent();

    // 強制更新 body
    if (currentContent && currentContent !== lastExternalBodyRef.current) {
      setLocalBody(currentContent);
      lastExternalBodyRef.current = currentContent;
      updateParentState('body', currentContent);
    }

    // 更新 HTML 內容
    if (bodyEditorRef.current) {
      try {
        const htmlContent = bodyEditorRef.current.innerHTML || '';
        if (htmlContent !== editorHtmlContent) {
          setEditorHtmlContent(htmlContent);
          updateParentState('editorHtmlContent', htmlContent);
        }
      } catch (error) {
        console.warn('更新 HTML 內容失敗:', error);
      }
    }

    // 重置標記
    isUserInputBodyRef.current = false;
  }, [getEditorContent, updateParentState, editorHtmlContent]);

  return (
    <div className='rounded-lg shadow-md overflow-hidden w-98 max-w-lg'>
      {/* Header section */}
      <div className='bg-gray-100 p-4'>
        <div className='flex items-center'>
          <div className='w-6 h-6 rounded-full bg-red-400 flex items-center justify-center text-white mr-2'>
            <IconBase type='http' />
          </div>
          <span className='font-medium'>{formatNodeTitle('HTTP', id)}</span>
        </div>
      </div>

      <div className='border-t border-gray-200'></div>

      {/* Content area */}
      <div className='bg-white p-4'>
        {/* URL section */}
        <div className='mb-4'>
          <label className='block text-sm text-gray-700 mb-1 font-bold'>
            url
          </label>
          <input
            type='text'
            value={localUrl}
            onChange={handleUrlChange}
            onCompositionStart={handleUrlCompositionStart}
            onCompositionEnd={handleUrlCompositionEnd}
            onKeyDown={handleUrlKeyDown}
            className='w-full border border-gray-300 rounded p-2 text-sm'
            placeholder='url'
          />
        </div>

        {/* Method section */}
        <div className='mb-4'>
          <label className='block text-sm text-gray-700 mb-1 font-bold'>
            Method
          </label>
          <div className='relative'>
            <select
              className='w-full border border-gray-300 rounded p-2 text-sm bg-white appearance-none'
              value={localMethod}
              onChange={handleMethodChange}>
              {methodOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className='absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none'>
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
                <polyline points='6 9 12 15 18 9'></polyline>
              </svg>
            </div>
          </div>
        </div>

        {/* Header section */}
        <div className='mb-4'>
          <label className='block text-sm text-gray-700 mb-2 font-bold'>
            Header (optional)
          </label>

          {/* Headers list */}
          <div className='space-y-2'>
            {headers.map((header, index) => (
              <div
                key={index}
                className='grid grid-cols-12 gap-2 items-center'>
                {/* Key column */}
                <div className='col-span-5'>
                  <label className='block text-xs text-gray-600 mb-1 font-bold'>
                    Key
                  </label>
                  <input
                    type='text'
                    value={header.key}
                    onChange={(e) =>
                      handleHeaderKeyChange(index, e.target.value)
                    }
                    onCompositionStart={() =>
                      handleHeaderKeyCompositionStart(index)
                    }
                    onCompositionEnd={(e) =>
                      handleHeaderKeyCompositionEnd(index, e)
                    }
                    onKeyDown={(e) => handleHeaderKeyDown(index, 'key', e)}
                    className='w-full border border-gray-300 rounded px-2 py-1 text-xs'
                    placeholder='key'
                  />
                </div>

                {/* Value column */}
                <div className='col-span-6'>
                  <label className='block text-xs text-gray-600 mb-1 font-bold'>
                    Value
                  </label>
                  <input
                    type='text'
                    value={header.value}
                    onChange={(e) =>
                      handleHeaderValueChange(index, e.target.value)
                    }
                    onCompositionStart={() =>
                      handleHeaderValueCompositionStart(index)
                    }
                    onCompositionEnd={(e) =>
                      handleHeaderValueCompositionEnd(index, e)
                    }
                    onKeyDown={(e) => handleHeaderKeyDown(index, 'value', e)}
                    className='w-full border border-gray-300 rounded px-2 py-1 text-xs'
                    placeholder='value'
                  />
                </div>

                {/* Delete button */}
                {headers.length > 1 && (
                  <div className='col-span-1 flex justify-center items-end h-full pb-1 mt-2'>
                    <button
                      onClick={() => handleDeleteHeader(index)}
                      className='text-black-500 hover:text-red-600 text-sm p-1'
                      title='刪除 Header'>
                      ✕
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Add Header button */}
        <button
          className='w-full bg-teal-500 hover:bg-teal-600 text-white rounded-md p-2 flex justify-center items-center mb-4'
          onClick={handleAddHeader}>
          <AddIcon />
        </button>

        {/* Body section - 使用 CombineTextEditor */}
        {localMethod === 'POST' && (
          <div className='mb-4'>
            <div className='flex items-center justify-between mb-1'>
              <div className='flex items-center'>
                <label className='block text-sm text-gray-700 font-bold'>
                  Body (optional)
                </label>
                {bodyConnectionCount > 0 && (
                  <span className='text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full ml-2'>
                    {bodyConnectionCount} 個連線
                  </span>
                )}
              </div>
            </div>
            <CombineTextEditor
              ref={bodyEditorRef}
              value={isInitialized ? undefined : localBody}
              onChange={handleBodyChange}
              onCompositionStart={handleBodyCompositionStart}
              onCompositionEnd={handleBodyCompositionEnd}
              onKeyDown={handleBodyKeyDown}
              onTagInsert={handleTagInsert}
              onBlur={handleBodyBlur}
              placeholder='{"flow_id": "9e956c37-20ea-47a5-bcd5-3cafc35b967a", "func_id": "q1", "data":"$input"}'
              // className='w-full border border-gray-300 rounded p-2 text-xs font-mono bg-gray-900 text-green-400'
              className='bg-[#e5e7eb] text-[#09090b] border-gray-300'
              flowId={getFlowId()}
              initialHtmlContent={editorHtmlContent}
              shouldShowPanel={bodyConnectionCount > 0}
              showInputPanel={showInputPanel}
              onShowPanel={handleShowPanel}
              style={{
                minHeight: '220px',
                maxHeight: '400px',
                color: '#09090b'
              }}
            />
          </div>
        )}
      </div>

      {/* Handles */}
      <Handle
        type='target'
        position={Position.Left}
        id='body'
        style={{
          background: '#e5e7eb',
          border: '1px solid #D3D3D3',
          width: '12px',
          height: '12px',
          left: '-6px',
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
          right: '-6px'
        }}
        isConnectable={isConnectable}
      />

      {/* Input Panel */}
      {showInputPanel && bodyConnectionCount > 0 && localMethod === 'POST' && (
        <div className='fixed inset-0 z-[9998]'>
          <div
            className='absolute inset-0 bg-transparent pointer-events-auto'
            onClick={closeInputPanel}
          />
          <div
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
    </div>
  );
};

export default memo(HttpRequestNode);
