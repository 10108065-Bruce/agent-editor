import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import UploadIcon from '../icons/Upload';
import BrowserExtensionInputIcon from '../icons/BrowserExtensionInputIcon';

const BrowserExtensionInputNode = ({ data, isConnectable }) => {
  // Default items if not provided
  const items = data.items || [];

  const getIconComponent = (iconType) => {
    switch (iconType) {
      case 'upload':
        return <UploadIcon />;
      case 'document':
        return (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'>
            <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'></path>
            <polyline points='14 2 14 8 20 8'></polyline>
            <line
              x1='16'
              y1='13'
              x2='8'
              y2='13'></line>
            <line
              x1='16'
              y1='17'
              x2='8'
              y2='17'></line>
            <polyline points='10 9 9 9 8 9'></polyline>
          </svg>
        );
      case 'edit':
        return (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'>
            <path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'></path>
            <path d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'></path>
          </svg>
        );
      case 'medical':
        return (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'>
            <path d='M19 16v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3'></path>
            <polyline points='18 8 12 2 6 8'></polyline>
            <line
              x1='12'
              y1='2'
              x2='12'
              y2='16'></line>
            <path d='M9 16a3 3 0 0 0 6 0'></path>
          </svg>
        );
      default:
        return <UploadIcon />;
    }
  };

  const handleNameChange = (index, value) => {
    if (data.updateItemName) {
      data.updateItemName(index, value);
    }
  };

  // 添加新項目的函數
  const handleAddItem = () => {
    // 呼叫外部提供的添加項目函數
    if (data.addItem) {
      data.addItem();
    } else {
      console.log('addItem 函數未定義');
    }
  };

  // 计算每个连接点的垂直位置
  const calculateHandlePosition = (index) => {
    // 标题区域高度
    const headerHeight = 56;

    // 内容区域的上边距
    const contentPadding = 16;

    // 每个项目的高度（包括名称输入、图标和分隔线）
    const itemHeight = 120;

    // 计算连接点的位置
    return headerHeight + contentPadding + index * itemHeight + itemHeight / 2;
  };

  return (
    <div className='shadow-md w-64 relative'>
      {/* 实际内容容器 - 带圆角和overflow: hidden */}
      <div className='rounded-lg overflow-hidden'>
        {/* Header section with icon and title */}
        <div className='bg-gray-100 p-4'>
          <div className='flex items-center'>
            <div className='w-6 h-6 rounded-md bg-teal-500 flex items-center justify-center text-white mr-2'>
              <BrowserExtensionInputIcon />
            </div>
            <span className='font-medium'>Browser Extension input</span>
          </div>
        </div>

        {/* Separator line */}
        <div className='border-t border-gray-200'></div>

        {/* White content area */}
        <div className='bg-white p-4'>
          {/* Multiple name/icon pairs */}
          {items.map((item, idx) => (
            <div
              key={idx}
              className='mb-4 last:mb-2 relative'>
              <div className='mb-2'>
                <label className='block text-sm text-gray-700 mb-1'>name</label>
                <input
                  type='text'
                  className='w-full border border-gray-300 rounded p-2 text-sm'
                  value={item.name}
                  onChange={(e) => handleNameChange(idx, e.target.value)}
                />
              </div>

              <div className='flex items-center mb-2'>
                <label className='block text-sm text-gray-700 mr-4'>icon</label>
                <div className='flex-1 flex justify-center items-center'>
                  <div className='w-10 h-10 flex justify-center items-center'>
                    {getIconComponent(item.icon)}
                  </div>
                </div>

                {/* Empty space for alignment */}
                <div className='w-12 h-5'></div>
              </div>

              {/* Separator if not the last item */}
              {idx < items.length - 1 && (
                <div className='border-t border-gray-200 my-3'></div>
              )}
            </div>
          ))}

          {/* Add button - teal color - now adds items to the node */}
          <button
            className='w-full bg-teal-500 hover:bg-teal-600 text-white rounded-md p-2 flex justify-center items-center mt-4'
            onClick={handleAddItem}>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='20'
              height='20'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'>
              <line
                x1='12'
                y1='5'
                x2='12'
                y2='19'></line>
              <line
                x1='5'
                y1='12'
                x2='19'
                y2='12'></line>
            </svg>
          </button>
        </div>
      </div>

      {/* Place all handles outside the overflow:hidden container */}
      {items.map((item, idx) => (
        <Handle
          key={`handle-${idx}`}
          type='source'
          position={Position.Right}
          id={`output-${idx}`}
          style={{
            background: '#000',
            width: '10px',
            height: '10px',
            right: '-5px',
            top: calculateHandlePosition(idx),
            transform: 'translateY(-50%)', // Only center vertically
            zIndex: 1000,
            border: '2px solid white'
          }}
          isConnectable={isConnectable}
        />
      ))}
    </div>
  );
};

export default memo(BrowserExtensionInputNode);
