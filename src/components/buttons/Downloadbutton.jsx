import React from 'react';

/**
 * 自定義下載按鈕組件 - 用於觸發將數據發送到母頁面
 *
 * @param {Function} onDownload - 處理下載操作的函數
 * @param {String} className - 額外的 CSS 類別
 */
const DownloadButton = ({ onDownload, className = '' }) => {
  return (
    <button
      className={`p-2 rounded-md shadow-md border flex items-center space-x-1 bg-white border-gray-200 text-gray-700 hover:bg-gray-50 ${className}`}
      onClick={onDownload}
      title='下載至母頁面'>
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
      <span className='text-sm'>傳送</span>
    </button>
  );
};

export default DownloadButton;
