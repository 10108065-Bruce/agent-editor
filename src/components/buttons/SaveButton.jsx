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

    if (!isTitleValid) {
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
    if (disabled || isLocked || (!isTitleValid && !state)) return 'disabled';
    if (state === 'loading') return 'loading';
    if (state === 'success') return 'success';
    if (state === 'error') return 'error';
    return 'primary';
  };

  const getButtonTitle = () => {
    if (isLocked) return '工作流已鎖定，無法保存';
    if (!isTitleValid && !state) return '請先輸入標題';
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

  return (
    <div className='relative'>
      <BaseButton
        onClick={triggerSave}
        disabled={disabled || isLocked || (!isTitleValid && !state)} // 新增 isLocked 條件
        title={getButtonTitle()}
        className={className}
        width={buttonWidth}
        buttonStyle={getButtonStyle()}>
        {getButtonContent()}
      </BaseButton>

      {errorMessage && (
        <div className='absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-red-100 text-red-700 px-2 py-1 rounded text-xs whitespace-nowrap'>
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default SaveButton;
