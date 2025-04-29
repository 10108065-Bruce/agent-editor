import React, { memo, useCallback, useEffect, useState, useRef } from 'react';
import NodeWrapper from './NodeWrapper';

// Higher-order component to add selection capabilities to any node component
const withNodeSelection = (WrappedComponent) => {
  // Create a new component with selection functionality
  const WithNodeSelection = (props) => {
    const { selected, data } = props;
    const nodeRef = useRef(null);
    const [isInputFocused, setIsInputFocused] = useState(false);

    // Memoize the click handler to prevent unnecessary renders
    const handleNodeClick = useCallback(
      (e) => {
        e.stopPropagation();

        if (data && typeof data.onSelect === 'function') {
          data.onSelect();
        }
      },
      [data]
    );

    // 添加全局事件监听器，检测输入框焦点状态
    useEffect(() => {
      // 当输入框获得焦点时，禁用节点拖动
      const handleFocus = (e) => {
        const isInput =
          e.target.tagName === 'INPUT' ||
          e.target.tagName === 'TEXTAREA' ||
          e.target.isContentEditable;

        if (isInput) {
          setIsInputFocused(true);

          // 找到当前节点元素并添加不可拖动标记
          const nodeElement = findReactFlowNode(e.target);
          if (nodeElement) {
            // 保存原始的可拖动状态
            nodeElement._originalDraggable = nodeElement.draggable;
            nodeElement.draggable = false;

            // 添加CSS类，用来处理ReactFlow的拖动
            nodeElement.classList.add('nodrag');
          }
        }
      };

      // 当输入框失去焦点时，恢复节点拖动
      const handleBlur = (e) => {
        const isInput =
          e.target.tagName === 'INPUT' ||
          e.target.tagName === 'TEXTAREA' ||
          e.target.isContentEditable;

        if (isInput) {
          setIsInputFocused(false);

          // 找到当前节点元素并恢复拖动
          const nodeElement = findReactFlowNode(e.target);
          if (nodeElement) {
            // 恢复原始的可拖动状态
            if (nodeElement._originalDraggable !== undefined) {
              nodeElement.draggable = nodeElement._originalDraggable;
              delete nodeElement._originalDraggable;
            }

            // 移除CSS类
            nodeElement.classList.remove('nodrag');
          }
        }
      };

      // 添加鼠标按下事件处理，用于阻止输入框聚焦时的拖动
      const handleMouseDown = (e) => {
        if (isInputFocused) {
          // 如果当前有输入框处于聚焦状态，阻止事件冒泡以防止节点拖动
          e.stopPropagation();
        }
      };

      // 添加事件监听
      document.addEventListener('focusin', handleFocus, true);
      document.addEventListener('focusout', handleBlur, true);

      // 如果有节点引用，添加鼠标按下事件监听
      if (nodeRef.current) {
        nodeRef.current.addEventListener('mousedown', handleMouseDown, true);
      }

      // 清理函数
      return () => {
        document.removeEventListener('focusin', handleFocus, true);
        document.removeEventListener('focusout', handleBlur, true);

        // 如果有节点引用，移除事件监听
        if (nodeRef.current) {
          nodeRef.current.removeEventListener(
            'mousedown',
            handleMouseDown,
            true
          );
        }
      };
    }, [isInputFocused]);

    // 工具函数：从输入元素向上查找ReactFlow节点
    function findReactFlowNode(element) {
      let current = element;
      // 向上查找直到找到react-flow__node类或到达文档根
      while (current && !current.classList?.contains('react-flow__node')) {
        current = current.parentElement;
      }
      return current;
    }

    // Render the wrapped component inside our NodeWrapper
    return (
      <div ref={nodeRef}>
        <NodeWrapper
          selected={selected}
          onClick={handleNodeClick}>
          <WrappedComponent {...props} />
        </NodeWrapper>
      </div>
    );
  };

  // Set display name for debugging
  WithNodeSelection.displayName = `withNodeSelection(${getDisplayName(
    WrappedComponent
  )})`;

  // Memoize the component to prevent unnecessary re-renders
  return memo(WithNodeSelection);
};

// Helper function to get display name of component
function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export default withNodeSelection;
