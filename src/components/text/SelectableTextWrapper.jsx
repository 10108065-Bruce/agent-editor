import React, { useCallback, useState, useEffect } from 'react';
import { useReactFlow } from 'reactflow';

/**
 * 文字選擇包裝器元件
 * 解決在節點中選擇文字時會移動節點的問題
 *
 * @param {Object} props - 元件屬性
 * @param {ReactNode} props.children - 需要支援選擇的子元素
 * @param {string} props.className - 額外的CSS類別名稱
 * @returns {JSX.Element} 可選擇文字的包裝元件
 */
const SelectableTextWrapper = ({ children, className = '', ...rest }) => {
  // 取得ReactFlow實例以控制節點可拖曳狀態
  const { setNodesDraggable } = useReactFlow();

  // 追蹤是否正在進行文字選擇
  const [isSelecting, setIsSelecting] = useState(false);

  // 滑鼠按下時的初始位置
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  // 處理滑鼠按下事件
  const handleMouseDown = useCallback((e) => {
    // 只處理左鍵點擊
    if (e.button !== 0) return;

    // 如果點擊的是輸入元素，不禁用拖曳
    if (
      e.target.tagName === 'INPUT' ||
      e.target.tagName === 'TEXTAREA' ||
      e.target.isContentEditable ||
      e.target.tagName === 'BUTTON'
    ) {
      return;
    }

    // 記錄初始點擊位置
    setStartPos({ x: e.clientX, y: e.clientY });

    // 此時還不確定是否是選擇文字，所以不立即禁用拖曳
  }, []);

  // 處理滑鼠移動事件
  const handleMouseMove = useCallback(
    (e) => {
      // 只有當滑鼠按下時才處理
      if (e.buttons !== 1) return;

      // 計算滑鼠移動距離
      const dx = Math.abs(e.clientX - startPos.x);
      const dy = Math.abs(e.clientY - startPos.y);

      // 如果移動超過閾值，認為是選擇文字操作
      if (dx > 3 || dy > 3) {
        if (!isSelecting) {
          setIsSelecting(true);
          // 禁用節點拖曳
          setNodesDraggable(false);
        }
      }
    },
    [isSelecting, startPos, setNodesDraggable]
  );

  // 處理滑鼠釋放事件
  const handleMouseUp = useCallback(() => {
    if (isSelecting) {
      // 延遲啟用節點拖曳，確保文字選擇完成
      setTimeout(() => {
        setIsSelecting(false);
        setNodesDraggable(true);
      }, 0);
    }
  }, [isSelecting, setNodesDraggable]);

  // 清理函數 - 確保在元件卸載時恢復節點拖曳功能
  useEffect(() => {
    return () => {
      if (isSelecting) {
        setNodesDraggable(true);
      }
    };
  }, [isSelecting, setNodesDraggable]);

  return (
    <div
      className={`selectable-text-wrapper ${className} ${
        isSelecting ? 'selecting' : ''
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      {...rest}>
      {children}
    </div>
  );
};

export default SelectableTextWrapper;
