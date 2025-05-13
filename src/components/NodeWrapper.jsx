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
        border: selected ? '1px solid #00CED1' : 'none',
        borderRadius: '8px',
        boxShadow: selected
          ? '0 0 8px 1px rgba(0, 206, 209, 0.5), 0 0 12px 4px rgba(0, 206, 209, 0.1)'
          : 'none',
        transition: 'border 0.2s ease, box-shadow 0.3s ease',
        cursor: 'pointer'
      }}>
      {children}
    </div>
  );
};

// 記憶元件，防止不必要的重新渲染
export default memo(NodeWrapper);
