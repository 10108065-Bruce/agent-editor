// src/components/SaveButton.js
import React, { useState } from 'react';

/**
 * 儲存按鈕元件 - 顯示具有不同儲存狀態的按鈕，並呼叫提供的儲存函數
 *
 * @param {Function} onSave - 執行實際儲存作業的函數（必須回傳 Promise）
 * @param {String} className - 要套用到按鈕的額外 CSS 類別
 */
const SaveButton = ({ onSave, className = '' }) => {
  // 追蹤按鈕狀態：''、'saving'、'saved'、'error'
  const [saveState, setSaveState] = useState('');

  /**
   * 處理按鈕點擊並管理儲存狀態
   */
  const triggerSave = async () => {
    // 防止在儲存時重複點擊
    if (saveState === 'saving') return;

    // 更新 UI 以顯示儲存狀態
    setSaveState('saving');

    try {
      // 呼叫父元件提供的實際儲存函數
      await onSave();

      // 更新 UI 以顯示成功狀態
      setSaveState('saved');

      // 延遲後重置為預設狀態
      setTimeout(() => {
        setSaveState('');
      }, 2000);
    } catch (error) {
      console.error('儲存按鈕：儲存作業期間發生錯誤：', error);

      // 更新 UI 以顯示錯誤狀態
      setSaveState('error');

      // 延遲後重置為預設狀態
      setTimeout(() => {
        setSaveState('');
      }, 2000);
    }
  };

  // 根據狀態決定按鈕樣式
  const getButtonStyles = () => {
    switch (saveState) {
      case 'saving':
        return 'bg-blue-100 border-blue-300 text-blue-600';
      case 'saved':
        return 'bg-green-100 border-green-300 text-green-600';
      case 'error':
        return 'bg-red-100 border-red-300 text-red-600';
      default:
        return 'bg-white border-gray-200 text-gray-700';
    }
  };

  return (
    <button
      className={`p-2 rounded-md shadow-md border flex items-center space-x-1 ${getButtonStyles()} ${className}`}
      onClick={triggerSave}
      disabled={saveState === 'saving'}
      title='儲存流程'>
      {saveState === 'saving' ? (
        <>
          <svg
            className='animate-spin'
            xmlns='http://www.w3.org/2000/svg'
            width='20'
            height='20'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'>
            <path d='M21 12a9 9 0 1 1-6.219-8.56'></path>
          </svg>
          <span className='text-sm'>儲存中...</span>
        </>
      ) : saveState === 'saved' ? (
        <>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='20'
            height='20'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'>
            <path d='M20 6L9 17l-5-5'></path>
          </svg>
          <span className='text-sm'>已儲存</span>
        </>
      ) : saveState === 'error' ? (
        <>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='20'
            height='20'
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
          <span className='text-sm'>錯誤</span>
        </>
      ) : (
        <>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='20'
            height='20'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'>
            <path d='M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z'></path>
            <polyline points='17 21 17 13 7 13 7 21'></polyline>
            <polyline points='7 3 7 8 15 8'></polyline>
          </svg>
          <span className='text-sm'>儲存</span>
        </>
      )}
    </button>
  );
};

export default SaveButton;
