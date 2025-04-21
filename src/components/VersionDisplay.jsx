// src/components/VersionDisplay.jsx
import React from 'react';
import { versionService } from '../services/VersionService';

const VersionDisplay = ({ className = '' }) => {
  const versionInfo = versionService.getVersionInfo();

  return (
    <div className={`version-display text-xs text-gray-500 ${className}`}>
      <span className='version-number'>
        {versionService.getFormattedVersion()}
      </span>
      {versionInfo.environment !== 'production' && (
        <span className='version-environment ml-1'>
          ({versionInfo.environment})
        </span>
      )}
    </div>
  );
};

export default VersionDisplay;
