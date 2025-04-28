import React, { useRef, useEffect } from 'react';

const AutoResizeTextarea = ({
  value,
  onChange,
  placeholder,
  className,
  ...props
}) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // 重置高度為 'auto' 以正確計算捲動高度
    textarea.style.height = 'auto';

    // 設置高度為實際內容高度
    textarea.style.height = `${Math.max(textarea.scrollHeight, 60)}px`;
  }, [value]);

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
        overflow-hidden 
        min-h-[60px] 
        ${className}
      `}
      {...props}
    />
  );
};

export default AutoResizeTextarea;
