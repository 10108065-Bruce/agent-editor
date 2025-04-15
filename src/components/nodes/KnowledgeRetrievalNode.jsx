import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import KnowledgeRetrievalIcon from '../icons/KnowledgeRetrievalIcon';

const KnowledgeRetrievalNode = ({ data, isConnectable }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dataFiles = data.availableFiles || [
    { id: 'icdcode', name: 'ICDCode.csv' },
    { id: 'cardiology', name: 'Cardiology_Diagnoses.csv' }
  ];

  const handleFileSelect = (fileId) => {
    setDropdownOpen(false);
    if (data.updateNodeData) {
      data.updateNodeData('selectedFile', fileId);
    }
  };

  // Get selected file name
  const getSelectedFileName = () => {
    if (!data.selectedFile) return 'Select file...';
    const selectedFile = dataFiles.find(
      (file) => file.id === data.selectedFile
    );
    return selectedFile ? selectedFile.name : 'Select file...';
  };

  return (
    <div className='rounded-lg shadow-md overflow-visible w-64'>
      {/* Header section with icon and title */}
      <div className='bg-cyan-400 p-4 rounded-t-lg'>
        <div className='flex items-center'>
          <div className='w-6 h-6 bg-white rounded-md flex items-center justify-center mr-2'>
            <KnowledgeRetrievalIcon />
          </div>
          <span className='font-medium text-white'>知識檢索</span>
        </div>
      </div>

      {/* White content area */}
      <div className='bg-white p-4 rounded-b-lg'>
        <div className='mb-3'>
          <label className='block text-sm text-gray-700 mb-1'>
            Data Source
          </label>
          <div className='relative'>
            <button
              className='w-full border border-gray-300 rounded-md p-2 text-sm text-left flex justify-between items-center bg-white'
              onClick={() => setDropdownOpen(!dropdownOpen)}>
              <span>{getSelectedFileName()}</span>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className={`ml-2 transform ${
                  dropdownOpen ? 'rotate-180' : ''
                }`}>
                <polyline points='6 9 12 15 18 9'></polyline>
              </svg>
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className='absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg'>
                {dataFiles.map((file) => (
                  <div
                    key={file.id}
                    className='p-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center'
                    onClick={() => handleFileSelect(file.id)}>
                    {file.id === data.selectedFile && (
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='16'
                        height='16'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        className='mr-2'>
                        <polyline points='20 6 9 17 4 12'></polyline>
                      </svg>
                    )}
                    <span
                      className={
                        file.id === data.selectedFile ? 'ml-0' : 'ml-6'
                      }>
                      {file.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Input handle */}
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

      {/* Output handle */}
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

export default memo(KnowledgeRetrievalNode);
