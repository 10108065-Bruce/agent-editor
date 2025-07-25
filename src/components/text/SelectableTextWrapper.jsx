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
  // 取得ReactFlow實例
  const reactFlowInstance = useReactFlow();

  // 追蹤是否正在進行文字選擇
  const [isSelecting, setIsSelecting] = useState(false);

  // 滑鼠按下時的初始位置
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  // 安全的設置節點拖拽狀態函數
  const setNodesDraggableState = useCallback(
    (draggable) => {
      try {
        // 嘗試使用不同的 ReactFlow API 方法
        if (
          reactFlowInstance &&
          typeof reactFlowInstance.setNodesDraggable === 'function'
        ) {
          reactFlowInstance.setNodesDraggable(draggable);
        } else if (
          reactFlowInstance &&
          typeof reactFlowInstance.getNodes === 'function'
        ) {
          // 備用方案：通過更新節點屬性來控制拖拽
          const nodes = reactFlowInstance.getNodes();
          const updatedNodes = nodes.map((node) => ({
            ...node,
            draggable: draggable
          }));
          if (typeof reactFlowInstance.setNodes === 'function') {
            reactFlowInstance.setNodes(updatedNodes);
          }
        }
      } catch (error) {
        console.warn('無法設置節點拖拽狀態:', error);
      }
    },
    [reactFlowInstance]
  );

  // 處理滑鼠按下事件
  const handleMouseDown = useCallback((e) => {
    // 只處理左鍵點擊
    if (e.button !== 0) return;

    // 如果點擊的是輸入元素，不禁用拖曳
    if (
      e.target.tagName === 'INPUT' ||
      e.target.tagName === 'TEXTAREA' ||
      e.target.isContentEditable ||
      e.target.tagName === 'BUTTON' ||
      e.target.tagName === 'SELECT'
    ) {
      return;
    }

    // 記錄初始點擊位置
    setStartPos({ x: e.clientX, y: e.clientY });

    // 阻止事件冒泡，避免觸發節點拖拽
    e.stopPropagation();
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
          setNodesDraggableState(false);
          // 阻止事件冒泡
          e.stopPropagation();
        }
      }
    },
    [isSelecting, startPos, setNodesDraggableState]
  );

  // 處理滑鼠釋放事件
  const handleMouseUp = useCallback(
    (e) => {
      if (isSelecting) {
        // 阻止事件冒泡
        e.stopPropagation();

        // 延遲啟用節點拖曳，確保文字選擇完成
        setTimeout(() => {
          setIsSelecting(false);
          setNodesDraggableState(true);
        }, 0);
      }
    },
    [isSelecting, setNodesDraggableState]
  );

  // 處理雙擊事件（快速選擇文字）
  const handleDoubleClick = useCallback((e) => {
    // 如果是可編輯元素，允許雙擊選擇
    if (
      e.target.tagName === 'INPUT' ||
      e.target.tagName === 'TEXTAREA' ||
      e.target.isContentEditable
    ) {
      e.stopPropagation();
      return;
    }

    // 對於其他文字元素，阻止雙擊觸發節點操作
    e.stopPropagation();
  }, []);

  // 清理函數 - 確保在元件卸載時恢復節點拖曳功能
  useEffect(() => {
    return () => {
      if (isSelecting) {
        setNodesDraggableState(true);
      }
    };
  }, [isSelecting, setNodesDraggableState]);

  return (
    <div
      className={`selectable-text-wrapper ${className} ${
        isSelecting ? 'selecting' : ''
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      style={{
        userSelect: 'text', // 確保文字可以被選擇
        cursor: isSelecting ? 'text' : 'default'
      }}
      {...rest}>
      {children}
    </div>
  );
};

export default SelectableTextWrapper;
