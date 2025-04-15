import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import LineIcon from '../icons/LineIcon'; // Assuming you have a LineIcon component
const LineNode = ({ data, isConnectable }) => {
  const [mode, setMode] = useState(data.mode || 'reply'); // 'reply' or 'push'

  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (data.updateNodeData) {
      data.updateNodeData('mode', newMode);
    }
  };

  const handleTextChange = (value) => {
    if (data.updateNodeData) {
      data.updateNodeData('text', value);
    }
  };

  return (
    <div className='rounded-lg shadow-md overflow-hidden w-64'>
      {/* Header section with icon and title */}
      <div className='bg-gray-100 p-4'>
        <div className='flex items-center'>
          <div className='w-6 h-6 bg-[#06C755] rounded-full flex items-center justify-center mr-2'>
            <LineIcon className='w-8 h-8 text-white' />
          </div>
          <span className='font-medium'>Line</span>
        </div>
      </div>

      {/* White content area */}
      <div className='bg-white p-4'>
        {/* Mode selection - Reply or Push */}
        <div className='mb-3'>
          <div className='flex'>
            <button
              className={`flex-1 py-2 text-center ${
                mode === 'reply'
                  ? 'bg-green-50 text-green-600 font-medium border-b-2 border-green-600'
                  : 'text-gray-500 border-b border-gray-300'
              }`}
              onClick={() => handleModeChange('reply')}>
              Reply
            </button>
            <button
              className={`flex-1 py-2 text-center ${
                mode === 'push'
                  ? 'bg-green-50 text-green-600 font-medium border-b-2 border-green-600'
                  : 'text-gray-500 border-b border-gray-300'
              }`}
              onClick={() => handleModeChange('push')}>
              Push
            </button>
          </div>
        </div>

        {/* Text field */}
        <div className='mb-2'>
          <label className='block text-sm text-gray-700 mb-1'>
            {mode === 'reply' ? 'Reply Text' : 'Push Text'}
          </label>
          <input
            type='text'
            className='w-full border border-gray-300 rounded p-2 text-sm'
            placeholder={
              mode === 'reply' ? 'Reply message text' : 'Push message text'
            }
            value={data.text || ''}
            onChange={(e) => handleTextChange(e.target.value)}
          />
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

export default memo(LineNode);
