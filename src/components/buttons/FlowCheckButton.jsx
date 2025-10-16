import React from 'react';
import BaseButton from './BaseButton';
import flowCheckIcon from '../../assets/icon-flowcheck-off.png';

const FlowCheckButton = ({
  onClick,
  disabled = false,
  className = '',
  title = '流程檢查',
  width = '50px',
  showBorder = false,
  errors = [], // 接收錯誤訊息陣列
  unreadCount = 0 // 修改：默認為0
}) => {
  const [showPopover, setShowPopover] = React.useState(false);

  // 計算實際顯示的錯誤數量
  const errorCount = unreadCount || errors.length;

  return (
    <span
      className='relative'
      onMouseEnter={() => setShowPopover(true)}
      onMouseLeave={() => setShowPopover(false)}>
      <BaseButton
        onClick={onClick}
        disabled={disabled}
        className={className}
        width={width}
        title={title}
        buttonStyle='secondary'
        badgeCount={errorCount > 0 ? errorCount : undefined}
        showBorder={showBorder}>
        <img
          src={flowCheckIcon}
          alt='flowcheck'
        />
      </BaseButton>

      {/* Popover - 只在有錯誤訊息時顯示 */}
      {showPopover && errors.length > 0 && (
        <div
          className='absolute left-0 bg-gray-900 text-white px-4 py-3 rounded-lg text-xs z-50 shadow-xl'
          style={{
            minWidth: '300px',
            maxWidth: '550px',
            top: 'calc(100% + 8px)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
          {/* 箭頭 */}
          <div className='absolute -top-2 left-6 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-900' />

          {/* 錯誤訊息列表 */}
          <div className='space-y-2'>
            {errors.map((error, index) => (
              <div
                key={index}
                className='flex items-start space-x-2'>
                {/* <span className='text-red-400 flex-shrink-0 mt-0.5'>⚠</span> */}
                <span className='text-left font-bold'>{error}</span>
                <br />
              </div>
            ))}
          </div>
        </div>
      )}
    </span>
  );
};

export default FlowCheckButton;
