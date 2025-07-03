import React, { memo, useState, useEffect, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { llmService } from '../../services/index';
import IconBase from '../icons/IconBase';

const KnowledgeRetrievalNode = ({ data, isConnectable, id }) => {
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [fileLoadError, setFileLoadError] = useState(null);

  // 保存文件選項，使用默認值
  const [dataFiles, setDataFiles] = useState(
    data?.availableFiles || [
      {
        id: 'icdcode',
        value: 'icdcode',
        name: 'ICDCode.csv',
        label: 'ICDCode.csv'
      },
      {
        id: 'cardiology',
        value: 'cardiology',
        name: 'Cardiology_Diagnoses.csv',
        label: 'Cardiology_Diagnoses.csv'
      }
    ]
  );

  // 本地選擇的文件ID，從 data 中獲取初始值或為空
  const [localSelectedFile, setLocalSelectedFile] = useState(
    data?.selectedFile || ''
  );

  // 新增 top_k 參數
  const [topK, setTopK] = useState(data?.topK || 5);

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

  // 處理文件選擇
  const handleFileSelect = useCallback(
    (event) => {
      const fileId = event.target.value;
      console.log(`選擇文件: ${fileId}`);

      // 只有在真正改變時才更新狀態
      if (fileId !== localSelectedFile) {
        setLocalSelectedFile(fileId);
        updateParentState('selectedFile', fileId);
      }
    },
    [localSelectedFile, updateParentState]
  );

  // 獲取當前選擇的文件ID
  const getCurrentSelectedFile = useCallback(() => {
    return data?.selectedFile || localSelectedFile;
  }, [data?.selectedFile, localSelectedFile]);

  // 改進檔案載入邏輯，避免重複更新
  const loadFiles = useCallback(async () => {
    // 避免重複載入
    if (isLoadingFiles) return;

    console.log('開始加載文件列表...');
    setIsLoadingFiles(true);
    setFileLoadError(null);

    try {
      const options = await llmService.getFileOptions();

      // 只有在成功獲取到新的選項時才更新
      if (options && options.length > 0) {
        console.log('已獲取文件選項:', options);
        setDataFiles(options);

        // 只有在當前沒有選擇或選擇無效時才自動選擇第一個
        const currentFile = getCurrentSelectedFile();
        const isCurrentFileValid = options.some(
          (opt) => opt.id === currentFile || opt.value === currentFile
        );

        if (!currentFile || !isCurrentFileValid) {
          const firstFileId = options[0].id || options[0].value;
          console.log(`自動選擇第一個文件: ${firstFileId}`);
          setLocalSelectedFile(firstFileId);
          updateParentState('selectedFile', firstFileId);
        }
      }
    } catch (error) {
      console.error('加載文件失敗:', error);

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
        setFileLoadError('無法載入文件列表，請稍後再試');
      }
    } finally {
      setIsLoadingFiles(false);
    }
  }, [isLoadingFiles, getCurrentSelectedFile, updateParentState]);

  // 優化狀態同步邏輯，避免循環更新
  useEffect(() => {
    // 只在父組件的 selectedFile 確實不同且不為空時才同步
    if (data?.selectedFile && data.selectedFile !== localSelectedFile) {
      console.log('監測 data.selectedFile 變更：', {
        'data.selectedFile': data?.selectedFile,
        localSelectedFile,
        'node.id': id,
        shouldSync: true
      });
      console.log(
        `同步文件選擇從 ${localSelectedFile} 到 ${data.selectedFile}`
      );
      setLocalSelectedFile(data.selectedFile);
    }
  }, [data?.selectedFile, id]); // 🔧 移除 localSelectedFile 依賴，避免循環

  // 將 topK 同步分離到獨立的 useEffect
  useEffect(() => {
    if (data?.topK && data.topK !== topK) {
      console.log(`同步 topK 值從 ${topK} 到 ${data.topK}`);
      setTopK(data.topK);
    }
  }, [data?.topK]); // 🔧 移除 topK 依賴，避免循環

  // 簡化組件掛載時的初始化，減少重複日誌
  useEffect(() => {
    // 只在組件掛載時載入文件列表一次
    loadFiles();
  }, []); // 🔧 空依賴數組，只在掛載時執行一次

  // 移除 onClick 中的 handleReloadFiles，改為使用 onFocus
  const handleSelectFocus = useCallback(() => {
    // 只有在文件列表為空且沒有正在加載時才重新加載
    if (dataFiles.length === 0 && !isLoadingFiles) {
      console.log('下拉選單獲得焦點，檢查是否需要重新加載文件');
      loadFiles();
    }
  }, [dataFiles.length, isLoadingFiles, loadFiles]);

  return (
    <div className='rounded-lg shadow-md overflow-visible w-64'>
      {/* Header section with icon and title */}
      <div className='bg-cyan-400 p-4 rounded-t-lg'>
        <div className='flex items-center'>
          <div className='w-6 h-6 bg-white rounded-md flex items-center justify-center mr-2'>
            <IconBase type='knowledge' />
          </div>
          <span className='font-medium text-white'>知識檢索</span>
        </div>
      </div>

      {/* White content area */}
      <div className='bg-white p-4 rounded-b-lg'>
        <div className='mb-3'>
          <label className='block text-sm text-gray-700 mb-1 font-bold'>
            Knowledge
          </label>
          <div className='relative'>
            <div className='flex'>
              <select
                className={`w-full border ${
                  fileLoadError ? 'border-red-300' : 'border-gray-300'
                } rounded-md p-2 text-sm bg-white appearance-none ${
                  isLoadingFiles ? 'opacity-70 cursor-wait' : ''
                }`}
                value={getCurrentSelectedFile()}
                onChange={handleFileSelect}
                onFocus={handleSelectFocus}
                disabled={isLoadingFiles}
                style={{
                  paddingRight: '2rem',
                  textOverflow: 'ellipsis'
                }}>
                <option
                  value=''
                  disabled>
                  選擇檔案...
                </option>
                {dataFiles.map((file) => (
                  <option
                    key={file.id || file.value}
                    value={file.id || file.value}>
                    {file.name || file.label || file.filename}
                  </option>
                ))}
              </select>

              <div className='absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none'>
                {isLoadingFiles ? (
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

            {fileLoadError && (
              <p className='text-xs text-red-500 mt-1'>{fileLoadError}</p>
            )}
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
