import React, { memo, useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { llmService } from '../../services/WorkflowServicesIntegration';

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
  // 本地的模型選擇，當 data.updateNodeData 不可用時使用
  const [localModel, setLocalModel] = useState(data?.model || 'O3-mini');
  const [localSelectedOption, setLocalSelectedOption] = useState(
    data?.selectedOption || 'prompt'
  );

  // 安全的更新節點數據
  const safeUpdateNodeData = (key, value) => {
    // 檢查 data.updateNodeData 是否為函數
    if (data && typeof data.updateNodeData === 'function') {
      data.updateNodeData(key, value);
    } else {
      console.warn(
        `updateNodeData 不是一個函數，無法更新 ${key}。使用本地狀態代替。`
      );
      // 使用本地狀態備用
      if (key === 'model') {
        setLocalModel(value);
      } else if (key === 'selectedOption') {
        setLocalSelectedOption(value);
      }
    }
  };

  // 獲取當前模型值，優先使用 data.model，如果不可用則使用本地狀態
  const getCurrentModel = () => {
    return data?.model || localModel;
  };

  // 獲取當前選項，優先使用 data.selectedOption，如果不可用則使用本地狀態
  const getCurrentSelectedOption = () => {
    return data?.selectedOption || localSelectedOption;
  };

  // 節點被創建時立即加載模型列表
  useEffect(() => {
    loadModels();
  }, []);

  // 從API加載模型列表
  const loadModels = async () => {
    // 避免重複載入
    if (isLoadingModels) return;

    setIsLoadingModels(true);
    setModelLoadError(null);

    try {
      const options = await llmService.getModelOptions();

      // 只有在成功獲取到新的選項時才更新
      if (options && options.length > 0) {
        setModelOptions(options);

        // 如果當前選中的模型不在新的選項列表中，選擇預設模型
        const currentModel = getCurrentModel();
        if (!options.some((opt) => opt.value === currentModel)) {
          const defaultModel =
            options.find((opt) => opt.isDefault)?.value || options[0].value;
          safeUpdateNodeData('model', defaultModel);
        }
      }
    } catch (error) {
      console.error('加載模型失敗:', error);

      // 檢查錯誤訊息是否為"已有進行中的LLM模型請求"
      if (
        error.message &&
        (error.message.includes('已有進行中的LLM模型請求') ||
          error.message.includes('進行中的請求') ||
          error.message.includes('使用相同請求'))
      ) {
        // 這是因為有其他請求正在進行中，不顯示錯誤
        console.log('正在等待其他相同請求完成...');
      } else {
        // 對於其他類型的錯誤，顯示錯誤信息
        setModelLoadError('無法載入模型列表，請稍後再試');
      }
    } finally {
      setIsLoadingModels(false);
    }
  };

  // 處理模型選擇變更
  const handleModelChange = (e) => {
    safeUpdateNodeData('model', e.target.value);
  };

  // 處理選項變更
  const handleOptionChange = (option) => {
    safeUpdateNodeData('selectedOption', option);
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
              value={getCurrentModel()}
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

        {/* Prompt option with radio button */}
        <div className='flex items-center mb-3'>
          <div className='mr-2 relative w-4 h-4'>
            <input
              type='radio'
              id='prompt-radio'
              name='ai-option'
              className='absolute opacity-0 w-4 h-4 cursor-pointer'
              checked={getCurrentSelectedOption() === 'prompt'}
              onChange={() => handleOptionChange('prompt')}
            />
            <label
              htmlFor='prompt-radio'
              className='block w-4 h-4 rounded-full border border-gray-300 bg-white cursor-pointer'>
              {getCurrentSelectedOption() === 'prompt' && (
                <span className='absolute inset-0 flex items-center justify-center'>
                  <span className='w-2 h-2 rounded-full bg-gray-600'></span>
                </span>
              )}
            </label>
          </div>
          <label
            htmlFor='prompt-radio'
            className='text-sm text-gray-700 cursor-pointer'>
            prompt
          </label>
        </div>

        {/* Context option with radio button */}
        <div className='flex items-center'>
          <div className='mr-2 relative w-4 h-4'>
            <input
              type='radio'
              id='context-radio'
              name='ai-option'
              className='absolute opacity-0 w-4 h-4 cursor-pointer'
              checked={getCurrentSelectedOption() === 'context'}
              onChange={() => handleOptionChange('context')}
            />
            <label
              htmlFor='context-radio'
              className='block w-4 h-4 rounded-full border border-gray-300 bg-white cursor-pointer'>
              {getCurrentSelectedOption() === 'context' && (
                <span className='absolute inset-0 flex items-center justify-center'>
                  <span className='w-2 h-2 rounded-full bg-gray-600'></span>
                </span>
              )}
            </label>
          </div>
          <label
            htmlFor='context-radio'
            className='text-sm text-gray-700 cursor-pointer'>
            context
          </label>
        </div>
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
