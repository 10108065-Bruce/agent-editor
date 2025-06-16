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
  loading = false
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
      default:
        return 'bg-[#00ced1] text-white hover:bg-[#00b8bb] transition-colors';
    }
  };

  return (
    <div className='relative inline-block'>
      <div
        className='inline-block bg-white rounded-full shadow-md'
        style={{
          padding: '10px 13px',
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
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
      </div>
    </div>
  );
};

export default BaseButton;
