import React, { memo, useCallback } from 'react';

// 此元件作為包裝器，提供所有節點一致的選擇高亮顯示
const NodeWrapper = ({ children, selected, onClick }) => {
  // 記憶點擊處理器，防止不必要的重新渲染
  const handleClick = useCallback(
    (e) => {
      // 防止事件冒泡
      e.stopPropagation();
      if (typeof onClick === 'function') {
        onClick(e);
      }
    },
    [onClick]
  );

  return (
    <div
      className={`node-wrapper ${selected ? 'selected-node' : ''}`}
      onClick={handleClick}
      style={{
        border: selected ? '1px solid #F57DBD' : 'none',
        borderRadius: '8px',
        transition: 'border 0.2s ease',
        cursor: 'pointer'
      }}>
      {children}
    </div>
  );
};

// 記憶元件，防止不必要的重新渲染
export default memo(NodeWrapper);
