// 改進的 Extract Data 節點 - 支援多欄位配置（橫向佈局）
import React, { memo, useState, useEffect, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { llmService } from '../../services/index';
import IconBase from '../icons/IconBase';
import AddIcon from '../icons/AddIcon';

const ExtractDataNode = ({ data, isConnectable }) => {
  const [modelOptions, setModelOptions] = useState([
    { value: '1', label: 'O3-mini' },
    { value: '2', label: 'O3-plus' },
    { value: '3', label: 'O3-mega' },
    { value: '4', label: 'O3-ultra' }
  ]);

  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelLoadError, setModelLoadError] = useState(null);
  const [localModel, setLocalModel] = useState(data?.model || '1');

  // 新增：管理 columns 狀態 - 一開始沒有任何資料
  const [columns, setColumns] = useState(data?.columns || []);

  // 改進的同步邏輯
  useEffect(() => {
    if (data?.model && data.model !== localModel) {
      setLocalModel(data.model);
    }
  }, [data?.model, localModel]);

  // 同步 columns 資料
  useEffect(() => {
    if (
      data?.columns &&
      JSON.stringify(data.columns) !== JSON.stringify(columns)
    ) {
      setColumns(data.columns);
    }
  }, [data?.columns, columns]);

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

  // 新增欄位
  const handleAddColumn = useCallback(() => {
    const newColumn = {
      name: '請輸入欄位名稱',
      type: 'text',
      description: ''
    };
    const newColumns = [...columns, newColumn];
    setColumns(newColumns);
    updateParentState('columns', newColumns);
    console.log('新增欄位', newColumn);
  }, [columns, updateParentState]);

  // 刪除欄位 - 移除「至少保留一個欄位」的限制
  const handleDeleteColumn = useCallback(
    (index) => {
      const newColumns = columns.filter((_, i) => i !== index);
      setColumns(newColumns);
      updateParentState('columns', newColumns);
      console.log('刪除欄位', index);
    },
    [columns, updateParentState]
  );

  // 更新欄位名稱
  const handleColumnNameChange = useCallback(
    (index, value) => {
      const newColumns = [...columns];
      newColumns[index].name = value;
      setColumns(newColumns);
      updateParentState('columns', newColumns);
    },
    [columns, updateParentState]
  );

  // 更新欄位類型
  const handleColumnTypeChange = useCallback(
    (index, value) => {
      const newColumns = [...columns];
      newColumns[index].type = value;
      setColumns(newColumns);
      updateParentState('columns', newColumns);
    },
    [columns, updateParentState]
  );

  // 更新欄位描述
  const handleColumnDescriptionChange = useCallback(
    (index, value) => {
      const newColumns = [...columns];
      newColumns[index].description = value;
      setColumns(newColumns);
      updateParentState('columns', newColumns);
    },
    [columns, updateParentState]
  );

  // 類型選項
  const typeOptions = [
    { value: 'text', label: 'text' },
    { value: 'number', label: 'number' },
    { value: 'boolean', label: 'boolean' }
  ];

  return (
    <div className='rounded-lg shadow-md overflow-hidden w-98 max-w-lg'>
      {/* Header section */}
      <div className='bg-orange-50 p-4'>
        <div className='flex items-center'>
          <div className='w-6 h-6 rounded-full bg-orange-400 flex items-center justify-center text-white mr-2'>
            <IconBase type='ai' />
          </div>
          <span className='font-medium'>Data Extractor</span>
        </div>
      </div>

      <div className='border-t border-gray-200'></div>

      {/* Content area */}
      <div className='bg-white p-4'>
        {/* Model selection */}
        <div className='mb-4'>
          <label className='block text-sm text-gray-700 mb-1 font-bold'>
            Model
          </label>
          <div className='relative'>
            <select
              className={`w-full border border-gray-300 rounded p-2 text-sm bg-white appearance-none
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

        {/* Context section */}
        <div className='mb-4'>
          <label className='block text-sm text-gray-700 mb-1 font-bold'>
            Context
          </label>
        </div>

        {/* Data section */}
        <div className='mb-4'>
          <label className='block text-sm text-gray-700 mb-2 font-bold'>
            Data
          </label>

          {/* Columns list - 移除最大高度限制，讓節點可以動態增高 */}
          <div className='space-y-2'>
            {columns.map((column, index) => (
              <div
                key={index}
                className='grid grid-cols-12 gap-2 items-start bg-gray-50 border border-gray-200 rounded p-2'>
                {/* Column name */}
                <div className='col-span-4'>
                  <label className='block text-xs text-gray-600 mb-1 font-bold'>
                    名稱
                  </label>
                  <input
                    type='text'
                    value={column.name}
                    onChange={(e) =>
                      handleColumnNameChange(index, e.target.value)
                    }
                    className='w-full border border-gray-300 rounded px-2 py-1 text-xs'
                    placeholder='欄位名稱'
                  />
                </div>

                {/* Column type */}
                <div className='col-span-3'>
                  <label className='block text-xs text-gray-600 mb-1 font-bold'>
                    類型
                  </label>
                  <select
                    value={column.type}
                    onChange={(e) =>
                      handleColumnTypeChange(index, e.target.value)
                    }
                    className='w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white'>
                    {typeOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Column description */}
                <div className='col-span-4'>
                  <label className='block text-xs text-gray-600 mb-1 font-bold'>
                    描述
                  </label>
                  <textarea
                    value={column.description}
                    onChange={(e) =>
                      handleColumnDescriptionChange(index, e.target.value)
                    }
                    className='w-full border border-gray-300 rounded px-2 py-1 text-xs resize-none min-h-[24px] max-h-[60px] overflow-hidden'
                    placeholder='描述'
                    rows='1'
                    style={{
                      height: `${Math.min(
                        Math.max(
                          24,
                          column.description.split('\n').length * 20 + 4
                        ),
                        60
                      )}px`
                    }}
                    maxLength='200'
                  />
                </div>

                {/* Delete button */}
                <div className='col-span-1 flex justify-center items-center h-full'>
                  <button
                    onClick={() => handleDeleteColumn(index)}
                    className='text-black-500 hover:text-teal-600 text-sm p-1'
                    title='刪除欄位'>
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 當沒有欄位時顯示提示 */}
          {columns.length === 0 && (
            <div className='text-center text-gray-500 text-sm py-4 border-2 border-dashed border-gray-300 rounded'>
              點擊下方按鈕新增資料欄位
            </div>
          )}
        </div>

        {/* Add button - teal color */}
        <button
          className='w-full bg-teal-500 hover:bg-teal-600 text-white rounded-md p-2 flex justify-center items-center'
          onClick={handleAddColumn}>
          <AddIcon />
        </button>
      </div>

      {/* Handles */}
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

export default memo(ExtractDataNode);
