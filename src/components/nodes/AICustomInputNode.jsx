import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const AICustomInputNode = ({ data, isConnectable }) => {
  return (
    <div className='rounded-lg shadow-md overflow-hidden w-64'>
      {/* Header section with icon and title */}
      <div className='bg-orange-50 p-4'>
        <div className='flex items-center'>
          <div className='w-6 h-6 rounded-full bg-orange-400 flex items-center justify-center text-white mr-2'>
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
          </div>
          <span className='font-medium'>AI</span>
        </div>
      </div>

      {/* Separator line */}
      <div className='border-t border-gray-200'></div>

      {/* White content area */}
      <div className='bg-white p-4'>
        {/* Model selection */}
        <div className='mb-4'>
          <label className='block text-sm text-gray-700 mb-1'>model</label>
          <select
            className='w-full border border-gray-300 rounded p-2 text-sm bg-white'
            value={data.model || 'O3-mini'}
            onChange={(e) => data.updateNodeData('model', e.target.value)}>
            <option value='O3-mini'>O3-mini</option>
            <option value='O3-plus'>O3-plus</option>
            <option value='O3-mega'>O3-mega</option>
            <option value='O3-ultra'>O3-ultra</option>
          </select>
        </div>

        {/* Prompt option with radio button */}
        <div className='flex items-center mb-3'>
          <div className='mr-2 relative w-4 h-4'>
            <input
              type='radio'
              id='prompt-radio'
              name='ai-option'
              className='absolute opacity-0 w-4 h-4 cursor-pointer'
              checked={data.selectedOption === 'prompt'}
              onChange={() => data.updateNodeData('selectedOption', 'prompt')}
            />
            <label
              htmlFor='prompt-radio'
              className='block w-4 h-4 rounded-full border border-gray-300 bg-white cursor-pointer'>
              {data.selectedOption === 'prompt' && (
                <span className='absolute inset-0 flex items-center justify-center'>
                  <span className='w-2 h-2 rounded-full bg-gray-600'></span>
                </span>
              )}
            </label>
          </div>
          <label
            htmlFor='prompt-radio'
            className='text-sm text-gray-700 cursor-pointer'>
            prompt
          </label>
        </div>

        {/* Context option with radio button */}
        <div className='flex items-center'>
          <div className='mr-2 relative w-4 h-4'>
            <input
              type='radio'
              id='context-radio'
              name='ai-option'
              className='absolute opacity-0 w-4 h-4 cursor-pointer'
              checked={data.selectedOption === 'context'}
              onChange={() => data.updateNodeData('selectedOption', 'context')}
            />
            <label
              htmlFor='context-radio'
              className='block w-4 h-4 rounded-full border border-gray-300 bg-white cursor-pointer'>
              {data.selectedOption === 'context' && (
                <span className='absolute inset-0 flex items-center justify-center'>
                  <span className='w-2 h-2 rounded-full bg-gray-600'></span>
                </span>
              )}
            </label>
          </div>
          <label
            htmlFor='context-radio'
            className='text-sm text-gray-700 cursor-pointer'>
            context
          </label>
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

export default memo(AICustomInputNode);
