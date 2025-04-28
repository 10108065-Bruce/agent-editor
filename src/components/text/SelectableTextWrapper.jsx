import React, { useCallback, useState, useEffect } from 'react';
import { useReactFlow } from 'reactflow';

/**
 * 文本选择包装器组件
 * 解决在节点中选择文本时会移动节点的问题
 *
 * @param {Object} props - 组件属性
 * @param {ReactNode} props.children - 需要支持选择的子元素
 * @param {string} props.className - 额外的CSS类名
 * @returns {JSX.Element} 可选择文本的包装组件
 */
const SelectableTextWrapper = ({ children, className = '', ...rest }) => {
  // 获取ReactFlow实例以控制节点可拖动状态
  const { setNodesDraggable } = useReactFlow();

  // 跟踪是否正在进行文本选择
  const [isSelecting, setIsSelecting] = useState(false);

  // 鼠标按下时的初始位置
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  // 处理鼠标按下事件
  const handleMouseDown = useCallback((e) => {
    // 只处理左键点击
    if (e.button !== 0) return;

    // 如果点击的是输入元素，不禁用拖动
    if (
      e.target.tagName === 'INPUT' ||
      e.target.tagName === 'TEXTAREA' ||
      e.target.isContentEditable ||
      e.target.tagName === 'BUTTON'
    ) {
      return;
    }

    // 记录初始点击位置
    setStartPos({ x: e.clientX, y: e.clientY });

    // 此时还不确定是否是选择文本，所以不立即禁用拖动
  }, []);

  // 处理鼠标移动事件
  const handleMouseMove = useCallback(
    (e) => {
      // 只有当鼠标按下时才处理
      if (e.buttons !== 1) return;

      // 计算鼠标移动距离
      const dx = Math.abs(e.clientX - startPos.x);
      const dy = Math.abs(e.clientY - startPos.y);

      // 如果移动超过阈值，认为是选择文本操作
      if (dx > 3 || dy > 3) {
        if (!isSelecting) {
          setIsSelecting(true);
          // 禁用节点拖动
          setNodesDraggable(false);
        }
      }
    },
    [isSelecting, startPos, setNodesDraggable]
  );

  // 处理鼠标释放事件
  const handleMouseUp = useCallback(() => {
    if (isSelecting) {
      // 延迟启用节点拖动，确保文本选择完成
      setTimeout(() => {
        setIsSelecting(false);
        setNodesDraggable(true);
      }, 0);
    }
  }, [isSelecting, setNodesDraggable]);

  // 清理函数 - 确保在组件卸载时恢复节点拖动功能
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
