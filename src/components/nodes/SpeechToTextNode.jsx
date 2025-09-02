import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import IconBase from '../icons/IconBase';
import { sttService } from '../../services/STTService';
import { formatNodeTitle } from '../../utils/nodeUtils';

const SpeechToTextNode = ({ data, isConnectable, id }) => {
  // 狀態管理
  const [selectedModelId, setSelectedModelId] = useState(
    data?.stt_model_id || ''
  );
  const [modelOptions, setModelOptions] = useState([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  // 使用 ref 來防止重複執行和追蹤狀態變化
  const isInitialized = useRef(false);
  const lastSyncedModelId = useRef(selectedModelId);
  const isUpdating = useRef(false); // 添加更新標記防止循環

  // 統一更新父組件狀態的輔助函數
  const updateParentState = useCallback(
    (key, value) => {
      // 防止在更新過程中再次觸發更新
      if (isUpdating.current) {
        return false;
      }

      if (data && typeof data.updateNodeData === 'function') {
        isUpdating.current = true;
        try {
          data.updateNodeData(key, value);

          // 更新本地追蹤
          if (key === 'stt_model_id' || key === 'model') {
            lastSyncedModelId.current = value;
          }

          return true;
        } finally {
          // 使用 setTimeout 重置標記，避免阻塞正常更新
          setTimeout(() => {
            isUpdating.current = false;
          }, 100);
        }
      }

      console.warn(`無法更新父組件的 ${key}`);
      return false;
    },
    [data]
  );

  // 載入STT模型選項
  const loadModelOptions = useCallback(async () => {
    if (isLoadingModels) {
      return;
    }

    setIsLoadingModels(true);
    try {
      const options = await sttService.getSTTModelOptions();

      if (options && options.length > 0) {
        setModelOptions(options);

        // 只在初始化時檢查模型一致性
        if (!isInitialized.current) {
          const currentModelId =
            data?.stt_model_id || data?.model || selectedModelId;

          if (currentModelId) {
            const modelExists = options.some(
              (option) => option.value.toString() === currentModelId.toString()
            );

            if (!modelExists) {
              const firstModel = options[0];
              setSelectedModelId(firstModel.value.toString());
              updateParentState('stt_model_id', firstModel.value);
            } else {
              setSelectedModelId(currentModelId.toString());
              lastSyncedModelId.current = currentModelId.toString();
            }
          } else if (options.length > 0) {
            // 如果沒有設置模型，使用第一個選項
            const firstModel = options[0];
            setSelectedModelId(firstModel.value.toString());
            updateParentState('stt_model_id', firstModel.value);
          }

          isInitialized.current = true;
        }
      } else {
        console.warn('未獲取到STT模型選項或選項列表為空');
        setModelOptions([]);
      }
    } catch (error) {
      console.error('載入STT模型選項失敗:', error);
      if (typeof window !== 'undefined' && window.notify) {
        window.notify({
          message: '載入STT模型選項失敗',
          type: 'error',
          duration: 3000
        });
      }
    } finally {
      setIsLoadingModels(false);
    }
  }, []); // 移除所有依賴

  // 組件載入時獲取模型選項
  useEffect(() => {
    loadModelOptions();
  }, []); // 空依賴數組

  // 優化的同步邏輯 - 減少不必要的更新
  useEffect(() => {
    // 防止在更新過程中觸發同步
    if (isUpdating.current) return;

    // 同步模型ID
    const currentModelId = data?.stt_model_id || data?.model;
    if (
      currentModelId !== undefined &&
      currentModelId.toString() !== lastSyncedModelId.current
    ) {
      setSelectedModelId(currentModelId.toString());
      lastSyncedModelId.current = currentModelId.toString();
    }
  }, [data?.stt_model_id, data?.model]);

  // 處理模型選擇變更
  const handleModelChange = useCallback(
    (modelId) => {
      if (modelId === selectedModelId || isUpdating.current) {
        return;
      }
      setSelectedModelId(modelId);
      updateParentState('stt_model_id', parseInt(modelId));
    },
    [selectedModelId, updateParentState]
  );

  // 計算標籤寬度的函數
  const calculateLabelWidth = (text) => {
    const baseWidth = 24;
    const charWidth = 8;
    return baseWidth + text.length * charWidth;
  };

  // 獲取標籤顏色
  const getHandleColor = () => {
    return '#00ced1'; // 青色
  };

  return (
    <>
      <div className='rounded-lg shadow-md overflow-hidden w-[400px]'>
        {/* Header section */}
        <div className='bg-[#dccafa] p-4'>
          <div className='flex items-center'>
            <div className='w-6 h-6 flex items-center justify-center mr-2'>
              <IconBase type='speech_to_text' />
            </div>
            <span className='font-medium'>
              {formatNodeTitle('Speech to Text', id)}
            </span>
          </div>
        </div>

        {/* Content area */}
        <div className='bg-white p-4'>
          {/* Model 下拉選單 */}
          <div className='mb-4'>
            <label className='block text-sm text-gray-700 mb-2 font-bold'>
              Model
            </label>
            <div className='relative'>
              <select
                className='w-full border border-gray-300 rounded p-2 text-sm appearance-none bg-white pr-8 nodrag'
                value={selectedModelId}
                onChange={(e) => handleModelChange(e.target.value)}
                disabled={isLoadingModels}
                onMouseDown={(e) => e.stopPropagation()}>
                <option value=''>
                  {isLoadingModels ? '載入中...' : '選擇模型'}
                </option>
                {modelOptions.map((model) => (
                  <option
                    key={model.value}
                    value={model.value}>
                    {model.label}
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
        </div>
      </div>

      {/* 左側 Audio 標籤區域 */}
      <div className='absolute left-0 top-1/2 transform -translate-x-full -translate-y-1/2 mr-2 pointer-events-none'>
        <div
          className='flex items-center'
          style={{ pointerEvents: 'none' }}>
          <span
            className='inline-flex items-center px-3 py-1 rounded text-xs font-medium text-white whitespace-nowrap select-none'
            style={{
              backgroundColor: getHandleColor(),
              transform: 'translateX(6px)'
            }}>
            Audio
          </span>
          <div
            className='w-4 h-0.5'
            style={{
              backgroundColor: '#D3D3D3',
              transform: 'translateX(6px)'
            }}
          />
          <div
            className='w-3 h-3 rounded-full'
            style={{
              background: '#e5e7eb',
              border: '1px solid #D3D3D3',
              transform: 'translateX(6px)'
            }}
          />
        </div>
      </div>

      {/* Input Handle - Audio */}
      <Handle
        type='target'
        position={Position.Left}
        id='audio'
        style={{
          background: 'transparent',
          border: 'none',
          width: `${calculateLabelWidth('Audio') + 8}px`,
          height: '32px',
          left: `-${calculateLabelWidth('Audio') + 14}px`,
          top: '50%',
          transform: 'translateY(-50%)',
          cursor: 'crosshair',
          zIndex: 10
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
    </>
  );
};

export default memo(SpeechToTextNode);
