import React, { memo, useReducer } from 'react';
import { Handle, Position } from 'reactflow';
import InputIcon from '../icons/InputIcon'; // Import the new InputIcon component

const CustomInputNode = ({ data, isConnectable }) => {
  // 安全訪問 fields，提供默認空陣列
  const fields = data.fields || [];

  // 處理按鈕點擊添加新字段，添加防護措施
  const handleAddField = () => {
    if (typeof data.addField === 'function') {
      data.addField();
    } else {
      console.warn('addField function is not defined');
      // 提供一個臨時解決方案，直接添加一個字段到當前節點
      // 這裡只是臨時措施，不會保存到狀態
      const newField = {
        inputName: 'New Input',
        defaultValue: 'Default value'
      };
      if (Array.isArray(data.fields)) {
        data.fields.push(newField);
      } else {
        data.fields = [newField];
      }
      // 強制重新渲染
      forceUpdate();
    }
  };

  // 使用 useReducer 來強制重新渲染
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  return (
    <div className='shadow-md w-64 relative'>
      {/* Header section with icon and title */}
      <div className='bg-blue-100 rounded-t-lg p-4 overflow-hidden'>
        <div className='flex items-center'>
          <div className='w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white mr-2'>
            <InputIcon /> {/* Use the InputIcon component */}
          </div>
          <span className='font-medium'>Input</span>
        </div>
      </div>

      {/* Separator line */}
      <div className='border-t border-gray-200'></div>

      {/* White content area */}
      <div className='rounded-lg shadow-md rounded-lg w-64 relative'>
        <div className='bg-white rounded-lg p-4'>
          {/* Display a message if no fields */}
          {fields.length === 0 && (
            <div className='text-gray-500 text-sm mb-4'>
              Click the + button below to add an input field
            </div>
          )}

          {/* Multiple input fields */}
          {fields.map((field, idx) => (
            <div
              key={idx}
              className='mb-4 last:mb-2 relative'>
              <div className='mb-2'>
                <label className='block text-sm text-gray-700 mb-1'>
                  input_name
                </label>
                <input
                  type='text'
                  className='w-full border border-gray-300 rounded p-2 text-sm'
                  placeholder='AI node prompt'
                  value={field.inputName || ''}
                  onChange={(e) => {
                    if (typeof data.updateFieldInputName === 'function') {
                      data.updateFieldInputName(idx, e.target.value);
                    }
                  }}
                />
              </div>

              <div className='mb-2'>
                <label className='block text-sm text-gray-700 mb-1'>
                  default_value
                </label>
                <input
                  type='text'
                  className='w-full border border-gray-300 rounded p-2 text-sm'
                  placeholder='Summary the input text'
                  value={field.defaultValue || ''}
                  onChange={(e) => {
                    if (typeof data.updateFieldDefaultValue === 'function') {
                      data.updateFieldDefaultValue(idx, e.target.value);
                    }
                  }}
                />
              </div>

              {/* Simple handle per field positioned at midpoint */}
              <div
                style={{
                  position: 'absolute',
                  right: '-18px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '10px',
                  height: '10px',
                  background: 'transparent'
                }}>
                <Handle
                  type='source'
                  position={Position.Right}
                  id={`output-${idx}`}
                  style={{
                    width: '10px',
                    height: '10px',
                    background: '#000',
                    border: '2px solid white',
                    zIndex: 5
                  }}
                  isConnectable={isConnectable}
                />
              </div>

              {/* Separator if not the last item */}
              {idx < fields.length - 1 && (
                <div className='border-t border-gray-200 my-3'></div>
              )}
            </div>
          ))}

          {/* Add button - teal color - now adds items to the node */}
          <button
            className='w-full bg-teal-500 hover:bg-teal-600 text-white rounded-md p-2 flex justify-center items-center mt-4'
            onClick={handleAddField}>
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
        </div>
      </div>
    </div>
  );
};

export default memo(CustomInputNode);
