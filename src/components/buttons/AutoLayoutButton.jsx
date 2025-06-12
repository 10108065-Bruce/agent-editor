// src/components/buttons/AutoLayoutButton.jsx
import React, { useState, useRef, useEffect } from 'react';

/**
 * 自動排版按鈕組件 - 使用 dagre 進行智能排版
 * @param {Function} onLayout - 執行自動排版的函數，接收方向參數 (TB, LR, BT, RL)
 * @param {boolean} disabled - 是否禁用按鈕
 */
const AutoLayoutButton = ({ onLayout, disabled = false }) => {
  const [layoutDirection, setLayoutDirection] = useState('LR'); // 'TB', 'LR', 'BT', 'RL'
  const [showDirectionMenu, setShowDirectionMenu] = useState(false);
  const [isLayouting, setIsLayouting] = useState(false);
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
    { value: 'RL', label: '右到左', icon: '←', description: '從右側向左側排列' }
  ];

  // 點擊外部關閉下拉選單
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDirectionMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLayout = async () => {
    if (disabled || !onLayout) return;

    try {
      setIsLayouting(true);
      console.log(`執行自動排版，方向: ${layoutDirection}`);

      // 調用 dagre 自動排版函數，傳入方向參數
      await onLayout(layoutDirection);

      // 顯示成功通知
      if (typeof window !== 'undefined' && window.notify) {
        window.notify({
          message: `自動排版完成 (${
            directions.find((d) => d.value === layoutDirection)?.label
          })`,
          type: 'success',
          duration: 2000
        });
      }
    } catch (error) {
      console.error('自動排版失敗:', error);

      // 顯示錯誤通知
      if (typeof window !== 'undefined' && window.notify) {
        window.notify({
          message: '自動排版失敗，請檢查節點連接',
          type: 'error',
          duration: 3000
        });
      }
    } finally {
      setIsLayouting(false);
    }
  };

  const handleDirectionChange = async (direction) => {
    setLayoutDirection(direction);
    setShowDirectionMenu(false);

    // 立即執行自動排版
    if (onLayout && !disabled && !isLayouting) {
      try {
        setIsLayouting(true);
        console.log(`切換並執行自動排版，方向: ${direction}`);

        await onLayout(direction);

        // 顯示成功通知
        if (typeof window !== 'undefined' && window.notify) {
          window.notify({
            message: `自動排版完成 (${
              directions.find((d) => d.value === direction)?.label
            })`,
            type: 'success',
            duration: 2000
          });
        }
      } catch (error) {
        console.error('自動排版失敗:', error);

        // 顯示錯誤通知
        if (typeof window !== 'undefined' && window.notify) {
          window.notify({
            message: '自動排版失敗，請檢查節點連接',
            type: 'error',
            duration: 3000
          });
        }
      } finally {
        setIsLayouting(false);
      }
    }
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setShowDirectionMenu(!showDirectionMenu);
  };

  const currentDirection = directions.find((d) => d.value === layoutDirection);

  return (
    <div
      className='relative'
      ref={dropdownRef}>
      <div
        className='inline-block bg-white rounded-full shadow-md'
        style={{
          padding: '10px 13px',
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
        {/* 主要按鈕 - 整合方向顯示和排版功能 */}
        <button
          className={`rounded-full text-sm font-medium flex items-center justify-center space-x-2 ${
            disabled || isLayouting
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-[#00ced1] text-white hover:bg-[#00b8bb] transition-colors'
          }`}
          onClick={handleLayout}
          disabled={disabled || isLayouting}
          title={`自動排版 (${currentDirection?.label}) - ${currentDirection?.description}`}
          style={{
            width: '120px',
            height: '40px',
            position: 'relative'
          }}>
          {/* 左側方向圖示 */}
          <div className='flex items-center justify-center'>
            <span style={{ fontSize: '16px', marginRight: '6px' }}>
              {currentDirection?.icon}
            </span>

            {/* 中間文字和載入狀態 */}
            {isLayouting ? (
              <div className='flex items-center space-x-1'>
                <svg
                  className='animate-spin'
                  xmlns='http://www.w3.org/2000/svg'
                  width='14'
                  height='14'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'>
                  <path d='M21 12a9 9 0 1 1-6.219-8.56'></path>
                </svg>
                <span>排版中</span>
              </div>
            ) : (
              <span>自動排版</span>
            )}
          </div>

          {/* 右側下拉箭頭 */}
          <div
            className='flex items-center justify-center ml-2 pl-2 border-l border-white/30'
            onClick={toggleDropdown}
            style={{
              cursor: disabled || isLayouting ? 'not-allowed' : 'pointer',
              opacity: disabled || isLayouting ? 0.5 : 1
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
                transform: showDirectionMenu
                  ? 'rotate(180deg)'
                  : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }}>
              <polyline points='6 9 12 15 18 9'></polyline>
            </svg>
          </div>
        </button>
      </div>

      {/* 方向選擇下拉選單 */}
      {showDirectionMenu && !disabled && !isLayouting && (
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
                <svg
                  className='ml-auto'
                  xmlns='http://www.w3.org/2000/svg'
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'>
                  <polyline points='20 6 9 17 4 12'></polyline>
                </svg>
              )}
            </button>
          ))}

          {/* 排版說明 */}
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
