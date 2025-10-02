import React from 'react';
import BaseButton from './BaseButton';
import {
  CheckIcon,
  ErrorIcon,
  LoadingSpinner
} from '../../components/common/Icons';
import { useButtonState } from '../../hooks/useButtonState';

const SaveButton = ({
  onSave,
  className = '',
  title = '',
  flowId = '',
  disabled = false,
  isLocked = false // 新增 isLocked 參數
}) => {
  const { state, errorMessage, setLoading, setSuccess, setError } =
    useButtonState();

  const isTitleValid = title && title.trim().length > 0;
  const isCreateMode = !flowId || flowId === 'new';

  const triggerSave = async () => {
    if (isLocked) {
      setError('工作流已鎖定，無法保存');
      return;
    }

    // 在 create 模式下，即使沒有 title 也允許點擊（會觸發對話框）
    // 在 update 模式下，必須有 title 才能儲存
    if (!isCreateMode && !isTitleValid) {
      setError('請先輸入標題');
      return;
    }

    if (state === 'loading') return;

    setLoading();

    try {
      await onSave();
      setSuccess();
    } catch (error) {
      console.error('儲存按鈕：儲存作業期間發生錯誤：', error);
      setError('儲存失敗');
    }
  };

  const getButtonStyle = () => {
    // 在 create 模式下，即使沒有 title 也顯示為 primary 樣式（可點擊）
    // 在 update 模式下，沒有 title 時顯示為 disabled
    if (disabled || isLocked) return 'disabled';
    if (!isCreateMode && !isTitleValid && !state) return 'disabled';
    if (state === 'loading') return 'loading';
    if (state === 'success') return 'success';
    if (state === 'error') return 'error';
    return 'primary';
  };

  const getButtonTitle = () => {
    if (isLocked) return '工作流已鎖定，無法保存';
    // 在 update 模式下，沒有 title 時顯示提示訊息
    if (!isCreateMode && !isTitleValid && !state) return '請先輸入標題';
    if (disabled) return '目前無法儲存';
    return isCreateMode ? '建立新流程' : '儲存現有流程';
  };

  const getButtonContent = () => {
    if (state === 'loading') {
      return (
        <div className='flex items-center justify-center space-x-1'>
          <LoadingSpinner />
          <span>{isCreateMode ? '建立中...' : '儲存中...'}</span>
        </div>
      );
    }
    if (state === 'success') {
      return (
        <div className='flex items-center justify-center space-x-1'>
          <CheckIcon />
          <span>{isCreateMode ? '已建立' : '已儲存'}</span>
        </div>
      );
    }
    if (state === 'error') {
      return (
        <div className='flex items-center justify-center space-x-1'>
          <ErrorIcon />
          <span>錯誤</span>
        </div>
      );
    }

    return <span>{isCreateMode ? 'Create' : 'Save'}</span>;
  };

  const buttonWidth = isCreateMode ? '92px' : '85px';

  // 調整禁用邏輯：create 模式下不因缺少 title 而禁用
  const isDisabled =
    disabled || isLocked || (!isCreateMode && !isTitleValid && !state);

  return (
    <div className='relative group'>
      <BaseButton
        onClick={triggerSave}
        disabled={isDisabled}
        className={`${className} ${isDisabled ? 'pointer-events-none' : ''}`}
        width={buttonWidth}
        buttonStyle={getButtonStyle()}>
        {getButtonContent()}
      </BaseButton>

      {/* Hover 提示 - 在按鈕下方顯示 */}
      {isDisabled && (
        <div className='absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity top-full left-1/3 transform -translate-x-1/2 mt-2 bg-gray-800 text-white px-3 py-2 rounded text-xs whitespace-nowrap z-10'>
          <div className='relative'>
            {/* 提示框箭頭 - 指向上方 */}
            <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-800'></div>
            {getButtonTitle()}
          </div>
        </div>
      )}

      {/* Error message - 調整位置避免重疊 */}
      {errorMessage && (
        <div className='absolute top-full left-1/2 transform -translate-x-1/2 mt-8 bg-red-100 text-red-700 px-2 py-1 rounded text-xs whitespace-nowrap z-20'>
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default SaveButton;
