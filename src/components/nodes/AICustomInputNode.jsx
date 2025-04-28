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
  const [localModel, setLocalModel] = useState(data?.model || 'O3-mini');
  const [localSelectedOption, setLocalSelectedOption] = useState(
    data?.selectedOption || 'prompt'
  );

  // 初始化和同步數據 - 增強版，能夠處理API數據加載的情況
  useEffect(() => {
    console.log('AICustomInputNode 數據同步更新:', {
      'data.model': data?.model,
      'data.selectedOption': data?.selectedOption
    });

    // 同步模型選擇
    if (data?.model && data.model !== localModel) {
      console.log(`同步模型從 ${localModel} 到 ${data.model}`);
      setLocalModel(data.model);
    }

    // 同步選項選擇
    if (data?.selectedOption && data.selectedOption !== localSelectedOption) {
      console.log(
        `同步選項從 ${localSelectedOption} 到 ${data.selectedOption}`
      );
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

  // 處理選項變更
  const handleOptionChange = (option) => {
    console.log(`節點 ${nodeId} 選項變更為: ${option}`);
    setLocalSelectedOption(option);
    updateParentState('selectedOption', option);
  };

  // 對 radio button 進行特殊處理，確保正確顯示從 API 載入的值
  const isPromptSelected = localSelectedOption === 'prompt';
  const isContextSelected = localSelectedOption === 'context';

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
        {/* 隱藏的調試信息 */}
        {/* <div className='mb-2 text-xs text-gray-400'>
          localModel: {localModel}, data.model: {data?.model}
        </div> */}

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
                  checked={isPromptSelected}
                  onChange={() => handleOptionChange('prompt')}
                />
                <div
                  className={`w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center ${
                    isPromptSelected ? 'border-gray-500' : ''
                  }`}>
                  {isPromptSelected && (
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
                  checked={isContextSelected}
                  onChange={() => handleOptionChange('context')}
                />
                <div
                  className={`w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center ${
                    isContextSelected ? 'border-gray-500' : ''
                  }`}>
                  {isContextSelected && (
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
