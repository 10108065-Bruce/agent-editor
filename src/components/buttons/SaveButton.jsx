// src/components/SaveButton.js
import React, { useState } from 'react';

/**
 * 儲存按鈕元件 - 按照設計規格實現
 * 內部綠色按鈕尺寸: 寬85px, 高40px
 * 白色背景邊距: 上下10px, 左右13px
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
        return 'bg-[#00ced1] opacity-70 text-white';
      case 'saved':
        return 'bg-[#00ced1] text-white';
      case 'error':
        return 'bg-red-500 text-white';
      default:
        return 'bg-[#00ced1] text-white';
    }
  };

  return (
    <div
      className='inline-block bg-white rounded-full shadow-md'
      style={{
        padding: '10px 13px',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
      <button
        className={`rounded-full text-sm font-medium ${getButtonStyles()} ${className}`}
        onClick={triggerSave}
        disabled={saveState === 'saving'}
        title='儲存流程'
        style={{
          width: '85px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
        {saveState === 'saving' ? (
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
            <span>儲存中...</span>
          </div>
        ) : saveState === 'saved' ? (
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
            <span>已儲存</span>
          </div>
        ) : saveState === 'error' ? (
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
          <span>Save</span>
        )}
      </button>
    </div>
  );
};

export default SaveButton;
