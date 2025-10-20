import React, { useEffect, useState } from 'react';
import pencilIcon from '../assets/objects-pencil-1.svg';
import lockIcon from '../assets/icon-lock-on-off.svg';
import checkIcon from '../assets/icon-save.png';

const APAAssistant = ({
  title,
  onTitleChange,
  isLocked = false,
  isNew = false,
  runhistory = false,
  flowId = null,
  onLockToggle = null
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isTogglingLock, setIsTogglingLock] = useState(false);

  useEffect(() => {
    if (isNew) {
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [isNew]);

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

  const handleLockClick = async (e) => {
    e.stopPropagation();

    // 如果沒有 flowId 或是新建模式,不允許切換鎖定狀態
    if (!flowId || flowId === 'new' || isNew) {
      return;
    }

    // 如果正在切換中,不允許重複操作
    if (isTogglingLock) return;

    // 調用父組件傳入的鎖定切換函數
    if (onLockToggle && typeof onLockToggle === 'function') {
      setIsTogglingLock(true);
      try {
        await onLockToggle(!isLocked);
      } catch (error) {
        console.error('切換鎖定狀態失敗:', error);
      } finally {
        setIsTogglingLock(false);
      }
    }
  };

  const showBorderAndShadow = isEditing;

  return (
    <div className='fixed top-3 left-[80px] transform'>
      <div
        className={`transition-all duration-300 ease-in-out ${
          showBorderAndShadow && !isLocked ? '' : ''
        }`}>
        <div
          className={`transition-all duration-300 ease-in-out ${
            showBorderAndShadow && !isLocked
              ? 'border border-gray-200 bg-white'
              : ''
          } px-4 py-2 flex items-center w-64 md:w-80 ${
            isLocked ? 'bg-gray-50' : ''
          }`}>
          {/* 左側圖標 - 只在非編輯狀態顯示 */}
          {!runhistory && !isEditing && (
            <div className='mr-2 text-gray-700 flex-shrink-0 transition-all duration-300 ease-in-out'>
              <div
                className={`flex items-center justify-center transition-transform duration-200 ${
                  isTogglingLock
                    ? 'opacity-50 cursor-wait'
                    : 'cursor-pointer hover:scale-110'
                }`}
                style={{
                  width: '16px',
                  height: '16px'
                }}
                onClick={isLocked ? handleLockClick : handleEditClick}
                title={isLocked ? '點擊解鎖工作流' : '點擊編輯標題'}>
                {isTogglingLock ? (
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700'></div>
                ) : (
                  <img
                    src={isLocked ? lockIcon : pencilIcon}
                    width={16}
                    height={16}
                    className='max-w-full max-h-full object-contain transition-opacity duration-200'
                    alt={isLocked ? 'locked' : 'edit'}
                  />
                )}
              </div>
            </div>
          )}

          {/* 標題輸入區域 */}
          <div className='flex-1 relative min-w-0'>
            {isEditing && !isLocked ? (
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
                title={isLocked ? '工作流已鎖定,無法編輯標題' : '點擊編輯標題'}>
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
