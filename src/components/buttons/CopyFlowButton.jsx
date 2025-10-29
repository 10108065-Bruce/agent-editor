import React from 'react';
import BaseButton from './BaseButton';
import copyFlowIcon from '../../assets/icon-clone.svg';

const CopyFlowButton = ({
  onClick,
  disabled = false,
  className = '',
  title = '複製流程',
  width = '50px',
  showBorder = false
}) => {
  return (
    <span className='relative'>
      <BaseButton
        onClick={onClick}
        disabled={disabled}
        className={className}
        width={width}
        title={title}
        buttonStyle='secondary'
        showBorder={showBorder}>
        <img
          src={copyFlowIcon}
          alt='copyFlow'
        />
      </BaseButton>
    </span>
  );
};

export default CopyFlowButton;
