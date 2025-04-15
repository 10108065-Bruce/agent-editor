import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const EndNode = ({ data, isConnectable }) => {
  const handleFieldChange = (field, value) => {
    if (data.updateNodeData) {
      data.updateNodeData(field, value);
    }
  };

  return (
    <div className='rounded-lg shadow-md overflow-hidden w-64'>
      {/* Header section with icon and "End" text */}
      <div className='bg-green-100 p-4'>
        <div className='flex items-center'>
          <div className='w-6 h-6 flex items-center justify-center mr-2'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='text-green-600'>
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
          </div>
          <span className='font-medium'>End</span>
        </div>
      </div>

      {/* Separator line */}
      <div className='border-t border-gray-200'></div>

      {/* White content area */}
      <div className='bg-white p-4'>
        <div className='mb-1'>
          <label className='block text-sm text-gray-700 mb-1'>
            Output Text
          </label>
          <input
            type='text'
            className='w-full border border-gray-300 rounded p-2 text-sm'
            placeholder='Output message'
            value={data.outputText || ''}
            onChange={(e) => handleFieldChange('outputText', e.target.value)}
          />
        </div>
      </div>

      {/* Input handle - only shown on all variants */}
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
    </div>
  );
};

export default memo(EndNode);
