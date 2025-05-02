import React, { useState } from 'react';
import VersionDisplay from '../../components/VersionDisplay';
import IconBase from '../icons/IconBase';
import dragIcon from '../../assets/icon-drag-handle-line.svg';
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
          placeholder='Search nodes...'
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
            icon={
              <div>
                <IconBase type='input' />
              </div>
            }
            label='Input'
            onClick={() => handleButtonClick('input')}
            nodeType='input'
            onDragStart={customDragStart}
          />
        )}

        {/* {filterNodes('If/Else') && (
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
        )} */}

        {filterNodes('AI') && (
          <NodeItem
            icon={
              <div>
                <IconBase type='ai' />
              </div>
            }
            label='AI'
            onClick={() => handleButtonClick('ai')}
            nodeType='ai'
            onDragStart={customDragStart}
          />
        )}

        {filterNodes('Browser Extension input') && (
          <NodeItem
            icon={
              <div>
                <IconBase type='browser' />
              </div>
            }
            label='Browser Extension input'
            onClick={() => handleButtonClick('browser extension input')}
            nodeType='browser extension input'
            onDragStart={customDragStart}
          />
        )}

        {filterNodes('Browser Extension output') && (
          <NodeItem
            icon={
              <div>
                <IconBase type='browser' />
              </div>
            }
            label='Browser Extension output'
            onClick={() => handleButtonClick('browser extension output')}
            nodeType='browser extension output'
            onDragStart={customDragStart}
          />
        )}

        {filterNodes('Knowledge Retrieval') && (
          <NodeItem
            icon={
              <div>
                <IconBase type='knowledge' />
              </div>
            }
            label='Knowledge Retrieval'
            onClick={() => handleButtonClick('knowledge retrieval')}
            nodeType='knowledge retrieval'
            onDragStart={customDragStart}
          />
        )}
        {/* 新的結束節點 */}
        {/* {filterNodes('End') && (
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
        )} */}
        {/* Webhook 節點 */}
        {/* {filterNodes('Webhook') && (
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
        )} */}
        {/* HTTP 節點 */}
        {/* {filterNodes('http') && (
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
        )} */}
        {/* 事件節點 */}
        {/* {filterNodes('timer') && (
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
        )} */}
        {/* 計時器節點 */}
        {/* {filterNodes('event') && (
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
        )} */}
        {/* Line 節點 */}
        {/* {filterNodes('line') && (
          <NodeItem
            color='green'
            icon={<LineIcon className='w-8 h-8 text-white-500' />}
            label='LINE'
            onClick={() => handleButtonClick('line')}
            nodeType='line'
            onDragStart={customDragStart}
          />
        )} */}
      </div>
      <VersionDisplay />
    </div>
  );
};

const NodeItem = ({ icon, label, onClick, nodeType, onDragStart }) => {
  // 处理拖拽事件
  const handleDragStart = (event) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';

    // 执行自定义拖拽开始处理器（如果有的话）
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
      className='node-item border flex items-center justify-between p-2 rounded-lg cursor-grab hover:bg-gray-50 transition-colors'
      onClick={onClick}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-node-type={nodeType}>
      <div className='flex items-center'>
        <div className='w-8 h-8 mr-3 flex-shrink-0 flex items-center justify-center'>
          {icon}
        </div>
        <span className='text-sm text-gray-700 leading-none font-bold'>
          {label}
        </span>
      </div>
      <div className='text-gray-400 hover:text-gray-600 ml-2'>
        <div
          className={'flex items-center justify-center'}
          style={{
            width: '16px',
            height: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
          <img
            src={dragIcon}
            width={16}
            height={16}
            className='max-w-full max-h-full object-contain'
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default NodeSidebar;
