import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import IconBase from '../icons/IconBase';

const BrowserExtensionOutputNode = ({ data, isConnectable }) => {
  return (
    <div className='rounded-lg shadow-md overflow-hidden w-64'>
      {/* Header section with icon and title */}
      <div className='bg-gray-100 p-4'>
        <div className='flex items-center'>
          <div className='w-6 h-6 rounded-md bg-teal-500 flex items-center justify-center text-white mr-2'>
            <IconBase type='browser' />
          </div>
          <span className='font-medium'>Browser Extension output</span>
        </div>
      </div>

      {/* Separator line */}
      <div className='border-t border-gray-200'></div>

      {/* White content area */}
      <div className='bg-white p-4'>
        {/* Add button - teal color */}
        <button
          className='w-full bg-teal-500 hover:bg-teal-600 text-white rounded-md p-2 flex justify-center items-center mb-3'
          onClick={() => data.onAddOutput && data.onAddOutput()}>
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

        {/* Output Text label */}
        <div className='text-sm text-gray-700'>Output Text</div>
      </div>

      {/* Input handle - left side */}
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

export default memo(BrowserExtensionOutputNode);
