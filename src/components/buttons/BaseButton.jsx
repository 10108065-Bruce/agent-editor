import React from 'react';

/**
 * 基礎按鈕組件 - 提供統一的樣式和結構
 */
const BaseButton = ({
  children,
  onClick,
  disabled = false,
  title = '',
  className = '',
  width = '85px',
  buttonStyle = 'primary',
  loading = false,
  showBorder = true,
  badgeCount = 0, // 新增：數字標記
  badgeMax = 99 // 新增：數字標記的最大顯示值
}) => {
  const getButtonStyles = () => {
    if (disabled) {
      return 'bg-gray-400 text-white cursor-not-allowed';
    }

    switch (buttonStyle) {
      case 'loading':
        return 'bg-[#00ced1] opacity-70 text-white';
      case 'success':
        return 'bg-[#00ced1] text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'secondary':
        return 'bg-white text-gray-700 hover:bg-gray-100 transition-colors';
      default:
        return 'bg-[#00ced1] text-white hover:bg-[#00b8bb] transition-colors';
    }
  };

  // 格式化數字標記顯示
  const formatBadgeCount = (count) => {
    if (count > badgeMax) {
      return `${badgeMax}+`;
    }
    return count;
  };

  const buttonContent = (
    <button
      className={`rounded-full text-sm font-medium ${getButtonStyles()} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
      style={{
        width,
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
      {children}
    </button>
  );

  return (
    <div className='relative'>
      {showBorder ? (
        <div className='bg-white rounded-full shadow-md'>{buttonContent}</div>
      ) : (
        buttonContent
      )}

      {/* 數字標記 Badge */}
      {badgeCount > 0 && (
        <div
          className='absolute -top-1 -right-1 bg-[#ffaa1e] text-white text-xs font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1 shadow-lg animate-badge-in'
          style={{
            border: '2px solid white'
          }}>
          {formatBadgeCount(badgeCount)}
        </div>
      )}

      <style jsx>{`
        @keyframes badgeIn {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-badge-in {
          animation: badgeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default BaseButton;
