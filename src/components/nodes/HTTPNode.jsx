import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const HTTPNode = ({ data, isConnectable }) => {
  return (
    <div className='rounded-lg shadow-md overflow-hidden w-64'>
      {/* Header section with icon and title */}
      <div className='bg-red-50 p-4'>
        <div className='flex items-center'>
          <div className='w-6 h-6 rounded-full bg-red-400 flex items-center justify-center text-white mr-2'>
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
              <path d='M4 4h16v16H4z'></path>
              <path d='M4 9h16'></path>
            </svg>
          </div>
          <span className='font-medium'>HTTP</span>
        </div>
      </div>

      {/* Separator line */}
      <div className='border-t border-gray-200'></div>

      {/* White content area */}
      <div className='bg-white p-4'>
        {/* URL input */}
        <div className='mb-4'>
          <label className='block text-sm text-gray-700 mb-1'>URL</label>
          <textarea
            className='w-full border border-gray-300 rounded p-2 text-sm'
            value={data.url || ''}
            onChange={(e) => data.updateNodeData('url', e.target.value)}
            placeholder='Enter URL'
          />
        </div>

        {/* HTTP Method selection */}
        <div>
          <label className='block text-sm text-gray-700 mb-1'>Method</label>
          <select
            className='w-full border border-gray-300 rounded p-2 text-sm bg-white'
            value={data.method || 'GET'}
            onChange={(e) => data.updateNodeData('method', e.target.value)}>
            <option value='GET'>GET</option>
            <option value='POST'>POST</option>
            <option value='PUT'>PUT</option>
            <option value='DELETE'>DELETE</option>
          </select>
        </div>
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

      {/* Output handle - right side */}
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

export default memo(HTTPNode);
