import React, { useState, useEffect } from 'react';
import VersionDisplay from '../../components/VersionDisplay';
import IconBase from '../icons/IconBase';
import dragIcon from '../../assets/icon-drag-handle-line.svg';

const NodeSidebar = ({
  handleButtonClick,
  onDragStart: customDragStart,
  nodes = [],
  nodeList = [], // 從後端取得的節點清單
  isLoading = false, // 載入狀態
  onRetryLoad = null, // 重新載入的回調函數
  isLocked = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // 根據搜尋條件篩選節點
  const filterNodes = (displayName) => {
    if (!searchTerm) return true;
    return displayName.toLowerCase().includes(searchTerm.toLowerCase());
  };

  // 檢查是否已存在特定類型的節點（針對只能有一個的節點類型）
  const checkNodeTypeRestriction = (operator) => {
    // 定義只能有一個的節點類型列表
    const singletonNodeTypes = [
      'line_webhook_input',
      'browser_extension_input',
      'browser_extension_output',
      'webhook_input',
      'webhook_output',
      'schedule_trigger'
    ];

    if (singletonNodeTypes.includes(operator)) {
      return nodes.some((node) => {
        // 檢查多種可能的屬性組合
        const nodeType =
          node.type ||
          node.data?.type ||
          node.data?.nodeType ||
          node.data?.operator ||
          node.nodeType ||
          node.operator;

        // 檢查節點的標籤或名稱
        const nodeLabel = node.data?.label?.toLowerCase() || '';
        const nodeName = node.data?.name?.toLowerCase() || '';

        // 將 operator 轉換為不同格式以便比對
        const operatorCamelCase = operator.replace(/_([a-z])/g, (g) =>
          g[1].toUpperCase()
        );
        const operatorWords = operator.split('_').join(' ');

        // 通用檢查邏輯
        const isMatchingNode =
          nodeType === operator ||
          nodeType === operatorCamelCase ||
          nodeLabel.includes(operatorWords) ||
          nodeName.includes(operatorWords) ||
          node.id?.includes(operator);

        return isMatchingNode;
      });
    }
    return false;
  };

  // 處理節點點擊，包含節點限制檢查
  const handleNodeClick = (nodeInfo) => {
    if (isLocked) {
      // 鎖定狀態下顯示提示
      if (typeof window !== 'undefined' && window.notify) {
        window.notify({
          message: '工作流已鎖定，無法添加節點',
          type: 'warning',
          duration: 3000
        });
      }
      return;
    }

    // 檢查節點類型限制
    const hasRestriction = checkNodeTypeRestriction(nodeInfo.operator);
    if (hasRestriction) {
      // 顯示警告提示
      if (typeof window !== 'undefined' && window.notify) {
        window.notify({
          message: `每個 Flow 只能有一個 ${nodeInfo.display_name} 節點`,
          type: 'warning',
          duration: 4000
        });
      }
      return; // 阻止添加
    }

    // 呼叫處理函數，使用 operator 作為節點類型
    handleButtonClick(nodeInfo.operator);
  };

  // 根據 operator 取得對應的圖示類型
  const getIconType = (operator) => {
    const iconMap = {
      basic_input: 'input',
      ask_ai: 'ai',
      browser_extension_input: 'browser',
      browser_extension_output: 'browser',
      knowledge_retrieval: 'knowledge',
      line_webhook_input: 'line',
      line_send_message: 'line',
      extract_data: 'ai',
      aim_ml: 'aim',
      http_request: 'http',
      schedule_trigger: 'schedule',
      webhook_input: 'webhook_input',
      webhook_output: 'webhook_output',
      combine_text: 'combine_text',
      router_switch: 'router_switch',
      speech_to_text: 'speech_to_text'
    };
    return iconMap[operator] || 'input'; // 預設使用 input 圖示
  };

  // 根據 category 取得節點顏色
  const getNodeColor = (category, operator) => {
    // LINE 節點特殊處理
    if (operator === 'line_webhook_input') {
      return 'green';
    }

    // 根據分類設定顏色
    const colorMap = {
      flow_starter: 'blue',
      flow_end: 'red',
      processor: 'gray',
      emitter: 'yellow'
    };
    return colorMap[category] || 'gray';
  };

  // 載入中的骨架畫面
  if (isLoading) {
    return (
      <div
        className={`w-64 bg-white p-4 shadow-md h-full overflow-y-auto ${
          isLocked ? 'bg-gray-50' : ''
        }`}>
        {/* 搜尋框骨架 */}
        <div className='relative mb-3'>
          <div className='w-full h-10 bg-gray-200 rounded-md animate-pulse'></div>
        </div>

        {/* 節點項目骨架 */}
        <div className='space-y-3'>
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              className='border flex items-center justify-between p-2 rounded-lg bg-gray-100 animate-pulse'>
              <div className='flex items-center'>
                <div className='w-8 h-8 mr-3 bg-gray-300 rounded'></div>
                <div className='w-20 h-4 bg-gray-300 rounded'></div>
              </div>
              <div className='w-4 h-4 bg-gray-300 rounded'></div>
            </div>
          ))}
        </div>
        <VersionDisplay />
      </div>
    );
  }

  // 錯誤狀態
  if (!nodeList || nodeList.length === 0) {
    return (
      <div
        className={`w-64 bg-white p-4 shadow-md h-full overflow-y-auto ${
          isLocked ? 'bg-gray-50' : ''
        }`}>
        <div className='flex flex-col items-center justify-center h-64 text-gray-500'>
          <svg
            className='w-12 h-12 mb-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z'
            />
          </svg>
          <p className='text-sm text-center mb-4'>無法載入節點清單</p>
          {onRetryLoad && (
            <button
              onClick={onRetryLoad}
              className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm'>
              重新載入
            </button>
          )}
        </div>
        <VersionDisplay />
      </div>
    );
  }

  return (
    <div
      className={`w-64 bg-white p-4 shadow-md h-full overflow-y-auto ${
        isLocked ? 'bg-gray-50' : ''
      }`}>
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

      {/* 動態節點選項 */}
      <div className='space-y-3'>
        {nodeList
          .filter((nodeInfo) => filterNodes(nodeInfo.display_name))
          .map((nodeInfo) => {
            const hasRestriction = checkNodeTypeRestriction(nodeInfo.operator);
            const iconType = getIconType(nodeInfo.operator);
            const nodeColor = getNodeColor(
              nodeInfo.category,
              nodeInfo.operator
            );

            return (
              <NodeItem
                key={nodeInfo.id}
                color={nodeColor}
                icon={
                  <div>
                    <IconBase type={iconType} />
                  </div>
                }
                label={nodeInfo.display_name}
                onClick={() => handleNodeClick(nodeInfo)}
                nodeType={nodeInfo.operator}
                onDragStart={customDragStart}
                disabled={hasRestriction || isLocked}
                disabledReason={
                  isLocked
                    ? '工作流已鎖定'
                    : hasRestriction
                    ? `每個 Flow 只能有一個 ${nodeInfo.display_name} 節點`
                    : null
                }
              />
            );
          })}
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
  const handleDragStart = (event) => {
    if (disabled) {
      event.preventDefault();
      return;
    }

    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';

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
            disabled ? 'text-gray-400' : ''
          }`}>
          {label}
        </span>
      </div>
      <div
        className={`ml-2 ${
          disabled ? 'text-gray-300' : 'text-gray-400 hover:text-gray-600'
        }`}>
        <div
          className='flex items-center justify-center'
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
