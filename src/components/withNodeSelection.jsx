import React, { memo, useCallback, useEffect, useState, useRef } from 'react';
import NodeWrapper from './NodeWrapper';

// 高階元件，為任何節點元件新增選擇功能
const withNodeSelection = (WrappedComponent) => {
  // 建立一個具有選擇功能的新元件
  const WithNodeSelection = (props) => {
    const { selected, data } = props;
    const nodeRef = useRef(null);
    const [isInputFocused, setIsInputFocused] = useState(false);

    // 記憶化點擊處理函數以防止不必要的渲染
    const handleNodeClick = useCallback(
      (e) => {
        e.stopPropagation();

        if (data && typeof data.onSelect === 'function') {
          data.onSelect();
        }
      },
      [data]
    );

    // 新增全域事件監聽器，檢測輸入框焦點狀態
    useEffect(() => {
      // 當輸入框獲得焦點時，禁用節點拖動
      const handleFocus = (e) => {
        const isInput =
          e.target.tagName === 'INPUT' ||
          e.target.tagName === 'TEXTAREA' ||
          e.target.isContentEditable;

        if (isInput) {
          setIsInputFocused(true);

          // 找到當前節點元素並新增不可拖動標記
          const nodeElement = findReactFlowNode(e.target);
          if (nodeElement) {
            // 儲存原始的可拖動狀態
            nodeElement._originalDraggable = nodeElement.draggable;
            nodeElement.draggable = false;

            // 新增CSS類，用來處理ReactFlow的拖動
            nodeElement.classList.add('nodrag');
          }
        }
      };

      // 當輸入框失去焦點時，恢復節點拖動
      const handleBlur = (e) => {
        const isInput =
          e.target.tagName === 'INPUT' ||
          e.target.tagName === 'TEXTAREA' ||
          e.target.isContentEditable;

        if (isInput) {
          setIsInputFocused(false);

          // 找到當前節點元素並恢復拖動
          const nodeElement = findReactFlowNode(e.target);
          if (nodeElement) {
            // 恢復原始的可拖動狀態
            if (nodeElement._originalDraggable !== undefined) {
              nodeElement.draggable = nodeElement._originalDraggable;
              delete nodeElement._originalDraggable;
            }

            // 移除CSS類
            nodeElement.classList.remove('nodrag');
          }
        }
      };

      // 新增滑鼠按下事件處理，用於阻止輸入框聚焦時的拖動
      const handleMouseDown = (e) => {
        if (isInputFocused) {
          // 如果當前有輸入框處於聚焦狀態，阻止事件冒泡以防止節點拖動
          e.stopPropagation();
        }
      };

      // 新增事件監聽
      document.addEventListener('focusin', handleFocus, true);
      document.addEventListener('focusout', handleBlur, true);

      // 如果有節點參考，新增滑鼠按下事件監聽
      if (nodeRef.current) {
        nodeRef.current.addEventListener('mousedown', handleMouseDown, true);
      }

      // 清理函數
      return () => {
        document.removeEventListener('focusin', handleFocus, true);
        document.removeEventListener('focusout', handleBlur, true);

        // 如果有節點參考，移除事件監聽
        if (nodeRef.current) {
          nodeRef.current.removeEventListener(
            'mousedown',
            handleMouseDown,
            true
          );
        }
      };
    }, [isInputFocused]);

    // 工具函數：從輸入元素向上查找ReactFlow節點
    function findReactFlowNode(element) {
      let current = element;
      // 向上查找直到找到react-flow__node類或到達文件根
      while (current && !current.classList?.contains('react-flow__node')) {
        current = current.parentElement;
      }
      return current;
    }

    // 渲染包裹元件，並放置在NodeWrapper內
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

  // 設定顯示名稱以便除錯
  WithNodeSelection.displayName = `withNodeSelection(${getDisplayName(
    WrappedComponent
  )})`;

  // 記憶化元件以防止不必要的重新渲染
  return memo(WithNodeSelection);
};

// 輔助函數：取得元件的顯示名稱
function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export default withNodeSelection;
