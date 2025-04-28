import React, { memo, useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { llmService } from '../../services/WorkflowServicesIntegration';
import IconBase from '../icons/IconBase';

const AICustomInputNode = ({ data, isConnectable }) => {
  // 保存LLM模型選項
  const [modelOptions, setModelOptions] = useState([
    { value: 'O3-mini', label: 'O3-mini' },
    { value: 'O3-plus', label: 'O3-plus' },
    { value: 'O3-mega', label: 'O3-mega' },
    { value: 'O3-ultra', label: 'O3-ultra' }
  ]);

  // 加載狀態
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  // 錯誤狀態
  const [modelLoadError, setModelLoadError] = useState(null);

  // 本地狀態 - 確保初始化時有預設值
  const [localModel, setLocalModel] = useState(data?.model || 'O3-mini');

  // 初始化和同步數據 - 增強版，能夠處理API數據加載的情況
  useEffect(() => {
    console.log('AICustomInputNode 數據同步更新:', {
      'data.model': data?.model
    });

    // 同步模型選擇
    if (data?.model && data.model !== localModel) {
      console.log(`同步模型從 ${localModel} 到 ${data.model}`);
      setLocalModel(data.model);
    }
  }, [data?.model]);

  // 從API加載模型列表
  const loadModels = async () => {
    if (isLoadingModels) return;

    setIsLoadingModels(true);
    setModelLoadError(null);

    try {
      const options = await llmService.getModelOptions();

      if (options && options.length > 0) {
        setModelOptions(options);

        // 檢查當前選擇的模型是否在新的選項中
        if (!options.some((opt) => opt.value === localModel)) {
          // 如果當前模型不在選項中，選擇默認模型或第一個模型
          const defaultModel =
            options.find((opt) => opt.isDefault)?.value || options[0].value;
          setLocalModel(defaultModel);

          // 嘗試更新父組件的狀態
          updateParentState('model', defaultModel);
        }
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
  const updateParentState = (key, value) => {
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
  };

  // 處理模型變更
  const handleModelChange = (e) => {
    const newModelValue = e.target.value;
    console.log(`模型變更為: ${newModelValue}`);
    setLocalModel(newModelValue);
    updateParentState('model', newModelValue);
  };

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
          <label className='block text-sm text-gray-700 mb-1'>model</label>
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

        {/* Input type labels */}
        <div className='space-y-2'>
          <div className='flex items-center'>
            <span className='text-sm text-gray-700 mr-2'>Prompt</span>
          </div>
          <div className='flex items-center'>
            <span className='text-sm text-gray-700 mr-2'>Context</span>
          </div>
        </div>
      </div>

      {/* Prompt input handle */}
      <Handle
        type='target'
        position={Position.Left}
        id='prompt-input'
        style={{
          background: '#555',
          width: '8px',
          height: '8px',
          left: '-4px',
          top: '82%',
          transform: 'translateY(-250%)'
        }}
        isConnectable={isConnectable}
      />

      {/* Context input handle */}
      <Handle
        type='target'
        position={Position.Left}
        id='context-input'
        style={{
          background: '#555',
          width: '8px',
          height: '8px',
          left: '-4px',
          top: '80%',
          transform: 'translateY(150%)'
        }}
        isConnectable={isConnectable}
      />

      {/* Output handle - right side */}
      <Handle
        type='source'
        position={Position.Right}
        id='output'
        style={{
          background: '#555',
          width: '8px',
          height: '8px',
          right: '-4px'
        }}
        isConnectable={isConnectable}
      />
    </div>
  );
};

export default memo(AICustomInputNode);
