// src/components/buttons/LoadWorkflowButton.jsx
import React, { useState } from 'react';

/**
 * 載入工作流按鈕組件 - 與SaveButton風格一致
 *
 * @param {Function} onLoad - 執行實際載入工作流作業的函數
 */
const LoadWorkflowButton = ({ onLoad }) => {
  const [workflowId, setWorkflowId] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [loadState, setLoadState] = useState(''); // '', 'loading', 'loaded', 'error'

  const handleClick = () => {
    setShowInput(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!workflowId || typeof onLoad !== 'function') return;

    try {
      setLoadState('loading');
      await onLoad(workflowId);
      setLoadState('loaded');
      setTimeout(() => {
        setLoadState('');
      }, 2000);

      setWorkflowId('');
      setShowInput(false);
    } catch (error) {
      console.error('載入工作流失敗:', error);
      setLoadState('error');
      setTimeout(() => {
        setLoadState('');
      }, 2000);
    }
  };

  const handleCancel = () => {
    setWorkflowId('');
    setShowInput(false);
  };

  // 根據狀態決定按鈕樣式
  const getButtonStyles = () => {
    switch (loadState) {
      case 'loading':
        return 'bg-[#00ced1] opacity-70 text-white';
      case 'loaded':
        return 'bg-[#00ced1] text-white';
      case 'error':
        return 'bg-red-500 text-white';
      default:
        return 'bg-[#00ced1] text-white';
    }
  };

  return (
    <div className='relative'>
      <div
        className='inline-block bg-white rounded-full shadow-md'
        style={{
          padding: '10px 13px',
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
        <button
          className={`rounded-full text-sm font-medium ${getButtonStyles()}`}
          onClick={handleClick}
          disabled={loadState === 'loading'}
          title='載入工作流'
          style={{
            width: '85px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
          {loadState === 'loading' ? (
            <div className='flex items-center justify-center space-x-1'>
              <svg
                className='animate-spin'
                xmlns='http://www.w3.org/2000/svg'
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'>
                <path d='M21 12a9 9 0 1 1-6.219-8.56'></path>
              </svg>
              <span>載入中...</span>
            </div>
          ) : loadState === 'loaded' ? (
            <div className='flex items-center justify-center space-x-1'>
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
                <path d='M20 6L9 17l-5-5'></path>
              </svg>
              <span>已載入</span>
            </div>
          ) : loadState === 'error' ? (
            <div className='flex items-center justify-center space-x-1'>
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
                <circle
                  cx='12'
                  cy='12'
                  r='10'></circle>
                <line
                  x1='12'
                  y1='8'
                  x2='12'
                  y2='12'></line>
                <line
                  x1='12'
                  y1='16'
                  x2='12.01'
                  y2='16'></line>
              </svg>
              <span>錯誤</span>
            </div>
          ) : (
            <span>測試用</span>
          )}
        </button>
      </div>

      {/* 彈出的輸入表單 */}
      {showInput && (
        <div className='absolute top-full left-0 mt-2 p-3 bg-white rounded-md shadow-lg border border-gray-200 z-20 w-64'>
          <form
            onSubmit={handleSubmit}
            className='flex flex-col'>
            <label className='mb-1 text-sm text-gray-600'>
              請輸入工作流 ID:
            </label>
            <input
              type='text'
              value={workflowId}
              onChange={(e) => setWorkflowId(e.target.value)}
              className='border border-gray-300 rounded-md px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-[#00ced1] focus:border-transparent'
              autoFocus
              placeholder='例如: 5e9867a0-58b4-4c16-acbb-e194df6efa46'
            />
            <div className='flex justify-end space-x-2'>
              <button
                type='button'
                onClick={handleCancel}
                className='px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 rounded-md border border-gray-300 hover:bg-gray-50'>
                取消
              </button>
              <button
                type='submit'
                className='px-3 py-1.5 text-sm bg-[#00ced1] text-white rounded-md hover:bg-[#00b5b8]'>
                載入
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default LoadWorkflowButton;
