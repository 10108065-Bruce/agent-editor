import React, { useRef, useEffect, useState } from 'react';

const AutoResizeTextarea = ({
  value,
  onChange,
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

    // 處理聚焦事件
    const handleFocus = () => {
      setIsFocused(true);
    };

    // 處理失焦事件
    const handleBlur = () => {
      setIsFocused(false);
    };

    // 處理中鍵點擊
    const handleMouseDown = (e) => {
      if (e.button === 1) {
        // 中鍵
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // 添加事件監聽器
    textarea.addEventListener('focus', handleFocus);
    textarea.addEventListener('blur', handleBlur);
    textarea.addEventListener('mousedown', handleMouseDown);

    return () => {
      textarea.removeEventListener('focus', handleFocus);
      textarea.removeEventListener('blur', handleBlur);
      textarea.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // 添加全域捕獲階段的wheel事件處理器
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
        // 否則讓textarea正常滾動
      }
    };

    // 防止縮放的全局處理函數
    const preventZoom = (e) => {
      // 檢查是否是在textarea上使用Ctrl+滾輪（常見的縮放手勢）
      if (
        isFocused &&
        (e.ctrlKey || e.metaKey) &&
        (e.target === textarea || textarea.contains(e.target))
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // 添加捕獲階段的事件監聽器，確保在ReactFlow處理前攔截
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

  // 當焦點狀態改變時，修改節點拖動行為
  useEffect(() => {
    if (isFocused) {
      // 尋找父節點中的ReactFlow節點元素
      const findReactFlowNode = (element) => {
        let current = element;
        while (current && !current.classList?.contains('react-flow__node')) {
          current = current.parentElement;
        }
        return current;
      };

      const reactFlowNode = findReactFlowNode(textareaRef.current);

      if (reactFlowNode) {
        // 保存原始className，並添加nodrag類來禁止拖動
        reactFlowNode._originalClassName = reactFlowNode.className;
        reactFlowNode.classList.add('nodrag');
      }

      return () => {
        // 恢復原始className
        if (reactFlowNode && reactFlowNode._originalClassName) {
          reactFlowNode.className = reactFlowNode._originalClassName;
          delete reactFlowNode._originalClassName;
        }
      };
    }
  }, [isFocused]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
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
