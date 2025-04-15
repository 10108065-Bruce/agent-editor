// src/components/FileButtons.js
import React, { useState } from 'react';

/**
 * 儲存檔案按鈕元件 - 用於儲存至本地檔案
 *
 * @param {Function} onSave - 準備要儲存資料的函數（必須回傳 Promise）
 * @param {String} className - 額外的 CSS 類別
 */
export const SaveFileButton = ({ onSave, className = '' }) => {
  const [saveState, setSaveState] = useState('');

  const handleSaveClick = async () => {
    if (saveState === 'saving') return;

    setSaveState('saving');

    try {
      await onSave();
      setSaveState('saved');

      setTimeout(() => {
        setSaveState('');
      }, 2000);
    } catch (error) {
      console.error('儲存檔案時發生錯誤：', error);
      setSaveState('error');

      setTimeout(() => {
        setSaveState('');
      }, 2000);
    }
  };

  return (
    <button
      className={`p-2 rounded-md shadow-md border flex items-center space-x-1 ${
        saveState === 'saving'
          ? 'bg-blue-100 border-blue-300 text-blue-600'
          : saveState === 'saved'
          ? 'bg-green-100 border-green-300 text-green-600'
          : saveState === 'error'
          ? 'bg-red-100 border-red-300 text-red-600'
          : 'bg-white border-gray-200 text-gray-700'
      } ${className}`}
      onClick={handleSaveClick}
      disabled={saveState === 'saving'}
      title='儲存至檔案'>
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
            <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'></path>
            <polyline points='7 10 12 15 17 10'></polyline>
            <line
              x1='12'
              y1='15'
              x2='12'
              y2='3'></line>
          </svg>
          <span className='text-sm'>下載</span>
        </>
      )}
    </button>
  );
};

/**
 * 載入檔案按鈕元件 - 用於從本地檔案載入
 *
 * @param {Function} onLoad - 處理已載入資料的函數（接收已解析的資料）
 * @param {String} className - 額外的 CSS 類別
 */
export const LoadFileButton = ({ onLoad, className = '' }) => {
  const [loadState, setLoadState] = useState('');

  const handleLoadClick = async () => {
    if (loadState === 'loading') return;

    setLoadState('loading');

    try {
      await onLoad();
      setLoadState('loaded');

      setTimeout(() => {
        setLoadState('');
      }, 2000);
    } catch (error) {
      console.error('載入檔案時發生錯誤：', error);
      setLoadState('error');

      setTimeout(() => {
        setLoadState('');
      }, 2000);
    }
  };

  return (
    <button
      className={`p-2 rounded-md shadow-md border flex items-center space-x-1 ${
        loadState === 'loading'
          ? 'bg-blue-100 border-blue-300 text-blue-600'
          : loadState === 'loaded'
          ? 'bg-green-100 border-green-300 text-green-600'
          : loadState === 'error'
          ? 'bg-red-100 border-red-300 text-red-600'
          : 'bg-white border-gray-200 text-gray-700'
      } ${className}`}
      onClick={handleLoadClick}
      disabled={loadState === 'loading'}
      title='從檔案載入'>
      {loadState === 'loading' ? (
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
          <span className='text-sm'>載入中...</span>
        </>
      ) : loadState === 'loaded' ? (
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
          <span className='text-sm'>已載入</span>
        </>
      ) : loadState === 'error' ? (
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
            <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'></path>
            <polyline points='17 8 12 3 7 8'></polyline>
            <line
              x1='12'
              y1='3'
              x2='12'
              y2='15'></line>
          </svg>
          <span className='text-sm'>上傳</span>
        </>
      )}
    </button>
  );
};
