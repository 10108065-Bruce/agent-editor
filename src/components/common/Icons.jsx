import React from 'react';

export const LoadingSpinner = ({ size = 16 }) => (
  <svg
    className='animate-spin'
    xmlns='http://www.w3.org/2000/svg'
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'>
    <path d='M21 12a9 9 0 1 1-6.219-8.56'></path>
  </svg>
);

export const CheckIcon = ({ size = 16 }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'>
    <path d='M20 6L9 17l-5-5'></path>
  </svg>
);

export const ErrorIcon = ({ size = 16 }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'>
    <circle
      cx='12'
      cy='12'
      r='10'></circle>
    <line
      x1='12'
      y1='8'
      x2='12'
      y2='12'></line>
    <line
      x1='12'
      y1='16'
      x2='12.01'
      y2='16'></line>
  </svg>
);
