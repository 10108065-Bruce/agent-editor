import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import WebhookIcon from '../icons/WebhookIcon'; // Assuming you have a WebhookIcon component
const WebhookNode = ({ data, isConnectable }) => {
  const [showInput, setShowInput] = useState(false);
  const [tempUrl, setTempUrl] = useState('');
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleCreateWebhook = () => {
    setShowInput(true);
  };

  const handleConfirmWebhook = () => {
    if (tempUrl.trim()) {
      if (data.updateNodeData) {
        data.updateNodeData('webhookUrl', tempUrl);
        setShowInput(false);
        setIsEditing(false);
      }
    }
  };

  const handleCopyToClipboard = () => {
    if (data.webhookUrl) {
      navigator.clipboard
        .writeText(data.webhookUrl)
        .then(() => {
          setShowCopyAlert(true);
          setTimeout(() => {
            setShowCopyAlert(false);
          }, 2000); // Hide the alert after 2 seconds
        })
        .catch((err) => {
          console.error('Failed to copy URL: ', err);
        });
    }
  };

  const handleEditWebhook = () => {
    setTempUrl(data.webhookUrl);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  return (
    <div className='rounded-lg shadow-md overflow-visible w-64'>
      {/* Copy success alert */}
      {showCopyAlert && (
        <div className='absolute -top-10 left-0 right-0 bg-green-500 text-white py-2 px-4 rounded-md text-center text-sm'>
          URL copied to clipboard!
        </div>
      )}
      <div className='rounded-lg shadow-md overflow-visible w-64'>
        {/* Header section with icon and title */}
        <div className='bg-red-50 p-4 rounded-t-lg'>
          <div className='flex items-center'>
            <div className='w-6 h-6 bg-red-50 flex items-center justify-center mr-2'>
              <WebhookIcon />
            </div>
            <span className='font-medium'>Webhook</span>
          </div>
        </div>

        {/* Content area */}
        <div className='bg-white p-2 rounded-b-lg'>
          {!data.webhookUrl && !showInput && (
            <button
              className='w-full bg-red-500 hover:bg-red-600 text-white rounded-md p-2 flex justify-center items-center'
              onClick={handleCreateWebhook}>
              Create a webhook
            </button>
          )}

          {showInput && (
            <div>
              <div className='mb-3'>
                <label className='block text-sm text-gray-700 mb-1'>URL:</label>
                <div className='flex'>
                  <input
                    type='text'
                    className='flex-1 border border-gray-300 rounded-l p-2 text-sm'
                    placeholder='Enter webhook URL'
                    value={tempUrl}
                    onChange={(e) => setTempUrl(e.target.value)}
                  />
                  <button
                    className='bg-red-500 hover:bg-red-600 text-white px-3 rounded-r'
                    onClick={handleConfirmWebhook}>
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
                      <polyline points='20 6 9 17 4 12'></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {data.webhookUrl && (
          <div className='bg-white pl-4 pr-4 pb-4 rounded-b'>
            <div className='mb-2'>
              <label className='block text-sm text-gray-700 mb-1'>URL:</label>
              <div className='flex items-center'>
                {isEditing ? (
                  <div className='flex flex-col flex-1'>
                    <input
                      type='text'
                      className='flex-1 border border-gray-300 rounded-t p-2 text-sm'
                      value={tempUrl}
                      onChange={(e) => setTempUrl(e.target.value)}
                    />
                    <div className='flex justify-between mt-2'>
                      <button
                        className='bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded'
                        onClick={handleConfirmWebhook}>
                        Save
                      </button>
                      <button
                        className='bg-gray-300 hover:bg-gray-400 text-black px-3 py-1 rounded'
                        onClick={handleCancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <a
                      href={data.webhookUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-600 hover:underline truncate text-sm flex-1 pr-2'
                      onClick={(e) => {
                        e.preventDefault();
                        handleEditWebhook();
                      }}>
                      {data.webhookUrl}
                    </a>
                    <button
                      className='bg-red-500 hover:bg-red-600 text-white p-1 rounded flex-shrink-0'
                      onClick={handleCopyToClipboard}>
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
                        <rect
                          x='9'
                          y='9'
                          width='13'
                          height='13'
                          rx='2'
                          ry='2'></rect>
                        <path d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'></path>
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
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

export default memo(WebhookNode);
