import React from 'react';
export default function UploadIcon({ className = 'w-6 h-6 text-gray-800' }) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      className={className}
      xmlns='http://www.w3.org/2000/svg'>
      <g
        id='SVGRepo_bgCarrier'
        stroke-width='0'></g>
      <g
        id='SVGRepo_tracerCarrier'
        stroke-linecap='round'
        stroke-linejoin='round'></g>
      <g id='SVGRepo_iconCarrier'>
        {' '}
        <path
          d='M15 21H9C6.17157 21 4.75736 21 3.87868 20.1213C3 19.2426 3 17.8284 3 15M21 15C21 17.8284 21 19.2426 20.1213 20.1213C19.8215 20.4211 19.4594 20.6186 19 20.7487'
          stroke='#1C274C'
          stroke-width='1.5'
          stroke-linecap='round'
          stroke-linejoin='round'></path>{' '}
        <path
          d='M12 16V3M12 3L16 7.375M12 3L8 7.375'
          stroke='#1C274C'
          stroke-width='1.5'
          stroke-linecap='round'
          stroke-linejoin='round'></path>{' '}
      </g>
    </svg>
  );
}
