import React, { useRef, useEffect, useState } from 'react';

const AutoResizeTextarea = ({
  value,
  onChange,
  onCompositionStart,
  onCompositionEnd,
  onKeyDown,
  placeholder,
  className,
  ...props
}) => {
  const textareaRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  // 自動調整高度效果
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // 重置高度為 'auto' 以正確計算捲動高度
    textarea.style.height = 'auto';

    // 設置高度為實際內容高度
    textarea.style.height = `${Math.max(textarea.scrollHeight, 60)}px`;
  }, [value]);

  // 聚焦處理效果
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleFocus = () => {
      setIsFocused(true);
    };

    const handleBlur = () => {
      setIsFocused(false);
    };

    const handleMouseDown = (e) => {
      if (e.button === 1) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    textarea.addEventListener('focus', handleFocus);
    textarea.addEventListener('blur', handleBlur);
    textarea.addEventListener('mousedown', handleMouseDown);

    return () => {
      textarea.removeEventListener('focus', handleFocus);
      textarea.removeEventListener('blur', handleBlur);
      textarea.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // 滾輪事件處理
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    // 在捕獲階段處理滾輪事件
    const handleWheelCapture = (e) => {
      if (isFocused && (e.target === textarea || textarea.contains(e.target))) {
        // 在textarea中滾動時，阻止事件冒泡以防止ReactFlow縮放
        e.stopPropagation();

        // 檢查是否到達滾動邊界

        const isAtTop = textarea.scrollTop <= 0;
        const isAtBottom =
          Math.abs(
            textarea.scrollTop + textarea.clientHeight - textarea.scrollHeight
          ) <= 1;

        // 如果在邊界嘗試繼續滾動，阻止默認行為以防止頁面滾動
        if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
          e.preventDefault();
        }
      }
    };

    const preventZoom = (e) => {
      if (
        isFocused &&
        (e.ctrlKey || e.metaKey) &&
        (e.target === textarea || textarea.contains(e.target))
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener('wheel', handleWheelCapture, {
      passive: false,
      capture: true
    });
    document.addEventListener('wheel', preventZoom, {
      passive: false,
      capture: true
    });

    return () => {
      document.removeEventListener('wheel', handleWheelCapture, {
        passive: false,
        capture: true
      });
      document.removeEventListener('wheel', preventZoom, {
        passive: false,
        capture: true
      });
    };
  }, [isFocused]);

  // 拖動控制
  useEffect(() => {
    if (isFocused) {
      const findReactFlowNode = (element) => {
        let current = element;
        while (current && !current.classList?.contains('react-flow__node')) {
          current = current.parentElement;
        }
        return current;
      };

      const reactFlowNode = findReactFlowNode(textareaRef.current);

      if (reactFlowNode) {
        reactFlowNode._originalClassName = reactFlowNode.className;
        reactFlowNode.classList.add('nodrag');
      }

      return () => {
        if (reactFlowNode && reactFlowNode._originalClassName) {
          reactFlowNode.className = reactFlowNode._originalClassName;
          delete reactFlowNode._originalClassName;
        }
      };
    }
  }, [isFocused]);

  // 事件處理
  const handleChange = (e) => {
    console.log(`AutoResizeTextarea onChange: "${e.target.value}"`);

    if (onChange) {
      onChange(e);
    }
  };

  const handleCompositionStart = (e) => {
    console.log('AutoResizeTextarea: composition start');
    if (onCompositionStart) {
      onCompositionStart(e);
    }
  };

  const handleCompositionEnd = (e) => {
    console.log('AutoResizeTextarea: composition end');
    if (onCompositionEnd) {
      onCompositionEnd(e);
    }
  };

  // 新增：鍵盤事件處理
  const handleKeyDown = (e) => {
    console.log(`AutoResizeTextarea keyDown: ${e.key}`);
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={handleChange}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      onKeyDown={handleKeyDown} // 新增：傳遞 onKeyDown 事件
      placeholder={placeholder}
      rows={1}
      className={`
        w-full 
        border 
        border-gray-300 
        rounded 
        p-2 
        text-sm 
        resize-none 
        overflow-auto 
        min-h-[60px] 
        max-h-[200px]
        ${isFocused ? 'z-50 shadow-md border-blue-400' : ''} 
        ${className}
      `}
      {...props}
    />
  );
};

export default AutoResizeTextarea;
