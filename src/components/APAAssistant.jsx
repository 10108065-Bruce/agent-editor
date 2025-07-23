import React, { useState } from 'react';
import workflowIcon from '../assets/icn-workflow.svg';
import pencilIcon from '../assets/objects-pencil-1.svg';
import lockIcon from '../assets/icon-lock-on-off.svg';
// This version uses a fully controlled pattern with no internal state for the title
const APAAssistant = ({ title, onTitleChange, isLocked = false }) => {
  const [isEditing, setIsEditing] = useState(true);

  const handleEditClick = () => {
    if (isLocked) return; // 鎖定狀態下不允許編輯
    setIsEditing(true);
  };

  const handleSave = () => {
    if (isLocked) return; // 鎖定狀態下不允許保存
    // console.log('handleSave');
    // setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (isLocked) return; // 鎖定狀態下不允許鍵盤操作
    // console.log('handleKeyDown', e);
    if (e.key === 'Enter') {
      setIsEditing(false);
    }
  };

  const handleTitleChange = (value) => {
    if (isLocked) return; // 鎖定狀態下不允許修改標題
    if (onTitleChange) {
      onTitleChange(value);
    }
  };

  return (
    <div className='fixed top-4 left-1/2 transform -translate-x-1/2 z-50'>
      {/* Container with double shadow effect */}
      <div className='rounded-full shadow-[0_3px_10px_rgb(0,0,0,0.1),0_6px_20px_rgb(0,0,0,0.05)]'>
        <div
          className={`bg-white border border-gray-200 rounded-full px-4 py-2 flex items-center w-64 md:w-80 ${
            isLocked ? 'bg-gray-50' : ''
          }`}>
          <div className='mr-2 text-gray-700 flex-shrink-0'>
            <div
              className={'flex items-center justify-center'}
              style={{
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
              <img
                src={workflowIcon}
                width={16}
                height={16}
                className='max-w-full max-h-full object-contain'
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>
          </div>
          <div className='flex-1 relative min-w-0'>
            {isEditing && !isLocked ? (
              <input
                type='text'
                className='w-full outline-none text-gray-800 bg-transparent'
                value={title || ''}
                onChange={(e) => handleTitleChange(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            ) : (
              <div
                className={`w-full text-gray-800 truncate ${
                  isLocked
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'cursor-pointer hover:text-gray-600'
                }`}
                onClick={handleEditClick}
                title={
                  isLocked ? '工作流已鎖定，無法編輯標題' : '點擊編輯標題'
                }>
                {title || ''}
              </div>
            )}
          </div>
          <div
            className={`ml-2 flex-shrink-0 ${
              isLocked ? 'text-orange-500' : 'text-gray-500'
            }`}>
            <div
              className={'flex items-center justify-center'}
              style={{
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={isLocked ? '工作流已鎖定' : '編輯標題'}>
              <img
                src={isLocked ? lockIcon : pencilIcon} // 根據鎖定狀態切換圖標
                width={16}
                height={16}
                className='max-w-full max-h-full object-contain'
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APAAssistant;
