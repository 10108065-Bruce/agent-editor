import React, { memo, useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import KnowledgeRetrievalIcon from '../icons/KnowledgeRetrievalIcon';
import { llmService } from '../../services/WorkflowServicesIntegration';

const KnowledgeRetrievalNode = ({ data, isConnectable }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [fileLoadError, setFileLoadError] = useState(null);

  // 保存文件選項
  const [dataFiles, setDataFiles] = useState(
    data.availableFiles || [
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

  // 本地選擇的文件ID，作為備用
  const [localSelectedFile, setLocalSelectedFile] = useState(
    data.selectedFile || ''
  );

  // 處理文件選擇
  const handleFileSelect = (fileId) => {
    setDropdownOpen(false);
    setLocalSelectedFile(fileId);

    if (data && typeof data.updateNodeData === 'function') {
      data.updateNodeData('selectedFile', fileId);
    } else {
      console.warn(
        'updateNodeData 不是一個函數，無法更新 selectedFile。使用本地狀態代替。'
      );
    }
  };

  // 從API加載文件列表
  const loadFiles = async () => {
    // 避免重複載入
    if (isLoadingFiles) return;

    setIsLoadingFiles(true);
    setFileLoadError(null);

    try {
      const options = await llmService.getFileOptions();

      // 只有在成功獲取到新的選項時才更新
      if (options && options.length > 0) {
        console.log('已獲取文件選項:', options);
        setDataFiles(options);

        // 如果當前選中的文件不在新的選項列表中，選擇首個可用的文件
        const currentFile = getCurrentSelectedFile();
        if (
          !options.some(
            (opt) => opt.id === currentFile || opt.value === currentFile
          ) &&
          options.length > 0
        ) {
          handleFileSelect(options[0].id || options[0].value);
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
  };

  // 獲取當前選擇的文件ID
  const getCurrentSelectedFile = () => {
    return data?.selectedFile || localSelectedFile;
  };

  // 獲取當前選擇的文件名
  const getSelectedFileName = () => {
    const currentFileId = getCurrentSelectedFile();
    if (!currentFileId) return '選擇檔案...';

    const selectedFile = dataFiles.find(
      (file) => file.id === currentFileId || file.value === currentFileId
    );
    return selectedFile
      ? selectedFile.name || selectedFile.label || selectedFile.filename
      : '選擇檔案...';
  };

  // 組件掛載時載入文件列表
  useEffect(() => {
    loadFiles();
  }, []);

  // 當點擊下拉菜單時，嘗試刷新文件列表
  const handleDropdownToggle = () => {
    // 切換下拉菜單狀態
    setDropdownOpen(!dropdownOpen);

    // 如果文件列表為空或者存在錯誤，嘗試重新加載
    if (dataFiles.length <= 2 || fileLoadError) {
      loadFiles();
    }
  };

  return (
    <div className='rounded-lg shadow-md overflow-visible w-64'>
      {/* Header section with icon and title */}
      <div className='bg-cyan-400 p-4 rounded-t-lg'>
        <div className='flex items-center'>
          <div className='w-6 h-6 bg-white rounded-md flex items-center justify-center mr-2'>
            <KnowledgeRetrievalIcon />
          </div>
          <span className='font-medium text-white'>知識檢索</span>
        </div>
      </div>

      {/* White content area */}
      <div className='bg-white p-4 rounded-b-lg'>
        <div className='mb-3'>
          <label className='block text-sm text-gray-700 mb-1'>
            Data Source
          </label>
          <div className='relative'>
            <button
              className={`w-full border ${
                fileLoadError ? 'border-red-300' : 'border-gray-300'
              } rounded-md p-2 text-sm text-left flex justify-between items-center bg-white ${
                isLoadingFiles ? 'opacity-70 cursor-wait' : ''
              }`}
              onClick={handleDropdownToggle}
              disabled={isLoadingFiles}>
              <span>{getSelectedFileName()}</span>

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
                  strokeLinejoin='round'
                  className={`ml-2 transform ${
                    dropdownOpen ? 'rotate-180' : ''
                  }`}>
                  <polyline points='6 9 12 15 18 9'></polyline>
                </svg>
              )}
            </button>

            {fileLoadError && (
              <p className='text-xs text-red-500 mt-1'>{fileLoadError}</p>
            )}

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className='absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto'>
                {dataFiles.map((file) => (
                  <div
                    key={file.id || file.value}
                    className='p-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center'
                    onClick={() => handleFileSelect(file.id || file.value)}>
                    {(file.id || file.value) === getCurrentSelectedFile() && (
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='16'
                        height='16'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        className='mr-2'>
                        <polyline points='20 6 9 17 4 12'></polyline>
                      </svg>
                    )}
                    <span
                      className={
                        (file.id || file.value) === getCurrentSelectedFile()
                          ? 'ml-0'
                          : 'ml-6'
                      }>
                      {file.name || file.label || file.filename}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Input handle */}
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

      {/* Output handle */}
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

export default memo(KnowledgeRetrievalNode);
