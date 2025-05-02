import React from 'react';
import add from '../../assets/icon-add.svg';

const Add = () => {
  return (
    <div
      className={`flex items-center justify-center`}
      style={{
        width: '14px',
        height: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
      <img
        src={add}
        width={32}
        height={32}
        className='max-w-full max-h-full object-contain'
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain'
        }}
      />
    </div>
  );
};

export default Add;
