import React, { memo, useState, useEffect, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { llmService } from '../../services/index';
import IconBase from '../icons/IconBase';
import { formatNodeTitle } from '../../utils/nodeUtils';

const KnowledgeRetrievalNode = ({ data, isConnectable, id }) => {
  const [isLoadingKnowledgeBases, setIsLoadingKnowledgeBases] = useState(false);
  const [knowledgeBaseLoadError, setKnowledgeBaseLoadError] = useState(null);

  // 保存知識庫選項，使用默認值
  const [dataKnowledgeBases, setDataKnowledgeBases] = useState(
    data?.availableKnowledgeBases || []
  );

  // 本地選擇的知識庫ID，從 data 中獲取初始值或為空
  const [localSelectedKnowledgeBase, setLocalSelectedKnowledgeBase] = useState(
    data?.selectedKnowledgeBase || data?.selectedFile || ''
  );

  // 新增 top_k 參數
  const [topK, setTopK] = useState(data?.topK || 5);

  // 新增相關性閾值參數
  const [threshold, setThreshold] = useState(data?.threshold || 0.7);

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

  // 處理知識庫選擇
  const handleKnowledgeBaseSelect = useCallback(
    (event) => {
      const knowledgeBaseId = event.target.value;
      console.log(`選擇知識庫: ${knowledgeBaseId}`);

      // 只有在真正改變時才更新狀態
      if (knowledgeBaseId !== localSelectedKnowledgeBase) {
        setLocalSelectedKnowledgeBase(knowledgeBaseId);
        // 同時更新新舊欄位名稱以保持相容性
        updateParentState('selectedKnowledgeBase', knowledgeBaseId);
        updateParentState('selectedFile', knowledgeBaseId); // 向後相容
      }
    },
    [localSelectedKnowledgeBase, updateParentState]
  );

  // 處理檢索筆數選擇
  const handleTopKSelect = useCallback(
    (event) => {
      const newTopK = parseInt(event.target.value, 10);

      // 只有在真正改變時才更新狀態
      if (newTopK !== topK) {
        setTopK(newTopK);
        updateParentState('topK', newTopK);
      }
    },
    [topK, updateParentState]
  );

  // 處理相關性閾值變更
  const handleThresholdChange = useCallback(
    (event) => {
      const newThreshold = parseFloat(event.target.value);

      // 驗證輸入值範圍 (0-1)
      if (newThreshold >= 0 && newThreshold <= 1 && !isNaN(newThreshold)) {
        setThreshold(newThreshold);
        updateParentState('threshold', newThreshold);
        console.log(`更新相關性閾值: ${newThreshold}`);
      }
    },
    [updateParentState]
  );

  // 獲取當前選擇的知識庫ID
  const getCurrentSelectedKnowledgeBase = useCallback(() => {
    return (
      data?.selectedKnowledgeBase ||
      data?.selectedFile ||
      localSelectedKnowledgeBase
    );
  }, [
    data?.selectedKnowledgeBase,
    data?.selectedFile,
    localSelectedKnowledgeBase
  ]);

  // 改進知識庫載入邏輯，避免重複更新
  const loadKnowledgeBases = useCallback(async () => {
    // 避免重複載入
    if (isLoadingKnowledgeBases) return;

    console.log('開始加載知識庫列表...');
    setIsLoadingKnowledgeBases(true);
    setKnowledgeBaseLoadError(null);

    try {
      const options = await llmService.getKnowledgeBaseOptions();

      // 只有在成功獲取到新的選項時才更新
      if (options && options.length > 0) {
        console.log('已獲取知識庫選項:', options);
        setDataKnowledgeBases(options);

        // 只有在當前沒有選擇或選擇無效時才自動選擇第一個
        const currentKB = getCurrentSelectedKnowledgeBase();
        const isCurrentKBValid = options.some(
          (opt) => opt.id === currentKB || opt.value === currentKB
        );

        if (!currentKB || !isCurrentKBValid) {
          const firstKBId = options[0].id || options[0].value;
          console.log(`自動選擇第一個知識庫: ${firstKBId}`);
          setLocalSelectedKnowledgeBase(firstKBId);
          updateParentState('selectedKnowledgeBase', firstKBId);
          updateParentState('selectedFile', firstKBId); // 向後相容
        }
      }
    } catch (error) {
      console.error('加載知識庫失敗:', error);

      // 檢查錯誤訊息是否為"已有進行中的請求"
      if (
        error.message &&
        (error.message.includes('已有進行中的') ||
          error.message.includes('進行中的請求') ||
          error.message.includes('使用相同請求'))
      ) {
        // 這是因為有其他請求正在進行中，不顯示錯誤
        console.log('正在等待其他相同請求完成...');
      } else {
        // 對於其他類型的錯誤，顯示錯誤信息
        setKnowledgeBaseLoadError('無法載入知識庫列表，請稍後再試');
      }
    } finally {
      setIsLoadingKnowledgeBases(false);
    }
  }, [
    isLoadingKnowledgeBases,
    getCurrentSelectedKnowledgeBase,
    updateParentState
  ]);

  // 優化狀態同步邏輯，避免循環更新
  useEffect(() => {
    // 同步 selectedKnowledgeBase 或 selectedFile (向後相容)
    const parentSelected = data?.selectedKnowledgeBase || data?.selectedFile;
    if (parentSelected && parentSelected !== localSelectedKnowledgeBase) {
      setLocalSelectedKnowledgeBase(parentSelected);
    }
  }, [data?.selectedKnowledgeBase, data?.selectedFile, id]); // 🔧 移除 localSelectedKnowledgeBase 依賴，避免循環

  // 將 topK 同步分離到獨立的 useEffect
  useEffect(() => {
    if (data?.topK && data.topK !== topK) {
      console.log(`同步 topK 值從 ${topK} 到 ${data.topK}`);
      setTopK(data.topK);
    }
  }, [data?.topK]); // 🔧 移除 topK 依賴，避免循環

  // 同步 threshold 值
  useEffect(() => {
    if (data?.threshold !== undefined && data.threshold !== threshold) {
      console.log(`同步 threshold 值從 ${threshold} 到 ${data.threshold}`);
      setThreshold(data.threshold);
    }
  }, [data?.threshold]); //  移除 threshold 依賴，避免循環

  // 簡化組件掛載時的初始化，減少重複日誌
  useEffect(() => {
    // 只在組件掛載時載入知識庫列表一次
    loadKnowledgeBases();
  }, []); // 🔧 空依賴數組，只在掛載時執行一次

  // 移除 onClick 中的 handleReloadKnowledgeBases，改為使用 onFocus
  const handleSelectFocus = useCallback(() => {
    // 只有在知識庫列表為空且沒有正在加載時才重新加載
    if (dataKnowledgeBases.length === 0 && !isLoadingKnowledgeBases) {
      loadKnowledgeBases();
    }
  }, [dataKnowledgeBases.length, isLoadingKnowledgeBases, loadKnowledgeBases]);

  // 格式化顯示選項（包含檔案數量）
  const formatKnowledgeBaseLabel = useCallback((kb) => {
    const baseLabel = kb.name || kb.label;
    const fileCount =
      kb.fileCount !== undefined ? ` (${kb.fileCount} 個檔案)` : '';
    return `${baseLabel}${fileCount}`;
  }, []);

  return (
    <div className='rounded-lg shadow-md overflow-visible w-75'>
      {/* Header section with icon and title */}
      <div className='bg-cyan-400 p-4 rounded-t-lg'>
        <div className='flex items-center'>
          <div className='w-6 h-6 bg-white rounded-md flex items-center justify-center mr-2'>
            <IconBase type='knowledge' />
          </div>
          <span className='font-medium text-white'>
            {formatNodeTitle('Knowledge Retrieval', id)}
          </span>
        </div>
      </div>

      {/* White content area */}
      <div className='bg-white p-4 rounded-b-lg'>
        <div className='mb-3'>
          <label className='block text-sm text-gray-700 mb-1 font-bold'>
            Data Source
          </label>
          <div className='relative'>
            <div className='flex'>
              <select
                className={`w-full border ${
                  knowledgeBaseLoadError ? 'border-red-300' : 'border-gray-300'
                } rounded-md p-2 text-sm bg-white appearance-none ${
                  isLoadingKnowledgeBases ? 'opacity-70 cursor-wait' : ''
                }`}
                value={getCurrentSelectedKnowledgeBase()}
                onChange={handleKnowledgeBaseSelect}
                onFocus={handleSelectFocus}
                disabled={isLoadingKnowledgeBases}
                style={{
                  paddingRight: '2rem',
                  textOverflow: 'ellipsis'
                }}>
                <option
                  value=''
                  disabled>
                  請選擇...
                </option>
                {dataKnowledgeBases.map((kb) => (
                  <option
                    key={kb.id || kb.value}
                    value={kb.id || kb.value}
                    title={kb.description}>
                    {formatKnowledgeBaseLabel(kb)}
                  </option>
                ))}
              </select>

              <div className='absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none'>
                {isLoadingKnowledgeBases ? (
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500'></div>
                ) : (
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
                )}
              </div>
            </div>

            {knowledgeBaseLoadError && (
              <p className='text-xs text-red-500 mt-1'>
                {knowledgeBaseLoadError}
              </p>
            )}
          </div>
        </div>

        {/* 檢索筆數 Section */}
        <div className='mb-3'>
          <label className='block text-sm text-gray-700 mb-2 font-bold'>
            檢索筆數
          </label>
          <span className='block text-gray-500 mb-3 text-xs'>
            顯示1至5筆搜尋結果
          </span>
          <div className='relative'>
            <select
              className='w-full border border-gray-300 rounded-md p-2 text-sm bg-white appearance-none'
              value={topK}
              onChange={handleTopKSelect}
              style={{
                paddingRight: '2rem'
              }}>
              {[1, 2, 3, 4, 5].map((num) => (
                <option
                  key={num}
                  value={num}>
                  {num}
                </option>
              ))}
            </select>

            <div className='absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none'>
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

        {/* 相關性 Section */}
        <div className='mb-3'>
          <label className='block text-sm text-gray-700 mb-2 font-bold'>
            相關性
          </label>
          <div className='relative'>
            <input
              type='number'
              className='w-full border border-gray-300 rounded-md p-2 text-sm bg-white'
              value={threshold}
              onChange={handleThresholdChange}
              min='0'
              max='1'
              step='0.1'
              placeholder='1.0'
              style={{
                paddingRight: '1rem'
              }}
            />
          </div>
        </div>
      </div>

      {/* Input handle - 將 id 改為 "passage" */}
      <Handle
        type='target'
        position={Position.Left}
        id='passage'
        style={{
          background: '#e5e7eb',
          border: '1px solid #D3D3D3',
          width: '12px',
          height: '12px',
          left: '-6px'
        }}
        isConnectable={isConnectable}
      />

      {/* Output handle - 保持 id 為 "output" */}
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

export default memo(KnowledgeRetrievalNode);
