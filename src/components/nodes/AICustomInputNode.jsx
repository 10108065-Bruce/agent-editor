import React, { memo, useState, useEffect, useCallback } from 'react';
import { Handle, Position, useEdges } from 'reactflow';
import { llmService } from '../../services/WorkflowServicesIntegration';
import IconBase from '../icons/IconBase';
import AutoResizeTextarea from '../text/AutoResizeText';

const AICustomInputNode = ({ data, isConnectable, id }) => {
  // 保存LLM模型選項 - 使用id作為value
  const [modelOptions, setModelOptions] = useState([
    { value: '1', label: 'O3-mini' },
    { value: '2', label: 'O3-plus' },
    { value: '3', label: 'O3-mega' },
    { value: '4', label: 'O3-ultra' }
  ]);

  // 使用 useEdges 獲取所有邊緣
  const edges = useEdges();

  // 計算連接到 context handle 的連線數量
  const contextConnectionCount = edges.filter(
    (edge) => edge.target === id && edge.targetHandle === 'context-input'
  ).length;

  // 檢查是否有prompt連線
  const hasPromptConnection = edges.some(
    (edge) => edge.target === id && edge.targetHandle === 'prompt-input'
  );

  // 加載狀態
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  // 錯誤狀態
  const [modelLoadError, setModelLoadError] = useState(null);

  // 本地狀態 - 確保初始化時有預設值，使用模型ID
  const [localModel, setLocalModel] = useState(data?.model || '1');

  // 新增 - 本地狀態管理 prompt 文本
  const [promptText, setPromptText] = useState(data?.promptText || '');

  // 初始化和同步數據 - 增強版，能夠處理API數據加載的情況
  useEffect(() => {
    console.log('AICustomInputNode 數據同步更新:', {
      'data.model': data?.model,
      'data.promptText': data?.promptText
    });

    // 同步模型選擇
    if (data?.model && data.model !== localModel) {
      console.log(`同步模型從 ${localModel} 到 ${data.model}`);
      setLocalModel(data.model);
    }

    // 同步 prompt 文本
    if (data?.promptText !== undefined && data.promptText !== promptText) {
      console.log(`同步 prompt 文本從 "${promptText}" 到 "${data.promptText}"`);
      setPromptText(data.promptText);
    }
  }, [data?.model, data?.promptText, localModel, promptText]);

  // 從API加載模型列表
  const loadModels = async () => {
    // 原有的模型加載邏輯保持不變
    if (isLoadingModels) return;

    setIsLoadingModels(true);
    setModelLoadError(null);

    try {
      console.log('開始加載模型列表');
      const options = await llmService.getModelOptions();
      console.log('llmService.getModelOptions 返回結果:', options);

      if (options && options.length > 0) {
        console.log('設置模型選項:', options);
        setModelOptions(options);

        // 檢查當前選擇的模型是否在新的選項中
        const isCurrentModelValid = options.some(
          (opt) => opt.value === localModel
        );
        console.log(`當前模型 ${localModel} 是否有效:`, isCurrentModelValid);

        if (!isCurrentModelValid) {
          // 如果當前模型不在選項中，選擇默認模型或第一個模型
          let defaultModel = options[0].value;

          // 嘗試找到默認模型
          const defaultOption = options.find((opt) => opt.isDefault);
          if (defaultOption) {
            defaultModel = defaultOption.value;
            console.log('找到默認模型:', defaultOption);
          }

          console.log(`將模型從 ${localModel} 更新為 ${defaultModel}`);
          setLocalModel(defaultModel);

          // 嘗試更新父組件的狀態
          updateParentState('model', defaultModel);
        }
      } else {
        console.warn('API未返回有效的模型選項或返回了空陣列');
      }
    } catch (error) {
      console.error('加載模型失敗:', error);

      // 僅對非"進行中的請求"錯誤顯示錯誤信息
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

  // 組件掛載時加載模型
  useEffect(() => {
    loadModels();
  }, []);

  // 統一更新父組件狀態的輔助函數
  const updateParentState = useCallback(
    (key, value) => {
      console.log(`嘗試更新父組件狀態 ${key}=${value}`);

      // 方法1：使用 updateNodeData 回調
      if (data && typeof data.updateNodeData === 'function') {
        data.updateNodeData(key, value);
        console.log(`使用 updateNodeData 更新 ${key}`);
        return true;
      }

      // 方法2：直接修改 data 對象（應急方案）
      if (data) {
        data[key] = value;
        console.log(`直接修改 data.${key} = ${value}`);
        return true;
      }

      console.warn(`無法更新父組件的 ${key}`);
      return false;
    },
    [data]
  );

  // 處理模型變更
  const handleModelChange = useCallback(
    (e) => {
      const newModelValue = e.target.value;
      console.log(`模型變更為ID: ${newModelValue}`);
      setLocalModel(newModelValue);
      updateParentState('model', newModelValue);
    },
    [updateParentState]
  );

  // 新增 - 處理 prompt 文本變更
  const handlePromptTextChange = useCallback(
    (e) => {
      const newText = e.target.value;
      console.log(`Prompt 文本變更為: ${newText}`);
      setPromptText(newText);
      updateParentState('promptText', newText);
    },
    [updateParentState]
  );

  return (
    <div className='rounded-lg shadow-md overflow-hidden w-64'>
      {/* Header section with icon and title */}
      <div className='bg-orange-50 p-4'>
        <div className='flex items-center'>
          <div className='w-6 h-6 rounded-full bg-orange-400 flex items-center justify-center text-white mr-2'>
            <IconBase type='ai' />
          </div>
          <span className='font-medium'>AI</span>
        </div>
      </div>

      {/* Separator line */}
      <div className='border-t border-gray-200'></div>

      {/* White content area */}
      <div className='bg-white p-4'>
        {/* Model selection */}
        <div className='mb-4'>
          <label className='block text-sm text-gray-700 mb-1 font-bold'>
            model
          </label>
          <div className='relative'>
            <select
              className={`w-full border border-gray-300 rounded p-2 text-sm bg-white 
                ${isLoadingModels ? 'opacity-70 cursor-wait' : ''} 
                ${modelLoadError ? 'border-red-300' : ''}`}
              value={localModel}
              onChange={handleModelChange}
              disabled={isLoadingModels}>
              {modelOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {isLoadingModels && (
              <div className='absolute right-2 top-1/2 transform -translate-y-1/2'>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500'></div>
              </div>
            )}
          </div>

          {modelLoadError && (
            <p className='text-xs text-red-500 mt-1'>{modelLoadError}</p>
          )}
        </div>

        {/* 新增 - Prompt textarea */}
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
          <AutoResizeTextarea
            value={promptText}
            onChange={handlePromptTextChange}
            placeholder='輸入您的提示'
            className='w-full border border-gray-300 rounded p-2 text-sm'
          />
        </div>

        {/* Context label with connection status */}
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

      {/* Prompt input handle */}
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
          top: '70%', // 調整位置到 prompt 文本區域附近
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
          top: '92%', // 調整位置到 context 標籤附近
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
    </div>
  );
};

export default memo(AICustomInputNode);
