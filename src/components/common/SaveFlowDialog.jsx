import React, { useState, useCallback } from 'react';

const SaveFlowDialog = ({
  isOpen,
  onClose,
  onSave,
  title = '請先儲存您的 Flow'
}) => {
  const [flowName, setFlowName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!flowName.trim()) {
      // 顯示錯誤通知
      if (typeof window !== 'undefined' && window.notify) {
        window.notify({
          message: '請輸入流程名稱',
          type: 'error',
          duration: 3000
        });
      }
      return;
    }

    setIsSaving(true);
    try {
      await onSave(flowName);
      setFlowName(''); // 清空輸入
    } catch (error) {
      console.error('保存流程失敗:', error);
      // 顯示錯誤通知
      if (typeof window !== 'undefined' && window.notify) {
        // window.notify({
        //   message: '保存流程失敗',
        //   type: 'error',
        //   duration: 3000
        // });
      }
    } finally {
      setIsSaving(false);
    }
  }, [flowName, onSave]);

  const handleClose = useCallback(() => {
    if (!isSaving) {
      setFlowName('');
      onClose();
    }
  }, [isSaving, onClose]);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === 'Enter' && !isSaving) {
        handleSave();
      }
    },
    [handleSave, isSaving]
  );

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div
        className='bg-white rounded-lg p-6 w-[500px] max-w-[90vw] shadow-xl'
        onClick={(e) => e.stopPropagation()}>
        <h3 className='text-lg font-medium mb-4 text-gray-900'>{title}</h3>

        <p className='text-sm text-gray-600 mb-4'>
          為了建立專屬 Webhook URL，請先儲存您的 Flow。
        </p>

        <div className='mb-6'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Flow Name (流程名稱)
          </label>
          <input
            type='text'
            value={flowName}
            onChange={(e) => setFlowName(e.target.value)}
            onKeyPress={handleKeyPress}
            className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 disabled:bg-gray-100 disabled:cursor-not-allowed'
            placeholder='未命名的流程'
            disabled={isSaving}
            autoFocus
          />
        </div>

        <div className='flex justify-end space-x-3'>
          <button
            onClick={handleClose}
            disabled={isSaving}
            className='px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed'>
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !flowName.trim()}
            className='px-4 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center'>
            {isSaving && (
              <svg
                className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                fill='none'
                viewBox='0 0 24 24'>
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
              </svg>
            )}
            {isSaving ? '保存中...' : '建立'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveFlowDialog;
