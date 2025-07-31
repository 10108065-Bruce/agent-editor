import React, { memo, useState, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import IconBase from '../icons/IconBase';
import { WebhookService } from '../../services/WebhookService';
import copyIcon from '../../assets/icn-webhook-input-copy.svg';

const WebhookInputNode = ({ data, isConnectable, id }) => {
  const {
    curl_example,
    webhook_url,
    'X-QOCA-Agent-Api-Key': apiKey,
    isCreatingWebhook
  } = data;
  const [isCreating, setIsCreating] = useState(false);
  const [isExampleExpanded, setIsExampleExpanded] = useState(false);

  const handleCreateWebhook = useCallback(async () => {
    console.log('handleCreateWebhook 被調用');
    setIsCreating(true);

    try {
      const flowId =
        data?.flowId ||
        window.currentFlowId ||
        data?.flow_id ||
        localStorage.getItem('current_flow_id');

      console.log('檢查到的 flowId:', flowId);

      if (!flowId) {
        console.log('沒有 flow_id，需要先保存流程');

        const event = new CustomEvent('requestSaveFlow', {
          detail: {
            nodeId: id,
            callback: async (savedFlowId) => {
              if (savedFlowId) {
                await createWebhook(savedFlowId);
              }
            }
          }
        });
        window.dispatchEvent(event);
        return;
      }

      console.log('已有 flow_id，直接創建 webhook');
      await createWebhook(flowId);
    } finally {
      setIsCreating(false);
    }
  }, [data, id]);

  const createWebhook = async (flowId) => {
    try {
      console.log('創建 webhook 返回的數據:', { flowId, nodeId: id });

      const response = await WebhookService.createWebhookUrl(flowId, id);

      console.log('Webhook 創建成功:', response);

      if (response.success && response.curl_example) {
        // 更新節點數據
        if (data?.updateNodeData && typeof data.updateNodeData === 'function') {
          data.updateNodeData('curl_example', response.curl_example);
          data.updateNodeData('webhook_url', response.webhook_url);
          data.updateNodeData(
            'X-QOCA-Agent-Api-Key',
            response['X-QOCA-Agent-Api-Key']
          );
          console.log('已將 webhook 數據更新到節點:', response);
        } else {
          console.warn('updateNodeData 不可用，無法保存 webhook 數據');
        }

        if (typeof window !== 'undefined' && window.notify) {
          window.notify({
            message: 'Webhook 創建成功',
            type: 'success',
            duration: 3000
          });
        }
      } else {
        throw new Error('後端未返回有效的 webhook 數據');
      }
    } catch (error) {
      console.error('創建 webhook 失敗:', error);
      if (typeof window !== 'undefined' && window.notify) {
        window.notify({
          message: '創建 webhook 失敗',
          type: 'error',
          duration: 3000
        });
      }
    }
  };

  const copyToClipboard = useCallback(async (text, label) => {
    try {
      // 首先嘗試現代 API（如果可用且不在受限環境中）
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(text);
          window.notify?.({
            message: `${label} 已複製到剪貼板`,
            type: 'success',
            duration: 2000
          });
          return;
        } catch (clipboardError) {
          console.warn('Clipboard API 失敗，嘗試 fallback:', clipboardError);
        }
      }

      // Fallback 到傳統方法
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.cssText =
        'position:fixed;top:0;left:0;opacity:0;pointer-events:none;';

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      if (successful) {
        window.notify?.({
          message: `${label} 已複製到剪貼板`,
          type: 'success',
          duration: 2000
        });
      } else {
        throw new Error('所有複製方法都失敗');
      }
    } catch (error) {
      console.error('複製失敗:', error);
      window.notify?.({
        message: '複製失敗，請手動複製內容',
        type: 'error',
        duration: 3000
      });
    }
  }, []);

  const CopyButton = ({ onClick, title }) => (
    <button
      onClick={onClick}
      title={title}
      className='flex-shrink-0 p-1 hover:bg-gray-200 rounded transition-colors'>
      <img
        src={copyIcon}
        width={16}
        height={16}
        className='max-w-full max-h-full object-contain'
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain'
        }}
      />
    </button>
  );

  const hasWebhookData = webhook_url || curl_example || apiKey;

  return (
    <>
      <div className='rounded-lg shadow-md overflow-hidden w-96'>
        {/* Header section with icon and title */}
        <div className='bg-[#fff8f8] p-4'>
          <div className='flex items-center'>
            <div className='w-6 h-6 flex items-center justify-center mr-2'>
              <IconBase type='webhook_input' />
            </div>
            <span className='font-medium'>Webhook</span>
          </div>
        </div>

        {/* White content area */}
        <div className='bg-white p-4 space-y-4'>
          {/* Create webhook 按鈕或 Webhook 資訊顯示 */}
          {!hasWebhookData ? (
            <button
              className='w-full bg-[#fc6165] hover:bg-[#dc6160] text-white rounded-md p-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              onClick={handleCreateWebhook}
              disabled={isCreating || isCreatingWebhook}>
              {isCreating || isCreatingWebhook
                ? '創建中...'
                : 'Create a webhook'}
            </button>
          ) : (
            <div className='space-y-4'>
              {/* Webhook URL */}
              {webhook_url && (
                <div>
                  <label className='block text-sm text-gray-700 mb-1 font-medium'>
                    URL:
                  </label>
                  <div className='flex items-center bg-gray-50 border rounded p-2'>
                    <div className='flex-1 text-xs font-mono text-gray-800 overflow-hidden'>
                      <div className='truncate pr-2'>{webhook_url}</div>
                    </div>
                    <CopyButton
                      onClick={() => copyToClipboard(webhook_url, 'URL')}
                      title='複製 URL'
                    />
                  </div>
                </div>
              )}

              {/* API Key */}
              {apiKey && (
                <div>
                  <label className='block text-sm text-gray-700 mb-1 font-medium'>
                    X-QOCA-Agent-Api-Key:
                  </label>
                  <div className='flex items-center bg-gray-50 border rounded p-2'>
                    <div className='flex-1 text-xs font-mono text-gray-800 overflow-hidden'>
                      <div className='truncate pr-2'>{apiKey}</div>
                    </div>
                    <CopyButton
                      onClick={() => copyToClipboard(apiKey, 'API Key')}
                      title='複製 API Key'
                    />
                  </div>
                </div>
              )}

              {/* Curl Example 手風琴 */}
              {curl_example && (
                <div>
                  <button
                    onClick={() => setIsExampleExpanded(!isExampleExpanded)}
                    className='w-full flex items-center justify-between text-sm text-gray-700 font-medium p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors'>
                    <div className='inline-flex w-full justify-between items-center'>
                      <span className='inline-flex items-center'>
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isExampleExpanded ? 'rotate-0' : '-rotate-90'
                          }`}
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'>
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M19 9l-7 7-7-7'
                          />
                        </svg>
                        <span className='ml-1'>範例程式</span>
                      </span>
                      <CopyButton
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(curl_example, 'Curl 命令');
                        }}
                        title='複製 Curl 命令'
                      />
                    </div>
                  </button>

                  {isExampleExpanded && (
                    <div className='mt-2'>
                      <div className='flex items-start bg-gray-900 text-white rounded p-3'>
                        <div className='flex-1 text-xs font-mono overflow-x-auto'>
                          <pre className='whitespace-pre-wrap break-all pr-2'>
                            {curl_example}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ReactFlow Handle - 只有在有 webhook 數據時才顯示 */}
      {hasWebhookData && (
        <Handle
          type='source'
          position={Position.Right}
          id='output'
          style={{
            background: '#e5e7eb',
            border: '1px solid #D3D3D3',
            width: '12px',
            height: '12px',
            right: '-6px',
            zIndex: 5
          }}
          isConnectable={isConnectable}
        />
      )}
    </>
  );
};

export default memo(WebhookInputNode);
