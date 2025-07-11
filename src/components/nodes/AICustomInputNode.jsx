// 改進的 AI 節點 IME 處理方案 + Refine Prompt 功能
import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import { Handle, Position, useEdges } from 'reactflow';
import { llmService } from '../../services/index';
import IconBase from '../icons/IconBase';
import AutoResizeTextarea from '../text/AutoResizeText';
import RefinePromptOverlay from '../common/RefinePromptOverlay';
import { PromptGeneratorService } from '../../services/PromptGeneratorService';
import promptIcon from '../../assets/prompt-generator.svg';
import promptDisabledIcon from '../../assets/prompt-generator-disabled.svg';
const AICustomInputNode = ({ data, isConnectable, id }) => {
  const [modelOptions, setModelOptions] = useState([
    { value: '1', label: 'O3-mini' },
    { value: '2', label: 'O3-plus' },
    { value: '3', label: 'O3-mega' },
    { value: '4', label: 'O3-ultra' }
  ]);

  // Refine Prompt 相關狀態
  const [showRefinePrompt, setShowRefinePrompt] = useState(false);

  const edges = useEdges();
  const contextConnectionCount = edges.filter(
    (edge) => edge.target === id && edge.targetHandle === 'context-input'
  ).length;

  const hasPromptConnection = edges.some(
    (edge) => edge.target === id && edge.targetHandle === 'prompt-input'
  );

  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelLoadError, setModelLoadError] = useState(null);
  const [localModel, setLocalModel] = useState(data?.model || '1');

  // 關鍵修正：使用 ref 來存儲實際的文本值，避免狀態更新干擾
  const [promptText, setPromptText] = useState(data?.promptText || '');
  const isComposingRef = useRef(false);
  const updateTimeoutRef = useRef(null);
  const lastExternalValueRef = useRef(data?.promptText || '');
  const isUserInputRef = useRef(false); // 新增：追蹤是否為用戶輸入

  // 改進的同步邏輯
  useEffect(() => {
    console.log('AICustomInputNode 數據同步更新:', {
      'data.model': data?.model,
      'data.promptText': data?.promptText,
      'current promptText': promptText,
      isUserInput: isUserInputRef.current,
      isComposing: isComposingRef.current
    });

    if (data?.model && data.model !== localModel) {
      setLocalModel(data.model);
    }

    // 關鍵修正：更智能的外部數據同步
    if (
      data?.promptText !== undefined &&
      data.promptText !== lastExternalValueRef.current &&
      !isComposingRef.current &&
      !isUserInputRef.current
    ) {
      // 只有在非用戶輸入時才同步外部數據
      setPromptText(data.promptText);
      lastExternalValueRef.current = data.promptText;
    }
  }, [data?.model, data?.promptText, localModel, promptText]);

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

        if (!isCurrentModelValid) {
          let defaultModel = options[0].value;
          const defaultOption = options.find((opt) => opt.isDefault);
          if (defaultOption) {
            defaultModel = defaultOption.value;
          }
          setLocalModel(defaultModel);
          updateParentState('model', defaultModel);
        }
      }
    } catch (error) {
      console.error('加載模型失敗:', error);
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

  const handlePromptTextChange = useCallback(
    (e) => {
      const newText = e.target.value;

      // 標記為用戶輸入
      isUserInputRef.current = true;

      // 立即更新本地狀態
      setPromptText(newText);
      lastExternalValueRef.current = newText; // 同步記錄

      // 清除之前的更新計時器
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      // 如果不是在組合狀態，延遲更新父組件
      if (!isComposingRef.current) {
        updateTimeoutRef.current = setTimeout(() => {
          updateParentState('promptText', newText);

          // 重置用戶輸入標記
          setTimeout(() => {
            isUserInputRef.current = false;
          }, 100);
        }, 150); // 稍微增加延遲以確保操作完成
      }
    },
    [updateParentState]
  );

  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
    isUserInputRef.current = true;

    // 清除任何待執行的更新
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
      updateTimeoutRef.current = null;
    }
  }, []);

  const handleCompositionEnd = useCallback(
    (e) => {
      isComposingRef.current = false;

      const finalText = e.target.value;

      // 確保狀態同步
      setPromptText(finalText);
      lastExternalValueRef.current = finalText;

      // 立即更新父組件
      updateParentState('promptText', finalText);

      // 延遲重置用戶輸入標記
      setTimeout(() => {
        isUserInputRef.current = false;
      }, 200);
    },
    [updateParentState]
  );

  // 關鍵新增：處理鍵盤事件，特別是刪除操作
  const handleKeyDown = useCallback((e) => {
    // 對於刪除操作，立即標記為用戶輸入
    if (e.key === 'Backspace' || e.key === 'Delete') {
      isUserInputRef.current = true;

      // 延遲重置標記
      setTimeout(() => {
        isUserInputRef.current = false;
      }, 300);
    }
  }, []);

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
    // 驗證參數
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

  // 處理優化 Prompt 應用（僅限應用按鈕）
  const handleOptimizedPromptApply = useCallback(
    (optimizedPrompt) => {
      // 將優化後的 prompt 填入文字區域
      setPromptText(optimizedPrompt);
      lastExternalValueRef.current = optimizedPrompt;
      updateParentState('promptText', optimizedPrompt);

      // 顯示成功通知
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

  // 處理複製（僅複製到剪貼板）
  const handleOptimizedPromptCopy = useCallback(() => {
    console.log('優化後的 Prompt 已複製到剪貼板');
  }, []);

  // 關閉 Refine Prompt 對話框
  const closeRefinePrompt = useCallback(() => {
    setShowRefinePrompt(false);
  }, []);

  return (
    <div className='rounded-lg shadow-md overflow-hidden w-64'>
      {/* Header section */}
      <div className='bg-orange-50 p-4'>
        <div className='flex items-center'>
          <div className='w-6 h-6 rounded-full bg-orange-400 flex items-center justify-center text-white mr-2'>
            <IconBase type='ai' />
          </div>
          <span className='font-medium'>AI</span>
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
                 ${showRefinePrompt ? 'opacity-50 cursor-not-allowed' : ''}`} // 當 refine prompt 打開時禁用樣式
              value={localModel}
              onChange={handleModelChange}
              disabled={isLoadingModels || showRefinePrompt}>
              {' '}
              {/* 當 refine prompt 打開時禁用 */}
              {modelOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}>
                  {option.label}
                </option>
              ))}
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

        {/* Prompt textarea - 關鍵部分 */}
        <div className='mb-4'>
          <div className='flex items-center justify-between mb-1'>
            <label className='block text-sm text-gray-700 font-bold'>
              Prompt
            </label>
            {hasPromptConnection && (
              <span className='text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full'>
                已連線
              </span>
            )}
          </div>
          <div className='relative'>
            <AutoResizeTextarea
              value={promptText}
              onChange={handlePromptTextChange}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              onKeyDown={handleKeyDown}
              placeholder='輸入您的提示'
              className='w-full border border-gray-300 rounded p-2 text-sm pr-10'
              disabled={showRefinePrompt} // 當 refine prompt 打開時禁用編輯
            />
            {/* Refine Prompt 按鈕 */}
            <button
              onClick={handleRefinePromptClick}
              disabled={!promptText || promptText.trim().length === 0}
              className='group absolute bottom-3 right-1 w-6 h-6disabled:cursor-not-allowed rounded flex items-center justify-center transition-colors'
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
        </div>

        {/* Context section */}
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-gray-700 mr-2 font-bold'>
              Context
            </span>
            {contextConnectionCount > 0 && (
              <span className='text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full'>
                {contextConnectionCount} 個連線
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Handles */}
      <Handle
        type='target'
        position={Position.Left}
        id='prompt-input'
        style={{
          background: '#e5e7eb',
          border: '1px solid #D3D3D3',
          width: '12px',
          height: '12px',
          left: '-6px',
          top: '70%',
          transform: 'translateY(-50%)'
        }}
        isConnectable={isConnectable}
      />

      <Handle
        type='target'
        position={Position.Left}
        id='context-input'
        style={{
          background: '#e5e7eb',
          border: '1px solid #D3D3D3',
          width: '12px',
          height: '12px',
          left: '-6px',
          top: '92%',
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

      {/* Refine Prompt 覆蓋層 */}
      <RefinePromptOverlay
        isOpen={showRefinePrompt}
        onClose={closeRefinePrompt}
        originalPrompt={promptText}
        llmId={parseInt(localModel)}
        onOptimizedPromptApply={handleOptimizedPromptApply}
        onOptimizedPromptCopy={handleOptimizedPromptCopy}
        nodePosition={{ x: data?.position?.x || 0, y: data?.position?.y || 0 }}
      />
    </div>
  );
};

export default memo(AICustomInputNode);
