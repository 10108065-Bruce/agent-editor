import React, { useState, useRef, useEffect } from 'react';
import BaseButton from './BaseButton';
import { CheckIcon, LoadingSpinner } from '../common/Icons';
import { useButtonState } from '../../hooks/useButtonState';
import { useNotification } from '../../hooks/useNotification';

const AutoLayoutButton = ({ onLayout, disabled = false, isLocked = false }) => {
  const [layoutDirection, setLayoutDirection] = useState('LR');
  const [showDirectionMenu, setShowDirectionMenu] = useState(false);
  const { state, setLoading, setSuccess, setError } = useButtonState();
  const { notify } = useNotification();
  const dropdownRef = useRef(null);

  const directions = [
    {
      value: 'TB',
      label: '上到下',
      icon: '↓',
      description: '從頂部向底部排列'
    },
    {
      value: 'LR',
      label: '左到右',
      icon: '→',
      description: '從左側向右側排列'
    },
    {
      value: 'BT',
      label: '下到上',
      icon: '↑',
      description: '從底部向頂部排列'
    },
    {
      value: 'RL',
      label: '右到左',
      icon: '←',
      description: '從右側向左側排列'
    }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDirectionMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const executeLayout = async (direction) => {
    if (disabled || !onLayout || isLocked) return;

    if (isLocked) {
      notify('工作流已鎖定，無法執行自動排版', 'warning', 3000);
      return;
    }

    try {
      setLoading();
      console.log(`執行自動排版，方向: ${direction}`);

      await onLayout(direction);

      setSuccess();
      notify(
        `自動排版完成 (${
          directions.find((d) => d.value === direction)?.label
        })`,
        'success'
      );
    } catch (error) {
      console.error('自動排版失敗:', error);
      setError();
      notify('自動排版失敗，請檢查節點連接', 'error', 3000);
    }
  };

  const handleLayout = () => {
    if (isLocked) {
      notify('工作流已鎖定，無法執行自動排版', 'warning', 3000);
      return;
    }
    executeLayout(layoutDirection);
  };

  const handleDirectionChange = async (direction) => {
    if (isLocked) {
      notify('工作流已鎖定，無法執行自動排版', 'warning', 3000);
      return;
    }

    setLayoutDirection(direction);
    setShowDirectionMenu(false);

    if (onLayout && !disabled && state !== 'loading') {
      await executeLayout(direction);
    }
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    if (isLocked) {
      notify('工作流已鎖定，無法更改排版設定', 'warning', 3000);
      return;
    }
    setShowDirectionMenu(!showDirectionMenu);
  };

  const currentDirection = directions.find((d) => d.value === layoutDirection);

  const getButtonStyle = () => {
    if (disabled || state === 'loading' || isLocked) return 'disabled';
    return 'primary';
  };

  const getButtonTitle = () => {
    if (isLocked) return '工作流已鎖定，無法執行自動排版';
    return `Layout (${currentDirection?.label}) - ${currentDirection?.description}`;
  };

  const getButtonContent = () => {
    return (
      <div
        className='flex items-center justify-center w-full'
        onClick={toggleDropdown}>
        <div className='flex items-center justify-center'>
          <span style={{ fontSize: '16px', marginRight: '6px' }}>
            {currentDirection?.icon}
          </span>

          {state === 'loading' ? (
            <div className='flex items-center space-x-1'>
              <LoadingSpinner size={14} />
              <span>排版中</span>
            </div>
          ) : (
            <span>Layout</span>
          )}
        </div>

        <div
          className='flex items-center justify-center ml-2 pl-2 border-l border-white/30'
          onClick={toggleDropdown}
          style={{
            cursor:
              disabled || state === 'loading' || isLocked
                ? 'not-allowed'
                : 'pointer',
            opacity: disabled || state === 'loading' || isLocked ? 0.5 : 1
          }}>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='12'
            height='12'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            style={{
              transform: showDirectionMenu ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}>
            <polyline points='6 9 12 15 18 9'></polyline>
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div
      className='relative'
      ref={dropdownRef}>
      <BaseButton
        // onClick={handleLayout}
        disabled={disabled || isLocked} // 新增 isLocked 條件
        title={getButtonTitle()}
        width='120px'
        buttonStyle={getButtonStyle()}>
        {getButtonContent()}
      </BaseButton>

      {showDirectionMenu && !disabled && state !== 'loading' && !isLocked && (
        <div className='absolute top-full left-0 mt-2 p-2 bg-white rounded-md shadow-lg border border-gray-200 z-30 min-w-[200px]'>
          <div className='text-sm text-gray-600 mb-2 px-2 font-medium'>
            選擇排版方向並自動執行:
          </div>
          {directions.map((direction) => (
            <button
              key={direction.value}
              onClick={() => handleDirectionChange(direction.value)}
              className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center space-x-3 hover:bg-gray-50 ${
                layoutDirection === direction.value
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-700'
              }`}
              title={direction.description}>
              <span className='inline-block w-6 text-center text-base'>
                {direction.icon}
              </span>
              <div className='flex-1'>
                <div className='font-medium'>{direction.label}</div>
                <div className='text-xs text-gray-500'>
                  {direction.description}
                </div>
              </div>
              {layoutDirection === direction.value && (
                <CheckIcon className='ml-auto' />
              )}
            </button>
          ))}

          <div className='mt-2 pt-2 border-t border-gray-200'>
            <div className='text-xs text-gray-500 px-2'>
              💡 自動排版會根據節點連接關係智能調整位置
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoLayoutButton;
