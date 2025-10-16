// 改進的 AI 節點 - 使用 CombineTextEditor 處理 prompt
import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import { Handle, Position, useEdges, useNodes } from 'reactflow';
import { llmService } from '../../services/index';
import IconBase from '../icons/IconBase';
import CombineTextEditor from '../text/CombineTextEditor';
import RefinePromptOverlay from '../common/RefinePromptOverlay';
import { PromptGeneratorService } from '../../services/PromptGeneratorService';
import promptIcon from '../../assets/prompt-generator.svg';
import promptDisabledIcon from '../../assets/prompt-generator-disabled.svg';
import { formatNodeTitle } from '../../utils/nodeUtils';

const AICustomInputNode = ({ data, isConnectable, id }) => {
  const [modelOptions, setModelOptions] = useState([]);
  const [showRefinePrompt, setShowRefinePrompt] = useState(false);

  const edges = useEdges();
  const nodes = useNodes();

  // 計算 prompt 連線數量
  const promptConnectionCount = edges.filter(
    (edge) => edge.target === id && edge.targetHandle === 'prompt'
  ).length;

  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelLoadError, setModelLoadError] = useState(null);
  const [localModel, setLocalModel] = useState(data?.model || '');

  // 使用 ref 來存儲實際的 prompt 文本值
  const [promptText, setPromptText] = useState(data?.promptText || '');
  const editorRef = useRef(null);
  const isComposingRef = useRef(false);
  const updateTimeoutRef = useRef(null);
  const lastExternalValueRef = useRef(data?.promptText || '');
  const isUserInputRef = useRef(false);
  const [showInputPanel, setShowInputPanel] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [editorHtmlContent, setEditorHtmlContent] = useState(
    data?.editorHtmlContent || ''
  );
  const [isInitialized, setIsInitialized] = useState(false);

  // 同步邏輯
  useEffect(() => {
    if (data?.model && data.model !== localModel) {
      setLocalModel(data.model);
    }

    if (
      data?.promptText !== undefined &&
      data.promptText !== lastExternalValueRef.current &&
      !isComposingRef.current &&
      !isUserInputRef.current
    ) {
      setPromptText(data.promptText);
      lastExternalValueRef.current = data.promptText;
    }

    // 同步編輯器 HTML 內容
    if (
      data?.editorHtmlContent !== undefined &&
      data.editorHtmlContent !== editorHtmlContent
    ) {
      setEditorHtmlContent(data.editorHtmlContent);
    }
  }, [
    data?.model,
    data?.promptText,
    data?.editorHtmlContent,
    localModel,
    promptText,
    editorHtmlContent
  ]);

  // 初始化處理
  useEffect(() => {
    if (!isInitialized && data) {
      const initialContent = data.promptText || '';
      const initialHtmlContent = data.editorHtmlContent || '';

      // 設置初始值
      if (initialContent) {
        setPromptText(initialContent);
        lastExternalValueRef.current = initialContent;
      }

      if (initialHtmlContent) {
        setEditorHtmlContent(initialHtmlContent);
      }
      setIsInitialized(true);
    }
  }, [data, isInitialized]);

  const loadModels = async () => {
    if (isLoadingModels) return;

    setIsLoadingModels(true);
    setModelLoadError(null);

    try {
      const options = await llmService.getModelOptions();
      if (options && options.length > 0) {
        setModelOptions(options);

        const isCurrentModelValid = options.some(
          (opt) => opt.value === localModel
        );

        if (!isCurrentModelValid && localModel) {
          setLocalModel('');
          updateParentState('model', '');
        }
      } else {
        setModelOptions([]);
        setLocalModel('');
        updateParentState('model', '');
      }
    } catch (error) {
      console.error('載入模型失敗:', error);
      if (
        !(
          error.message &&
          (error.message.includes('已有進行中的LLM模型請求') ||
            error.message.includes('進行中的請求') ||
            error.message.includes('使用相同請求'))
        )
      ) {
        setModelLoadError('無法載入模型列表，請稍後再試');
      }
    } finally {
      setIsLoadingModels(false);
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

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

  const handleModelChange = useCallback(
    (e) => {
      const newModelValue = e.target.value;
      setLocalModel(newModelValue);
      updateParentState('model', newModelValue);
    },
    [updateParentState]
  );

  // 取得編輯器內容
  const getEditorContent = useCallback(() => {
    if (!editorRef.current) return null;
    try {
      if (typeof editorRef.current.getValue === 'function') {
        return editorRef.current.getValue();
      }
    } catch (error) {
      console.warn('獲取編輯器內容失敗:', error);
    }
    return null;
  }, []);

  // 修改：處理編輯器文字變更 - 大幅減少延遲
  const handlePromptTextChange = useCallback(
    (e) => {
      const newText = e.target.value;

      // 立即更新本地狀態
      isUserInputRef.current = true;
      setPromptText(newText);
      lastExternalValueRef.current = newText;

      // 清除之前的計時器
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      // 使用極短的延遲（10ms）來批量處理快速輸入
      updateTimeoutRef.current = setTimeout(() => {
        // 立即更新父組件狀態
        updateParentState('promptText', newText);

        // 更新 HTML 內容
        if (editorRef.current) {
          try {
            const htmlContent = editorRef.current.innerHTML || '';
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

        isUserInputRef.current = false;
      }, 10); // 改為 10ms
    },
    [updateParentState, editorHtmlContent, data]
  );

  // 處理標籤插入
  const handleTagInsert = useCallback(() => {
    setTimeout(() => {
      const editorContent = getEditorContent();
      if (editorContent) {
        setPromptText(editorContent);
        updateParentState('promptText', editorContent);

        if (editorRef.current) {
          try {
            const htmlContent = editorRef.current.innerHTML || '';
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
  }, [getEditorContent, updateParentState, data]);

  // 處理 IME 組合開始
  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
    isUserInputRef.current = true;
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
      updateTimeoutRef.current = null;
    }
  }, []);

  // 修改：處理 IME 組合結束 - 立即同步
  const handleCompositionEnd = useCallback(
    (e) => {
      isComposingRef.current = false;
      const finalText = e.target.value;

      // 立即更新所有狀態
      setPromptText(finalText);
      lastExternalValueRef.current = finalText;

      // 立即更新父組件，不使用延遲
      updateParentState('promptText', finalText);

      // 更新 HTML 內容
      if (editorRef.current) {
        try {
          const htmlContent = editorRef.current.innerHTML || '';
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

      // 重置標記
      setTimeout(() => {
        isUserInputRef.current = false;
      }, 10);
    },
    [updateParentState, editorHtmlContent, data]
  );

  // 處理鍵盤事件
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      isUserInputRef.current = true;
      setTimeout(() => {
        isUserInputRef.current = false;
      }, 300);
    }
  }, []);

  // 處理失焦事件 - 強制同步
  const handleBlur = useCallback(() => {
    // 清除任何待處理的更新計時器
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
      updateTimeoutRef.current = null;
    }

    // 獲取當前編輯器內容
    const currentContent = getEditorContent();

    // 強制更新 promptText
    if (currentContent && currentContent !== lastExternalValueRef.current) {
      setPromptText(currentContent);
      lastExternalValueRef.current = currentContent;
      updateParentState('promptText', currentContent);
    }

    // 更新 HTML 內容
    if (editorRef.current) {
      try {
        const htmlContent = editorRef.current.innerHTML || '';
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

    // 重置標記
    isUserInputRef.current = false;
  }, [getEditorContent, updateParentState, editorHtmlContent, data]);

  // 邊緣變化監聽 - 新增清理功能
  useEffect(() => {
    const connectedEdges = edges.filter(
      (edge) => edge.target === id && edge.targetHandle === 'prompt'
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
        if (key.startsWith('prompt') && value.node_id) {
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
        editorRef.current &&
        typeof editorRef.current.cleanupTagsByConnection === 'function'
      ) {
        let totalCleaned = 0;
        deletedConnections.forEach((connectionKey) => {
          const [nodeId, outputName] = connectionKey.split(':');
          const cleaned = editorRef.current.cleanupTagsByConnection(
            nodeId,
            outputName
          );
          totalCleaned += cleaned;
        });

        if (totalCleaned > 0) {
          console.log(`成功清理了 ${totalCleaned} 個斷開連接的tag`);
        }
      }

      // 繼續原有的邊緣同步邏輯
      const sortedEdges = connectedEdges.sort((a, b) => {
        // 保持連接順序
        return a.source.localeCompare(b.source);
      });

      // 建立新的 node_input
      sortedEdges.forEach((edge, index) => {
        const inputKey = `prompt${index}`;

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
          } else if (sourceNode.type === 'combine_text') {
            returnName = 'output';
          } else if (sourceNode.type === 'knowledgeRetrieval') {
            returnName = 'output';
          } else if (sourceNode.type === 'aim_ml') {
            returnName = edge.sourceHandle || 'output';
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

  // 清理計時器
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  // 處理 Refine Prompt 按鈕點擊
  const handleRefinePromptClick = useCallback(() => {
    const validation = PromptGeneratorService.validateParameters(
      parseInt(localModel),
      promptText
    );

    if (!validation.isValid) {
      if (typeof window !== 'undefined' && window.notify) {
        window.notify({
          message: validation.errors[0],
          type: 'error',
          duration: 3000
        });
      }
      return;
    }

    setShowRefinePrompt(true);
  }, [localModel, promptText]);

  // 處理優化 Prompt 應用
  const handleOptimizedPromptApply = useCallback(
    (optimizedPrompt) => {
      setPromptText(optimizedPrompt);
      lastExternalValueRef.current = optimizedPrompt;
      updateParentState('promptText', optimizedPrompt);

      if (typeof window !== 'undefined' && window.notify) {
        window.notify({
          message: '優化 Prompt 已應用',
          type: 'success',
          duration: 2000
        });
      }
    },
    [updateParentState]
  );

  const handleOptimizedPromptCopy = useCallback(() => {
    console.log('優化後的 Prompt 已複製到剪貼板');
  }, []);

  const closeRefinePrompt = useCallback(() => {
    setShowRefinePrompt(false);
  }, []);

  const getGroupedModelOptions = useCallback(() => {
    if (!modelOptions || modelOptions.length === 0) {
      return {};
    }

    return modelOptions.reduce((groups, option) => {
      const provider = option.provider || '';
      if (!groups[provider]) {
        groups[provider] = [];
      }
      groups[provider].push(option);
      return groups;
    }, {});
  }, [modelOptions]);

  const renderGroupedOptions = useCallback(() => {
    const groupedOptions = getGroupedModelOptions();
    const providers = Object.keys(groupedOptions).sort();

    return providers.map((provider) => (
      <optgroup
        key={provider}
        label={provider}>
        {groupedOptions[provider].map((option) => (
          <option
            key={option.value}
            value={option.value}>
            {option.label}
          </option>
        ))}
      </optgroup>
    ));
  }, [getGroupedModelOptions]);

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
      (edge) => edge.target === id && edge.targetHandle === 'prompt'
    );

    return connectedEdges.map((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);

      // 獲取節點顯示名稱
      const getNodeDisplayName = (sourceNode) => {
        if (!sourceNode) return 'Unknown';
        switch (sourceNode.type) {
          case 'customInput':
          case 'input':
            return 'Input';
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

      // 獲取節點標籤顏色
      const getNodeTagColor = (nodeName) => {
        const lowerNodeName = nodeName.toLowerCase();
        const colorMap = [
          { keyword: 'combine text node', color: '#4E7ECF' },
          { keyword: 'knowledge retrieval', color: '#87CEEB' },
          { keyword: 'qoca aim node', color: '#098D7F' },
          { keyword: 'input', color: '#0075FF' }
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
      if (editorRef.current && editorRef.current.insertTagAtCursor) {
        editorRef.current.insertTagAtCursor(nodeInfo);
        setTimeout(() => {
          const newContent = getEditorContent();
          if (newContent) {
            setPromptText(newContent);
            updateParentState('promptText', newContent);
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

  return (
    <div className='rounded-lg shadow-md overflow-hidden w-96'>
      {/* Header section */}
      <div className='bg-orange-50 p-4'>
        <div className='flex items-center'>
          <div className='w-6 h-6 rounded-full bg-orange-400 flex items-center justify-center text-white mr-2'>
            <IconBase type='ai' />
          </div>
          <span className='font-medium'>{formatNodeTitle('AI', id)}</span>
        </div>
      </div>

      <div className='border-t border-gray-200'></div>

      {/* Content area */}
      <div className='bg-white p-4'>
        {/* Model selection */}
        <div className='mb-4'>
          <label className='block text-sm text-gray-700 mb-1 font-bold'>
            model
          </label>
          <div className='relative'>
            <select
              className={`w-full border border-gray-300 rounded p-2 text-sm bg-white appearance-none
                 ${isLoadingModels ? 'opacity-70 cursor-wait' : ''} 
                 ${modelLoadError ? 'border-red-300' : ''}
                 ${showRefinePrompt ? 'opacity-50 cursor-not-allowed' : ''}`}
              value={localModel}
              onChange={handleModelChange}
              disabled={isLoadingModels || showRefinePrompt}>
              <option
                value=''
                disabled>
                {modelOptions.length === 0 ? '無可用模型' : '請選擇模型'}
              </option>
              {renderGroupedOptions()}
            </select>
            {isLoadingModels ? (
              <div className='absolute right-2 top-1/2 transform -translate-y-1/2'>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500'></div>
              </div>
            ) : (
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
            )}
          </div>
          {modelLoadError && (
            <p className='text-xs text-red-500 mt-1'>{modelLoadError}</p>
          )}
        </div>

        {/* Prompt section with CombineTextEditor */}
        <div className='mb-4'>
          <div className='flex items-center justify-between mb-1'>
            <div className='flex items-center'>
              <label className='block text-sm text-gray-700 font-bold'>
                Prompt
              </label>
              {promptConnectionCount > 0 && (
                <span className='text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full ml-2'>
                  {promptConnectionCount} 個連線
                </span>
              )}
            </div>
            {/* Refine Prompt 按鈕 */}
            <button
              onClick={handleRefinePromptClick}
              disabled={!promptText || promptText.trim().length === 0}
              className='group w-6 h-6 disabled:cursor-not-allowed rounded flex items-center justify-center transition-colors'
              title='Refine prompt'>
              <img
                src={promptIcon}
                width={18}
                height={18}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
                className='max-w-full max-h-full object-contain group-disabled:hidden'
              />
              <img
                src={promptDisabledIcon}
                width={18}
                height={18}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
                className='max-w-full max-h-full object-contain hidden group-disabled:block'
              />
            </button>
          </div>
          <div className='relative'>
            <CombineTextEditor
              ref={editorRef}
              value={isInitialized ? undefined : promptText}
              onChange={handlePromptTextChange}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              onKeyDown={handleKeyDown}
              onTagInsert={handleTagInsert}
              onBlur={handleBlur} // 新增這一行
              placeholder='輸入您的提示'
              className='bg-[#e9e9e7] text-[#09090b] border-gray-300'
              flowId={getFlowId()}
              initialHtmlContent={editorHtmlContent}
              shouldShowPanel={promptConnectionCount > 0}
              showInputPanel={showInputPanel}
              onShowPanel={handleShowPanel}
              disabled={showRefinePrompt}
              style={{
                minHeight: '220px',
                maxHeight: '400px',
                color: '#09090b'
              }}
            />
          </div>
        </div>
      </div>

      {/* Handles - 只保留 prompt handle */}
      <Handle
        type='target'
        position={Position.Left}
        id='prompt'
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
          right: '-6px'
        }}
        isConnectable={isConnectable}
      />

      {/* Input Panel */}
      {showInputPanel && promptConnectionCount > 0 && (
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

      {/* Refine Prompt 覆蓋層 */}
      <RefinePromptOverlay
        isOpen={showRefinePrompt}
        onClose={closeRefinePrompt}
        originalPrompt={promptText}
        llmId={parseInt(localModel)}
        onOptimizedPromptApply={handleOptimizedPromptApply}
        onOptimizedPromptCopy={handleOptimizedPromptCopy}
        nodePosition={{ x: data?.position?.x || 0, y: data?.position?.y || 0 }}
        offsetX={388}
        offsetY={-150}
      />
    </div>
  );
};

export default memo(AICustomInputNode);
