import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import TimerIcon from '../icons/TimerIcon'; // Import TimerIcon

const TimerNode = ({ data, isConnectable }) => {
  const [hours, setHours] = useState(data.hours || 0);
  const [minutes, setMinutes] = useState(data.minutes || 0);
  const [seconds, setSeconds] = useState(data.seconds || 0);

  // 驗證並處理輸入的時間值
  const handleTimeChange = (type, value) => {
    // 只允許數字輸入
    if (value !== '' && !/^\d+$/.test(value)) return;

    // 空值處理為0
    let numValue = value === '' ? 0 : parseInt(value, 10);

    // 範圍限制
    switch (type) {
      case 'hours':
        numValue = Math.max(0, Math.min(99, numValue));
        setHours(numValue);
        break;
      case 'minutes':
        numValue = Math.max(0, Math.min(59, numValue));
        setMinutes(numValue);
        break;
      case 'seconds':
        numValue = Math.max(0, Math.min(59, numValue));
        setSeconds(numValue);
        break;
      default:
        return;
    }

    // 更新節點數據
    if (data.updateNodeData) {
      data.updateNodeData(type, numValue);
    }
  };

  // 失去焦點時進行格式化
  const handleBlur = (type, value) => {
    // 確保顯示為兩位數字
    const formattedValue = value.toString().padStart(2, '0');

    switch (type) {
      case 'hours':
        setHours(parseInt(formattedValue, 10));
        break;
      case 'minutes':
        setMinutes(parseInt(formattedValue, 10));
        break;
      case 'seconds':
        setSeconds(parseInt(formattedValue, 10));
        break;
      default:
        return;
    }
  };

  // 處理按鈕點擊增加/減少
  const incrementTime = (type) => {
    switch (type) {
      case 'hours':
        handleTimeChange('hours', hours + 1);
        break;
      case 'minutes':
        handleTimeChange('minutes', minutes + 1);
        break;
      case 'seconds':
        handleTimeChange('seconds', seconds + 1);
        break;
      default:
        return;
    }
  };

  const decrementTime = (type) => {
    switch (type) {
      case 'hours':
        handleTimeChange('hours', hours - 1);
        break;
      case 'minutes':
        handleTimeChange('minutes', minutes - 1);
        break;
      case 'seconds':
        handleTimeChange('seconds', seconds - 1);
        break;
      default:
        return;
    }
  };

  return (
    <div className='rounded-lg shadow-md overflow-hidden w-64'>
      {/* Header section with icon and title */}
      <div className='bg-purple-100 p-4'>
        <div className='flex items-center'>
          <div className='w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white mr-2'>
            <TimerIcon /> {/* Use TimerIcon component */}
          </div>
          <span className='font-medium'>Timer</span>
        </div>
      </div>

      {/* White content area */}
      <div className='bg-white p-4'>
        <div className='mb-3'>
          <label className='block text-sm text-gray-700 mb-2'>
            Set time interval
          </label>
          <div className='flex items-center space-x-2'>
            {/* Hours input */}
            <div className='w-20'>
              <label className='block text-xs text-gray-500 mb-1 text-center'>
                Hours
              </label>
              <div className='flex flex-col'>
                <button
                  className='bg-gray-200 rounded-t text-gray-700 text-sm h-6'
                  onClick={() => incrementTime('hours')}
                  // 釋放鼠標按鈕時主動模糊焦點，防止持續觸發
                  onMouseUp={() => document.activeElement.blur()}>
                  +
                </button>
                <input
                  type='text'
                  inputMode='numeric'
                  pattern='[0-9]*'
                  className='w-full border border-gray-300 rounded-none p-2 text-sm text-center'
                  value={hours}
                  onChange={(e) => handleTimeChange('hours', e.target.value)}
                  onBlur={() => handleBlur('hours', hours)}
                  maxLength={2}
                />
                <button
                  className='bg-gray-200 rounded-b text-gray-700 text-sm h-6'
                  onClick={() => decrementTime('hours')}
                  onMouseUp={() => document.activeElement.blur()}>
                  -
                </button>
              </div>
            </div>

            <span className='text-lg'>:</span>

            {/* Minutes input */}
            <div className='w-20'>
              <label className='block text-xs text-gray-500 mb-1 text-center'>
                Minutes
              </label>
              <div className='flex flex-col'>
                <button
                  className='bg-gray-200 rounded-t text-gray-700 text-sm h-6'
                  onClick={() => incrementTime('minutes')}
                  onMouseUp={() => document.activeElement.blur()}>
                  +
                </button>
                <input
                  type='text'
                  inputMode='numeric'
                  pattern='[0-9]*'
                  className='w-full border border-gray-300 rounded-none p-2 text-sm text-center'
                  value={minutes}
                  onChange={(e) => handleTimeChange('minutes', e.target.value)}
                  onBlur={() => handleBlur('minutes', minutes)}
                  maxLength={2}
                />
                <button
                  className='bg-gray-200 rounded-b text-gray-700 text-sm h-6'
                  onClick={() => decrementTime('minutes')}
                  onMouseUp={() => document.activeElement.blur()}>
                  -
                </button>
              </div>
            </div>

            <span className='text-lg'>:</span>

            {/* Seconds input */}
            <div className='w-20'>
              <label className='block text-xs text-gray-500 mb-1 text-center'>
                Seconds
              </label>
              <div className='flex flex-col'>
                <button
                  className='bg-gray-200 rounded-t text-gray-700 text-sm h-6'
                  onClick={() => incrementTime('seconds')}
                  onMouseUp={() => document.activeElement.blur()}>
                  +
                </button>
                <input
                  type='text'
                  inputMode='numeric'
                  pattern='[0-9]*'
                  className='w-full border border-gray-300 rounded-none p-2 text-sm text-center'
                  value={seconds}
                  onChange={(e) => handleTimeChange('seconds', e.target.value)}
                  onBlur={() => handleBlur('seconds', seconds)}
                  maxLength={2}
                />
                <button
                  className='bg-gray-200 rounded-b text-gray-700 text-sm h-6'
                  onClick={() => decrementTime('seconds')}
                  onMouseUp={() => document.activeElement.blur()}>
                  -
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Input handle */}
      <Handle
        type='target'
        position={Position.Left}
        id='input'
        style={{
          background: '#555',
          width: '8px',
          height: '8px',
          left: '-4px'
        }}
        isConnectable={isConnectable}
      />

      {/* Output handle */}
      <Handle
        type='source'
        position={Position.Right}
        id='output'
        style={{
          background: '#555',
          width: '8px',
          height: '8px',
          right: '-4px'
        }}
        isConnectable={isConnectable}
      />
    </div>
  );
};

export default memo(TimerNode);
