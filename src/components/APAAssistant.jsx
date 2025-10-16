import React, { useState } from 'react';
import pencilIcon from '../assets/objects-pencil-1.svg';
import lockIcon from '../assets/icon-lock-on-off.svg';
import checkIcon from '../assets/icon-save.png';

const APAAssistant = ({
  title,
  onTitleChange,
  isLocked = false,
  isNew = false,
  runhistory = false
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleEditClick = () => {
    if (isLocked) return;
    setIsEditing(true);
  };

  const handleConfirm = () => {
    if (isLocked) return;
    if (!title || title.trim() === '') {
      return;
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (isLocked) return;
    if (e.key === 'Enter') {
      if (!title || title.trim() === '') {
        return;
      }
      setIsEditing(false);
    }
  };

  const handleTitleChange = (value) => {
    if (isLocked) return;
    if (onTitleChange) {
      onTitleChange(value);
    }
  };

  // 只有在編輯狀態時才顯示框線和陰影
  const showBorderAndShadow = isEditing;

  return (
    <div className='fixed top-3 left-[80px] transform'>
      <div
        className={`transition-all duration-300 ease-in-out ${
          showBorderAndShadow && !isLocked
            ? 'shadow-[0_3px_10px_rgb(0,0,0,0.1),0_6px_20px_rgb(0,0,0,0.05)]'
            : ''
        }`}>
        <div
          className={`transition-all duration-300 ease-in-out ${
            (showBorderAndShadow && !isLocked) || isNew
              ? 'border border-gray-200 bg-white'
              : ''
          } px-4 py-2 flex items-center w-64 md:w-80 ${
            isLocked ? 'bg-gray-50' : ''
          }`}>
          {/* 左側圖標 - 只在非編輯狀態顯示 */}
          {!runhistory && !isEditing && !isNew && (
            <div className='mr-2 text-gray-700 flex-shrink-0 transition-all duration-300 ease-in-out'>
              <div
                className='flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-110'
                style={{
                  width: '16px',
                  height: '16px'
                }}
                onClick={handleEditClick}>
                <img
                  src={isLocked ? lockIcon : pencilIcon}
                  width={16}
                  height={16}
                  className='max-w-full max-h-full object-contain transition-opacity duration-200'
                  alt={isLocked ? 'locked' : 'edit'}
                />
              </div>
            </div>
          )}

          {/* 標題輸入區域 */}
          <div className='flex-1 relative min-w-0'>
            {(isEditing && !isLocked) || isNew ? (
              <input
                type='text'
                className='w-full outline-none text-gray-800 bg-transparent animate-fadeIn'
                value={title || ''}
                onChange={(e) => handleTitleChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='輸入標題...'
                autoFocus
              />
            ) : (
              <div
                className={`w-full text-gray-800 truncate transition-colors duration-200 ${
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

          {/* 右側確認圖標 */}
          {isEditing && !isLocked && (
            <div
              className='ml-2 flex-shrink-0 text-cyan-500 cursor-pointer animate-scaleIn'
              onClick={handleConfirm}>
              <div
                className='flex items-center justify-center transition-transform duration-200 hover:scale-110'
                style={{
                  width: '16px',
                  height: '16px'
                }}
                title='確認'>
                <img
                  src={checkIcon}
                  width={16}
                  height={16}
                  className='max-w-full max-h-full object-contain'
                  alt='confirm'
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default APAAssistant;
