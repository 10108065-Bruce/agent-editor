import React, { useState } from 'react';

/**
 * 儲存按鈕元件 - 按照設計規格實現
 * 內部綠色按鈕尺寸: 寬85px, 高40px
 * 白色背景邊距: 上下10px, 左右13px
 *
 * @param {Function} onSave - 執行實際儲存作業的函數（必須回傳 Promise）
 * @param {String} className - 要套用到按鈕的額外 CSS 類別
 * @param {String} title - 流程標題
 * @param {String} flowId - 流程 ID，用於判斷是新建還是保存
 * @param {Boolean} disabled - 是否禁用按鈕
 */
const SaveButton = ({
  onSave,
  className = '',
  title = '',
  flowId = '',
  disabled = false
}) => {
  // 追蹤按鈕狀態：''、'saving'、'saved'、'error'
  const [saveState, setSaveState] = useState('');
  // 追蹤錯誤信息
  const [errorMessage, setErrorMessage] = useState('');

  // 檢查標題是否有效
  const isTitleValid = title && title.trim().length > 0;

  // 判斷是新建還是保存
  const isCreateMode = !flowId || flowId === 'new';

  /**
   * 處理按鈕點擊並管理儲存狀態
   */
  const triggerSave = async () => {
    // 驗證標題
    if (!isTitleValid) {
      setSaveState('error');
      setErrorMessage('請先輸入標題');
      setTimeout(() => {
        setSaveState('');
        setErrorMessage('');
      }, 2000);
      return;
    }

    // 防止在儲存時重複點擊
    if (saveState === 'saving') return;

    // 更新 UI 以顯示儲存狀態
    setSaveState('saving');
    setErrorMessage('');

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
      setErrorMessage('儲存失敗');

      // 延遲後重置為預設狀態
      setTimeout(() => {
        setSaveState('');
        setErrorMessage('');
      }, 2000);
    }
  };

  // 根據狀態決定按鈕樣式
  const getButtonStyles = () => {
    if (disabled || (!isTitleValid && !saveState)) {
      return 'bg-gray-400 text-white cursor-not-allowed';
    }

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

  // 設置按鈕提示文字
  const getButtonTitle = () => {
    if (!isTitleValid && !saveState) {
      return '請先輸入標題';
    }
    if (disabled) {
      return '目前無法儲存';
    }
    return isCreateMode ? '建立新流程' : '儲存現有流程';
  };

  // 根據模式和狀態獲取按鈕文字
  const getButtonText = () => {
    if (saveState === 'saving') {
      return (
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
          <span>{isCreateMode ? '建立中...' : '儲存中...'}</span>
        </div>
      );
    } else if (saveState === 'saved') {
      return (
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
          <span>{isCreateMode ? '已建立' : '已儲存'}</span>
        </div>
      );
    } else if (saveState === 'error') {
      return (
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
      );
    } else {
      return <span>{isCreateMode ? 'Create' : 'Save'}</span>;
    }
  };

  // 按鈕寬度 - 根據是否為建立模式調整
  const buttonWidth = isCreateMode ? '92px' : '85px';

  return (
    <div className='relative inline-block'>
      <div
        className='inline-block bg-white rounded-full shadow-md'
        style={{
          padding: '10px 13px',
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
        <button
          className={`rounded-full text-sm font-medium ${getButtonStyles()} ${className}`}
          onClick={triggerSave}
          disabled={
            saveState === 'saving' || disabled || (!isTitleValid && !saveState)
          }
          title={getButtonTitle()}
          style={{
            width: buttonWidth,
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
          {getButtonText()}
        </button>
      </div>

      {/* 錯誤信息提示 */}
      {errorMessage && (
        <div className='absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-red-100 text-red-700 px-2 py-1 rounded text-xs whitespace-nowrap'>
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default SaveButton;
