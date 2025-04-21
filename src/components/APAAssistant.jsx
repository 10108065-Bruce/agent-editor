import React, { useState } from 'react';

// This version uses a fully controlled pattern with no internal state for the title
const APAAssistant = ({ title, onTitleChange }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
    }
  };

  return (
    <div className='fixed top-4 left-1/2 transform -translate-x-1/2 z-50'>
      {/* Container with double shadow effect */}
      <div className='rounded-full shadow-[0_3px_10px_rgb(0,0,0,0.1),0_6px_20px_rgb(0,0,0,0.05)]'>
        <div className='bg-white border border-gray-200 rounded-full px-4 py-2 flex items-center w-64 md:w-80'>
          <div className='mr-2 text-gray-700 flex-shrink-0'>
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
              <rect
                x='3'
                y='3'
                width='18'
                height='18'
                rx='2'
                ry='2'></rect>
              <line
                x1='3'
                y1='9'
                x2='21'
                y2='9'></line>
              <line
                x1='9'
                y1='21'
                x2='9'
                y2='9'></line>
            </svg>
          </div>
          <div className='flex-1 relative min-w-0'>
            {isEditing ? (
              <input
                type='text'
                className='w-full outline-none text-gray-800 bg-transparent'
                value={title || 'APA 診間小幫手'}
                onChange={(e) => onTitleChange(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            ) : (
              <div
                className='w-full text-gray-800 cursor-pointer hover:text-gray-600 truncate'
                onClick={handleEditClick}>
                {title || 'APA 診間小幫手'}
              </div>
            )}
          </div>
          <div className='ml-2 text-gray-500 flex-shrink-0'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='18'
              height='18'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'>
              <path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'></path>
              <path d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APAAssistant;
