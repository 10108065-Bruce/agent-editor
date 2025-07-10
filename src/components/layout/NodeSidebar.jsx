import React, { useState } from 'react';
import VersionDisplay from '../../components/VersionDisplay';
import IconBase from '../icons/IconBase';
import dragIcon from '../../assets/icon-drag-handle-line.svg';

const NodeSidebar = ({
  handleButtonClick,
  onDragStart: customDragStart,
  nodes = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // 如果實作搜尋，篩選節點
  const filterNodes = (label) => {
    if (!searchTerm) return true;
    return label.toLowerCase().includes(searchTerm.toLowerCase());
  };

  // 檢查是否已存在 line_webhook_input 節點
  const hasLineNode = nodes.some((node) => node.type === 'line_webhook_input');

  // 處理節點點擊，包含 line_webhook_input 節點限制檢查
  const handleNodeClick = (nodeType) => {
    if (nodeType === 'line_webhook_input' && hasLineNode) {
      // 顯示警告提示
      if (typeof window !== 'undefined' && window.notify) {
        window.notify({
          message: '每個 Flow 只能有一個 Line Webhook 節點',
          type: 'warning',
          duration: 4000
        });
      }
      return; // 阻止添加
    }

    handleButtonClick(nodeType);
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
            onClick={() => handleNodeClick('input')}
            nodeType='input'
            onDragStart={customDragStart}
          />
        )}

        {filterNodes('AI') && (
          <NodeItem
            icon={
              <div>
                <IconBase type='ai' />
              </div>
            }
            label='AI'
            onClick={() => handleNodeClick('ai')}
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
            onClick={() => handleNodeClick('browser extension input')}
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
            onClick={() => handleNodeClick('browser extension output')}
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
            onClick={() => handleNodeClick('knowledge retrieval')}
            nodeType='knowledge retrieval'
            onDragStart={customDragStart}
          />
        )}

        {/* Line 節點 - 添加禁用狀態 */}
        {filterNodes('line') && (
          <NodeItem
            color='green'
            icon={
              <div>
                <IconBase type='line' />
              </div>
            }
            label='LINE'
            onClick={() => handleNodeClick('line_webhook_input')}
            nodeType='line_webhook_input'
            onDragStart={customDragStart}
            disabled={hasLineNode} // 新增：禁用狀態
            disabledReason={
              hasLineNode ? '每個 Flow 只能有一個 Line Webhook 節點' : null
            } // 新增：禁用原因
          />
        )}
        {/* Line Message 節點 */}
        {filterNodes('send message') && (
          <NodeItem
            icon={
              <div>
                <IconBase type='line' />
              </div>
            }
            label='Send Message'
            onClick={() => handleNodeClick('line_send_message')}
            nodeType='line_send_message'
            onDragStart={customDragStart}
          />
        )}
        {/* extract node */}
        {filterNodes('Extract Data Node') && (
          <NodeItem
            icon={
              <div>
                <IconBase type='ai' />
              </div>
            }
            label='Extract Data'
            onClick={() => handleNodeClick('extract_data')}
            nodeType='extract_data'
            onDragStart={customDragStart}
          />
        )}
        {/* QOCA aim node */}
        {filterNodes('QOCA aim Node') && (
          <NodeItem
            icon={
              <div>
                <IconBase type='aim' />
              </div>
            }
            label='QOCA aim'
            onClick={() => handleNodeClick('aim_ml')}
            nodeType='aim_ml'
            onDragStart={customDragStart}
          />
        )}
        {/* http node */}
        {filterNodes('HTTP') && (
          <NodeItem
            icon={
              <div>
                <IconBase type='http' />
              </div>
            }
            label='HTTP'
            onClick={() => handleNodeClick('http_request')}
            nodeType='http_request'
            onDragStart={customDragStart}
          />
        )}
      </div>
      <VersionDisplay />
    </div>
  );
};

const NodeItem = ({
  icon,
  label,
  onClick,
  nodeType,
  onDragStart,
  disabled = false,
  disabledReason = null
}) => {
  // 处理拖拽事件
  const handleDragStart = (event) => {
    // 如果節點被禁用，阻止拖拽
    if (disabled) {
      event.preventDefault();
      return;
    }

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

  // 處理點擊事件
  const handleClick = () => {
    if (disabled) {
      // 如果節點被禁用，顯示禁用原因
      if (typeof window !== 'undefined' && window.notify) {
        window.notify({
          message: disabledReason || '此節點類型已被禁用',
          type: 'warning',
          duration: 3000
        });
      }
      return;
    }

    onClick();
  };

  return (
    <div
      className={`node-item border flex items-center justify-between p-2 rounded-lg transition-colors ${
        disabled
          ? 'opacity-50 cursor-not-allowed bg-gray-100'
          : 'cursor-grab hover:bg-gray-50'
      }`}
      onClick={handleClick}
      draggable={!disabled} // 禁用時不可拖拽
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-node-type={nodeType}
      title={disabled ? disabledReason : label} // 顯示工具提示
    >
      <div className='flex items-center'>
        <div className='w-8 h-8 mr-3 flex-shrink-0 flex items-center justify-center'>
          {icon}
        </div>
        <span
          className={`text-sm leading-none font-bold ${
            disabled ? 'text-gray-400' : 'text-gray-700'
          }`}>
          {label}
        </span>
        {/* 顯示禁用圖標 */}
        {/* {disabled && <span className='ml-2 text-red-500 text-xs'>🚫</span>} */}
      </div>
      <div
        className={`ml-2 ${
          disabled ? 'text-gray-300' : 'text-gray-400 hover:text-gray-600'
        }`}>
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
              objectFit: 'contain',
              opacity: disabled ? 0.3 : 1 // 禁用時降低透明度
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default NodeSidebar;
