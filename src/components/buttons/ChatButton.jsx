/**
 * Chat 按鈕組件
 */
import React from 'react';
import BaseButton from './BaseButton';
import chatbuttleIcon from '../../assets/icon-chatbubble.png';

const ChatButton = ({
  onClick,
  disabled = false,
  className = '',
  title = '開啟聊天',
  width = '50px',
  showBorder = false,
  unreadCount = 50 // 新增：未讀訊息數量
}) => {
  return (
    <BaseButton
      onClick={onClick}
      disabled={disabled}
      className={className}
      width={width}
      title={title}
      buttonStyle='secondary'
      showBorder={showBorder}
      badgeCount={unreadCount} // 傳遞數字標記
      badgeMax={99}>
      <img
        src={chatbuttleIcon}
        alt='chat'
      />
    </BaseButton>
  );
};

export default ChatButton;
