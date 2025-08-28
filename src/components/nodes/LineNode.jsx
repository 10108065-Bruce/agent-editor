import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import IconBase from '../icons/IconBase';
import { externalService } from '../../services/index';
import { formatNodeTitle } from '../../utils/nodeUtils';

const LineNode = ({ data, isConnectable, id }) => {
  // 狀態管理
  const [selectedConfigId, setSelectedConfigId] = useState(
    data?.external_service_config_id || ''
  );
  const [serviceConfigs, setServiceConfigs] = useState([]);
  const [configLoadError, setConfigLoadError] = useState(null);
  const [isLoadingConfigs, setIsLoadingConfigs] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isCreatingWebhook, setIsCreatingWebhook] = useState(false);

  // 使用 ref 來防止重複執行和追蹤狀態變化
  const isInitialized = useRef(false);
  const lastSyncedConfigId = useRef(selectedConfigId);
  const lastSyncedWebhookUrl = useRef(webhookUrl);
  const isUpdating = useRef(false); // 添加更新標記防止循環

  // 固定的輸出類型
  const outputHandles = ['text', 'image'];

  // 統一更新父組件狀態的輔助函數
  const updateParentState = useCallback(
    (key, value) => {
      // 防止在更新過程中再次觸發更新
      if (isUpdating.current) {
        console.log(`跳過重複更新: ${key}=${value}`);
        return false;
      }

      console.log(`嘗試更新父組件狀態 ${key}=${value}`);

      // 方法1：使用 updateNodeData 回調
      if (data && typeof data.updateNodeData === 'function') {
        isUpdating.current = true;
        try {
          data.updateNodeData(key, value);
          console.log(`使用 updateNodeData 更新 ${key} 成功`);

          // 更新本地追蹤
          if (key === 'external_service_config_id') {
            lastSyncedConfigId.current = value;
          } else if (key === 'webhook_url') {
            lastSyncedWebhookUrl.current = value;
          }

          return true;
        } finally {
          // 使用 setTimeout 重置標記，避免阻塞正常更新
          setTimeout(() => {
            isUpdating.current = false;
          }, 100);
        }
      }

      console.warn(`無法更新父組件的 ${key}`);
      return false;
    },
    [data]
  );

  // 載入 LINE 服務配置 - 優化版本，移除會變化的依賴
  const loadServiceConfigs = useCallback(async () => {
    // 避免重複載入
    if (isLoadingConfigs) {
      console.log('已在載入中，跳過重複載入');
      return;
    }

    setIsLoadingConfigs(true);
    setConfigLoadError(null);

    try {
      console.log('開始載入 LINE 服務配置...');
      const configs = await externalService.getServiceConfigOptions('LINE');
      console.log('載入的 LINE 服務配置:', configs);

      if (configs && configs.length > 0) {
        setServiceConfigs(configs);

        // 只在初始化時檢查配置一致性
        if (!isInitialized.current) {
          const currentConfigId =
            data?.external_service_config_id || selectedConfigId;

          if (currentConfigId) {
            const configExists = configs.some(
              (config) => config.value === currentConfigId.toString()
            );

            if (!configExists) {
              console.log(
                `當前配置 ${currentConfigId} 不在選項列表中，清空選擇`
              );
              setSelectedConfigId('');
              updateParentState('external_service_config_id', '');
            } else {
              console.log(`確認配置存在: ${currentConfigId}`);
              setSelectedConfigId(currentConfigId.toString());
              lastSyncedConfigId.current = currentConfigId.toString();
            }
          }

          isInitialized.current = true;
        }
      } else {
        console.warn('未獲取到 LINE 服務配置或配置列表為空');
        setServiceConfigs([]);
      }
    } catch (error) {
      console.error('載入 LINE 服務配置失敗:', error);
      setConfigLoadError('無法載入服務配置，請稍後再試');

      if (typeof window !== 'undefined' && window.notify) {
        window.notify({
          message: '載入 LINE 服務配置失敗',
          type: 'error',
          duration: 3000
        });
      }
    } finally {
      setIsLoadingConfigs(false);
    }
  }, []); // 移除所有依賴，只在初始化時執行

  // 組件載入時獲取服務配置 - 只執行一次
  useEffect(() => {
    loadServiceConfigs();
  }, []); // 空依賴數組

  // 優化的同步邏輯 - 減少不必要的更新
  useEffect(() => {
    // 防止在更新過程中觸發同步
    if (isUpdating.current) return;

    let hasChanges = false;

    // 同步配置ID
    if (
      data?.external_service_config_id !== undefined &&
      data.external_service_config_id !== lastSyncedConfigId.current
    ) {
      console.log(
        `同步配置ID從 ${lastSyncedConfigId.current} 到 ${data.external_service_config_id}`
      );
      setSelectedConfigId(data.external_service_config_id);
      lastSyncedConfigId.current = data.external_service_config_id;
      hasChanges = true;
    }

    // 同步 webhook URL
    if (
      data?.webhook_url !== undefined &&
      data.webhook_url !== lastSyncedWebhookUrl.current
    ) {
      console.log(
        `同步 webhook URL 從 "${lastSyncedWebhookUrl.current}" 到 "${data.webhook_url}"`
      );
      setWebhookUrl(data.webhook_url);
      lastSyncedWebhookUrl.current = data.webhook_url;
      hasChanges = true;
    }

    if (hasChanges) {
      console.log('LineNode 數據同步完成');
    }
  }, [data?.external_service_config_id, data?.webhook_url]);

  // 處理下拉選單變更 - 防止重複觸發
  const handleConfigChange = useCallback(
    (configId) => {
      // 防止重複更新
      if (configId === selectedConfigId || isUpdating.current) {
        console.log('配置ID未變更或正在更新中，跳過');
        return;
      }

      console.log(`配置變更為ID: ${configId}`);
      setSelectedConfigId(configId);
      updateParentState('external_service_config_id', configId);
    },
    [selectedConfigId, updateParentState]
  );

  // 如果你想要更簡潔的版本，可以使用這個：
  const copyToClipboardSimple = useCallback(async (text) => {
    try {
      // 首先嘗試現代 API（如果可用且不在受限環境中）
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(text);
          window.notify?.({
            message: 'URL 已複製到剪貼板',
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
          message: 'URL 已複製到剪貼板',
          type: 'success',
          duration: 2000
        });
      } else {
        throw new Error('所有複製方法都失敗');
      }
    } catch (error) {
      console.error('複製失敗:', error);
      window.notify?.({
        message: '複製失敗，請手動複製 URL',
        type: 'error',
        duration: 3000
      });
    }
  }, []);

  // 創建 webhook URL
  const createWebhook = useCallback(
    async (flowId) => {
      setIsCreatingWebhook(true);
      try {
        const url = externalService.createWebhook(flowId);

        console.log('創建 webhook 返回的 URL:', url);

        if (url) {
          setWebhookUrl(url);
          lastSyncedWebhookUrl.current = url;

          if (
            data?.updateNodeData &&
            typeof data.updateNodeData === 'function'
          ) {
            data.updateNodeData('webhook_url', url);
            console.log('已將 webhook URL 更新到節點數據:', url);
          } else {
            console.warn('updateNodeData 不可用，無法保存 webhook URL');
          }

          if (typeof window !== 'undefined' && window.notify) {
            window.notify({
              message: 'Webhook URL 創建成功',
              type: 'success',
              duration: 3000
            });
          }
        } else {
          throw new Error('後端未返回有效的 webhook URL');
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
      } finally {
        setIsCreatingWebhook(false);
      }
    },
    [data]
  );

  const handleCreateWebhook = useCallback(async () => {
    console.log('handleCreateWebhook 被調用');

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
          callback: (savedFlowId) => {
            if (savedFlowId) {
              createWebhook(savedFlowId);
            }
          }
        }
      });
      window.dispatchEvent(event);
      return;
    }

    console.log('已有 flow_id，直接創建 webhook');
    await createWebhook(flowId);
  }, [data, createWebhook, id]);

  // 計算標籤寬度的函數
  const calculateLabelWidth = (text) => {
    const baseWidth = 24;
    const charWidth = 8;
    return baseWidth + text.length * charWidth;
  };

  // 獲取輸出類型的顏色
  const getHandleColor = (handleType) => {
    const colors = {
      line: '#D3D3D3',
      node: '#00ced1'
    };
    return colors[handleType] || '#00ced1';
  };

  return (
    <>
      <div className='rounded-lg shadow-md overflow-hidden w-80'>
        {/* Header section with icon and title */}
        <div className='bg-gray-100 p-4'>
          <div className='flex items-center'>
            <div className='w-6 h-6 bg-[#06C755] rounded-full flex items-center justify-center mr-2'>
              <IconBase type='line' />
            </div>
            <span className='font-medium'>
              {formatNodeTitle('Line Webhook', id)}
            </span>
          </div>
        </div>

        {/* White content area */}
        <div className='bg-white p-4'>
          {/* 連結密鑰下拉選單 */}
          <div className='mb-4'>
            <label className='block text-sm text-gray-700 mb-2 font-medium'>
              連結密鑰
            </label>
            <div className='relative'>
              <select
                className='w-full border border-gray-300 rounded p-2 text-sm appearance-none bg-white pr-8'
                value={selectedConfigId}
                onChange={(e) => handleConfigChange(e.target.value)}
                disabled={isLoadingConfigs}>
                <option value=''>
                  {isLoadingConfigs ? '載入中...' : '選擇連結密鑰'}
                </option>
                {serviceConfigs.map((config) => (
                  <option
                    key={config.value}
                    value={config.value}>
                    {config.label}
                  </option>
                ))}
              </select>
              <div className='absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none'>
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
                  <polyline points='6 9 12 15 18 9'></polyline>
                </svg>
              </div>
            </div>
          </div>

          {/* Create webhook 按鈕或 URL 顯示 */}
          {!webhookUrl ? (
            <button
              className='w-full bg-cyan-500 hover:bg-cyan-600 text-white rounded-md p-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed'
              onClick={handleCreateWebhook}
              disabled={isCreatingWebhook}>
              {isCreatingWebhook ? '創建中...' : 'Create a webhook'}
            </button>
          ) : (
            <div>
              <label className='block text-sm text-gray-700 mb-1 font-medium'>
                URL:
              </label>
              <div className='flex items-center space-x-2'>
                <div className='relative group flex-1 max-w-[250px]'>
                  <a
                    href={webhookUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='block text-sm bg-gray-50 text-blue-600 hover:text-blue-800 underline truncate'>
                    {webhookUrl}
                  </a>
                  <div className='absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 max-w-md break-all'>
                    {webhookUrl}
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboardSimple(webhookUrl)}
                  className='bg-cyan-500 hover:bg-cyan-600 text-white p-2 rounded'
                  title='複製 URL'>
                  <svg
                    className='w-4 h-4'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a1 1 0 011 1v3M9 12l2 2 4-4'
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 右側標籤區域 */}
      {webhookUrl && (
        <div className='absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2 ml-2 space-y-2 pointer-events-none'>
          {outputHandles.map((handleType) => (
            <div
              key={handleType}
              className='flex items-center mb-4'
              style={{ pointerEvents: 'none' }}>
              <div
                className='w-3 h-3 rounded-full'
                style={{
                  background: '#e5e7eb',
                  border: '1px solid #D3D3D3',
                  transform: 'translateX(-6px)'
                }}
              />
              <div
                className='w-4 h-0.5'
                style={{
                  backgroundColor: getHandleColor('line'),
                  transform: 'translateX(-6px)'
                }}
              />
              <span
                className='inline-flex items-center px-3 py-1 rounded text-xs font-medium text-white whitespace-nowrap select-none'
                style={{
                  backgroundColor: getHandleColor('node'),
                  transform: 'translateX(-6px)'
                }}>
                {handleType}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ReactFlow Handle */}
      {webhookUrl &&
        outputHandles.map((handleType, index) => {
          const labelWidth = calculateLabelWidth(handleType);
          const totalWidth = labelWidth + 8;

          return (
            <Handle
              key={handleType}
              type='source'
              position={Position.Right}
              id={handleType}
              style={{
                background: 'transparent',
                border: 'none',
                width: `${totalWidth}px`,
                height: '32px',
                right: `-${totalWidth + 6}px`,
                top: `calc(50% + ${
                  (index - (outputHandles.length - 1) / 2) * 40
                }px)`,
                transform: 'translateY(-50%)',
                cursor: 'crosshair',
                zIndex: 10
              }}
              isConnectable={isConnectable}
            />
          );
        })}
    </>
  );
};

export default memo(LineNode);
