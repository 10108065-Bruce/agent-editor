import React, { useState } from 'react';
import LineIcon from '../icons/LineIcon';
import VersionDisplay from '../../components/VersionDisplay';
const NodeSidebar = ({ handleButtonClick, onDragStart: customDragStart }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // 如果實作搜尋，篩選節點
  const filterNodes = (label) => {
    if (!searchTerm) return true;
    return label.toLowerCase().includes(searchTerm.toLowerCase());
  };

  return (
    <div className='w-64 bg-white p-4 shadow-md h-full overflow-y-auto'>
      {/* 搜尋框 */}
      <div className='relative mb-3'>
        <input
          type='text'
          placeholder='搜尋節點...'
          className='w-full p-2 pl-3 pr-10 border rounded-md'
          onChange={handleSearch}
          value={searchTerm}
        />
        <div className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'>
            <circle
              cx='11'
              cy='11'
              r='8'></circle>
            <line
              x1='21'
              y1='21'
              x2='16.65'
              y2='16.65'></line>
          </svg>
        </div>
      </div>

      {/* 節點選項 */}
      <div className='space-y-3'>
        {filterNodes('Input') && (
          <NodeItem
            color='blue'
            icon={
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'>
                <circle
                  cx='12'
                  cy='12'
                  r='10'></circle>
                <polyline points='12 6 12 12 16 14'></polyline>
              </svg>
            }
            label='Input'
            onClick={() => handleButtonClick('input')}
            nodeType='input'
            onDragStart={customDragStart}
          />
        )}

        {filterNodes('If/Else') && (
          <NodeItem
            color='purple'
            icon={
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'>
                <path d='M16 3h5v5'></path>
                <path d='M8 3H3v5'></path>
                <path d='M3 16v5h5'></path>
                <path d='M16 21h5v-5'></path>
              </svg>
            }
            label='If/Else'
            onClick={() => handleButtonClick('if/else')}
            nodeType='if/else'
            onDragStart={customDragStart}
          />
        )}

        {filterNodes('AI') && (
          <NodeItem
            color='orange'
            icon={
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'>
                <path d='M12 2L2 7l10 5 10-5-10-5z'></path>
                <path d='M2 17l10 5 10-5'></path>
                <path d='M2 12l10 5 10-5'></path>
              </svg>
            }
            label='AI'
            onClick={() => handleButtonClick('ai')}
            nodeType='ai'
            onDragStart={customDragStart}
          />
        )}

        {filterNodes('Browser Extension input') && (
          <NodeItem
            color='teal'
            icon={
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'>
                <path d='M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'></path>
                <polyline points='15 3 21 3 21 9'></polyline>
                <line
                  x1='10'
                  y1='14'
                  x2='21'
                  y2='3'></line>
              </svg>
            }
            label='Browser Extension input'
            onClick={() => handleButtonClick('browser extension input')}
            nodeType='browser extension input'
            onDragStart={customDragStart}
          />
        )}

        {filterNodes('Browser Extension output') && (
          <NodeItem
            color='teal'
            icon={
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'>
                <path d='M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'></path>
                <polyline points='15 3 21 3 21 9'></polyline>
                <line
                  x1='10'
                  y1='14'
                  x2='21'
                  y2='3'></line>
              </svg>
            }
            label='Browser Extension output'
            onClick={() => handleButtonClick('browser extension output')}
            nodeType='browser extension output'
            onDragStart={customDragStart}
          />
        )}

        {filterNodes('Knowledge Retrieval') && (
          <NodeItem
            color='cyan'
            icon={
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'>
                <circle
                  cx='11'
                  cy='11'
                  r='8'></circle>
                <line
                  x1='21'
                  y1='21'
                  x2='16.65'
                  y2='16.65'></line>
              </svg>
            }
            label='Knowledge Retrieval'
            onClick={() => handleButtonClick('knowledge retrieval')}
            nodeType='knowledge retrieval'
            onDragStart={customDragStart}
          />
        )}
        {/* 新的結束節點 */}
        {filterNodes('End') && (
          <NodeItem
            color='green'
            icon={
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'>
                <circle
                  cx='12'
                  cy='12'
                  r='10'></circle>
                <polyline points='16 12 12 8 8 12'></polyline>
                <line
                  x1='12'
                  y1='16'
                  x2='12'
                  y2='8'></line>
              </svg>
            }
            label='End'
            onClick={() => handleButtonClick('end')}
            nodeType='end'
            onDragStart={customDragStart}
          />
        )}
        {/* Webhook 節點 */}
        {filterNodes('Webhook') && (
          <NodeItem
            color='red'
            icon={
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'>
                <path d='M10.59 13.41c.41.39.41 1.03 0 1.42-.39.39-1.03.39-1.42 0a5.003 5.003 0 0 1 0-7.07l3.54-3.54a5.003 5.003 0 0 1 7.07 0 5.003 5.003 0 0 1 0 7.07l-1.49 1.49'></path>
                <path d='M13.41 10.59c-.39-.39-.39-1.03 0-1.42.39-.39 1.03-.39 1.42 0a5.003 5.003 0 0 1 0 7.07l-3.54 3.54a5.003 5.003 0 0 1-7.07 0 5.003 5.003 0 0 1 0-7.07l1.49-1.49'></path>
              </svg>
            }
            label='Webhook'
            onClick={() => handleButtonClick('webhook')}
            nodeType='webhook'
            onDragStart={customDragStart}
          />
        )}
        {/* HTTP 節點 */}
        {filterNodes('http') && (
          <NodeItem
            color='red'
            icon={
              <div className='w-11 h-8 bg-red-100 flex items-center justify-center overflow-hidden'>
                <span className='text-[8px] font-bold text-red-500 text-center'>
                  HTTP
                </span>
              </div>
            }
            label='HTTP'
            onClick={() => handleButtonClick('http')}
            nodeType='http'
            onDragStart={customDragStart}
          />
        )}
        {/* 事件節點 */}
        {filterNodes('timer') && (
          <NodeItem
            color='purple'
            icon={
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'>
                <circle
                  cx='12'
                  cy='12'
                  r='10'
                />
                <polyline points='12 6 12 12 16 14' />
              </svg>
            }
            label='Timer'
            onClick={() => handleButtonClick('timer')}
            nodeType='timer'
            onDragStart={customDragStart}
          />
        )}
        {/* 計時器節點 */}
        {filterNodes('event') && (
          <NodeItem
            color='red'
            icon={
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'>
                <polygon points='13 2 3 14 12 14 11 22 21 10 13 10 13 2' />
              </svg>
            }
            label='Event'
            onClick={() => handleButtonClick('event')}
            nodeType='event'
            onDragStart={customDragStart}
          />
        )}
        {/* Line 節點 */}
        {filterNodes('line') && (
          <NodeItem
            color='green'
            icon={<LineIcon className='w-8 h-8 text-white-500' />}
            label='LINE'
            onClick={() => handleButtonClick('line')}
            nodeType='line'
            onDragStart={customDragStart}
          />
        )}
      </div>
      <VersionDisplay />
    </div>
  );
};

// 節點項目元件 - 增加拖曳功能
const NodeItem = ({ color, icon, label, onClick, nodeType, onDragStart }) => {
  const colorMap = {
    blue: 'bg-blue-100',
    purple: 'bg-purple-100',
    orange: 'bg-orange-100',
    teal: 'bg-teal-100',
    cyan: 'bg-cyan-100',
    green: 'bg-green-100',
    red: 'bg-red-50'
  };

  const iconColorMap = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    teal: 'bg-teal-500',
    cyan: 'bg-cyan-500',
    green: 'bg-green-500',
    red: 'bg-red-50'
  };

  const textColorMap = {
    red: 'text-red-500'
  };

  // 處理拖拽事件
  const handleDragStart = (event) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';

    // 執行自定義拖拽開始處理器（如果有的話）
    if (onDragStart) {
      onDragStart(event, nodeType);
    }
  };

  // Handle drag end to clean up
  const handleDragEnd = (event) => {
    event.currentTarget.classList.remove('dragging');
  };

  return (
    <div
      className={`node-item flex items-center justify-between ${colorMap[color]} p-3 rounded-md cursor-grab`}
      onClick={onClick}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-node-type={nodeType}>
      <div className='flex items-center'>
        <div
          className={`w-6 h-6 rounded-full ${
            iconColorMap[color]
          } flex items-center justify-center ${
            textColorMap[color] || 'text-white'
          } mr-3`}>
          {icon}
        </div>
        <span>{label}</span>
      </div>
      <div className='dots'>
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
          <circle
            cx='12'
            cy='12'
            r='1'></circle>
          <circle
            cx='12'
            cy='5'
            r='1'></circle>
          <circle
            cx='12'
            cy='19'
            r='1'></circle>
        </svg>
      </div>
    </div>
  );
};

export default NodeSidebar;
