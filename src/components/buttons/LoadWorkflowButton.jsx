import React, { useState } from 'react';
import BaseButton from './BaseButton';

import {
  CheckIcon,
  ErrorIcon,
  LoadingSpinner
} from '../../components/common/Icons';
import { useButtonState } from '../../hooks/useButtonState';

const LoadWorkflowButton = ({ onLoad }) => {
  const [workflowId, setWorkflowId] = useState(
    'd50d2adc-dcfc-47f9-9307-88fad8add7ac'
  );
  const [showInput, setShowInput] = useState(false);
  const { state, setLoading, setSuccess, setError } = useButtonState();

  const handleClick = () => {
    setShowInput(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!workflowId || typeof onLoad !== 'function') return;

    try {
      setLoading();
      await onLoad(workflowId);
      setSuccess();
      setWorkflowId('');
      setShowInput(false);
    } catch (error) {
      console.error('載入工作流失敗:', error);
      setError();
    }
  };

  const handleCancel = () => {
    setWorkflowId('');
    setShowInput(false);
  };

  const getButtonStyle = () => {
    if (state === 'loading') return 'loading';
    if (state === 'success') return 'success';
    if (state === 'error') return 'error';
    return 'primary';
  };

  const getButtonContent = () => {
    if (state === 'loading') {
      return (
        <div className='flex items-center justify-center space-x-1'>
          <LoadingSpinner />
          <span>載入中...</span>
        </div>
      );
    }
    if (state === 'success') {
      return (
        <div className='flex items-center justify-center space-x-1'>
          <CheckIcon />
          <span>已載入</span>
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
    return <span>測試用</span>;
  };

  return (
    <div className='relative'>
      <BaseButton
        onClick={handleClick}
        disabled={state === 'loading'}
        title='載入工作流'
        buttonStyle={getButtonStyle()}>
        {getButtonContent()}
      </BaseButton>

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
