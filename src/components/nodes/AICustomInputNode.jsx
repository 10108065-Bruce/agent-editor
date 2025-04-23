import React, { memo, useState, useEffect, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import { llmService } from '../../services/WorkflowServicesIntegration';

const AICustomInputNode = ({ data, isConnectable }) => {
  // 生成唯一ID (確保每個實例都有唯一ID)
  const nodeIdRef = useRef(
    `ai-node-${Math.random().toString(36).substr(2, 9)}`
  );
  const nodeId = nodeIdRef.current;

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
  const [localModel, setLocalModel] = useState('O3-mini');
  const [localSelectedOption, setLocalSelectedOption] = useState('prompt');

  // 使用useEffect來同步data和本地狀態
  useEffect(() => {
    if (data?.model) {
      setLocalModel(data.model);
    }
    if (data?.selectedOption) {
      setLocalSelectedOption(data.selectedOption);
    }
  }, [data?.model, data?.selectedOption]);

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
          const defaultModel =
            options.find((opt) => opt.isDefault)?.value || options[0].value;
          setLocalModel(defaultModel);

          // 嘗試更新父組件的狀態，但不依賴它
          if (data && typeof data.updateNodeData === 'function') {
            data.updateNodeData('model', defaultModel);
          }
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

  // 處理模型變更
  const handleModelChange = (e) => {
    const newModelValue = e.target.value;
    setLocalModel(newModelValue);

    // 嘗試更新父組件的狀態，但不依賴它
    if (data && typeof data.updateNodeData === 'function') {
      data.updateNodeData('model', newModelValue);
    }
  };

  // 處理選項變更
  const handleOptionChange = (option) => {
    console.log(`節點 ${nodeId} 選項變更為: ${option}`);
    setLocalSelectedOption(option);

    // 嘗試更新父組件的狀態，但不依賴它
    if (data && typeof data.updateNodeData === 'function') {
      data.updateNodeData('selectedOption', option);
    }
  };

  return (
    <div className='rounded-lg shadow-md overflow-hidden w-64'>
      {/* Header section with icon and title */}
      <div className='bg-orange-50 p-4'>
        <div className='flex items-center'>
          <div className='w-6 h-6 rounded-full bg-orange-400 flex items-center justify-center text-white mr-2'>
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
              <path d='M12 2L2 7l10 5 10-5-10-5z'></path>
              <path d='M2 17l10 5 10-5'></path>
              <path d='M2 12l10 5 10-5'></path>
            </svg>
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

        {/* 選項區域 */}
        <div>
          {/* Prompt option */}
          <div className='flex items-center mb-3'>
            <label className='flex items-center space-x-2 cursor-pointer'>
              <div className='relative'>
                <input
                  type='radio'
                  className='hidden'
                  checked={localSelectedOption === 'prompt'}
                  onChange={() => handleOptionChange('prompt')}
                />
                <div
                  className={`w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center ${
                    localSelectedOption === 'prompt' ? 'border-gray-500' : ''
                  }`}>
                  {localSelectedOption === 'prompt' && (
                    <div className='w-2 h-2 rounded-full bg-gray-600'></div>
                  )}
                </div>
              </div>
              <span className='text-sm text-gray-700'>prompt</span>
            </label>
          </div>

          {/* Context option */}
          <div className='flex items-center'>
            <label className='flex items-center space-x-2 cursor-pointer'>
              <div className='relative'>
                <input
                  type='radio'
                  className='hidden'
                  checked={localSelectedOption === 'context'}
                  onChange={() => handleOptionChange('context')}
                />
                <div
                  className={`w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center ${
                    localSelectedOption === 'context' ? 'border-gray-500' : ''
                  }`}>
                  {localSelectedOption === 'context' && (
                    <div className='w-2 h-2 rounded-full bg-gray-600'></div>
                  )}
                </div>
              </div>
              <span className='text-sm text-gray-700'>context</span>
            </label>
          </div>
        </div>

        {/* 顯示當前選項（調試用） */}
        {/* <div className='mt-2 text-xs text-gray-400'>
          選項: {localSelectedOption} | ID: {nodeId.slice(-4)}
        </div> */}
      </div>

      {/* Input handle - left side */}
      <Handle
        type='target'
        position={Position.Left}
        id='input'
        style={{
          background: '#555',
          width: '8px',
          height: '8px',
          left: '-4px'
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
