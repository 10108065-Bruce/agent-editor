import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import IconBase from '../icons/IconBase';
import { externalService } from '../../services/index';

const LineMessageNode = ({ data, isConnectable }) => {
  // 狀態管理 - Service Configs
  const [selectedConfigId, setSelectedConfigId] = useState(
    data?.external_service_config_id || ''
  );
  const [serviceConfigs, setServiceConfigs] = useState([]);
  const [configLoadError, setConfigLoadError] = useState(null);
  const [isLoadingConfigs, setIsLoadingConfigs] = useState(false);

  // 狀態管理 - Messaging Types
  const [selectedMessagingType, setSelectedMessagingType] = useState(
    data?.messaging_type || ''
  );
  const [messagingTypes, setMessagingTypes] = useState([]);
  const [messagingTypesLoadError, setMessagingTypesLoadError] = useState(null);
  const [isLoadingMessagingTypes, setIsLoadingMessagingTypes] = useState(false);

  // 使用 ref 來防止重複執行和追蹤狀態變化
  const isInitialized = useRef(false);
  const lastSyncedConfigId = useRef(selectedConfigId);
  const lastSyncedMessagingType = useRef(selectedMessagingType);
  const isUpdating = useRef(false); // 添加更新標記防止循環

  // 統一更新父組件狀態的輔助函數
  const updateParentState = useCallback(
    (key, value) => {
      // 防止在更新過程中再次觸發更新
      if (isUpdating.current) {
        console.log(`跳過重複更新: ${key}=${value}`);
        return false;
      }

      console.log(`嘗試更新父組件狀態 ${key}=${value}`);

      try {
        if (data && typeof data.updateNodeData === 'function') {
          isUpdating.current = true;
          data.updateNodeData(key, value);
          console.log(`使用 updateNodeData 更新 ${key}`);

          // 更新本地追蹤
          if (key === 'external_service_config_id') {
            lastSyncedConfigId.current = value;
          } else if (key === 'messaging_type') {
            lastSyncedMessagingType.current = value;
          }

          return true;
        }
      } finally {
        // 使用 setTimeout 重置標記，避免阻塞正常更新
        setTimeout(() => {
          isUpdating.current = false;
        }, 100);
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
      console.log('已在載入服務配置中，跳過重複載入');
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

  // 載入 LINE Messaging Types
  const loadMessagingTypes = useCallback(async () => {
    // 避免重複載入
    if (isLoadingMessagingTypes) {
      console.log('已在載入 Messaging Types 中，跳過重複載入');
      return;
    }

    setIsLoadingMessagingTypes(true);
    setMessagingTypesLoadError(null);

    try {
      console.log('開始載入 LINE Messaging Types...');
      const types = await externalService.getMessagingTypeOptions('line');
      console.log('載入的 LINE Messaging Types:', types);

      if (types && types.length > 0) {
        setMessagingTypes(types);

        // 只在初始化時檢查 messaging type 一致性
        if (!isInitialized.current) {
          const currentMessagingType =
            data?.messaging_type || selectedMessagingType;

          if (currentMessagingType) {
            const typeExists = types.some(
              (type) => type.value === currentMessagingType
            );

            if (!typeExists) {
              console.log(
                `當前 messaging type ${currentMessagingType} 不在選項列表中，清空選擇`
              );
              setSelectedMessagingType('');
              updateParentState('messaging_type', '');
            } else {
              console.log(`確認 messaging type 存在: ${currentMessagingType}`);
              setSelectedMessagingType(currentMessagingType);
              lastSyncedMessagingType.current = currentMessagingType;
            }
          }
        }
      } else {
        console.warn('未獲取到 LINE Messaging Types，使用預設選項');
        // 使用預設的 messaging types
        const defaultTypes = [
          { value: 'Reply Message', label: 'Reply Message' },
          { value: 'Push Message', label: 'Push Message' }
        ];
        setMessagingTypes(defaultTypes);
      }
    } catch (error) {
      console.error('載入 LINE Messaging Types 失敗:', error);

      // 檢查是否為 404 錯誤（API 不存在）
      if (error.message && error.message.includes('404')) {
        console.warn('Messaging Types API 不存在 (404)，使用預設選項');
        setMessagingTypesLoadError('API 暫不可用，使用預設選項');
      } else {
        setMessagingTypesLoadError('無法載入 Messaging Types，使用預設選項');

        // 顯示錯誤通知
        if (typeof window !== 'undefined' && window.notify) {
          window.notify({
            message: '載入 LINE Messaging Types 失敗，使用預設選項',
            type: 'warning',
            duration: 3000
          });
        }
      }

      // 使用預設的 messaging types
      const defaultTypes = [
        { value: 'Reply Message', label: 'Reply Message' },
        { value: 'Push Message', label: 'Push Message' }
      ];
      setMessagingTypes(defaultTypes);
    } finally {
      setIsLoadingMessagingTypes(false);
    }
  }, []); // 移除所有依賴，只在初始化時執行

  // 組件載入時獲取服務配置和 Messaging Types
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([loadServiceConfigs(), loadMessagingTypes()]);
      isInitialized.current = true;
    };

    initializeData();
  }, []);

  // 同步父組件數據變更
  useEffect(() => {
    // 防止在更新過程中觸發同步
    if (isUpdating.current) return;

    let hasChanges = false;

    console.log('LineNode 數據同步更新:', {
      'data.external_service_config_id': data?.external_service_config_id,
      'data.messaging_type': data?.messaging_type,
      selectedConfigId,
      selectedMessagingType
    });

    // 同步配置ID
    if (
      data?.external_service_config_id !== undefined &&
      data.external_service_config_id !== selectedConfigId
    ) {
      console.log(
        `同步配置ID從 ${selectedConfigId} 到 ${data.external_service_config_id}`
      );
      setSelectedConfigId(data.external_service_config_id);
      lastSyncedConfigId.current = data.external_service_config_id;
      hasChanges = true;
    }

    // 同步 messaging type
    if (
      data?.messaging_type !== undefined &&
      data.messaging_type !== selectedMessagingType
    ) {
      console.log(
        `同步 messaging type 從 ${selectedMessagingType} 到 ${data.messaging_type}`
      );
      setSelectedMessagingType(data.messaging_type);
      lastSyncedMessagingType.current = data.messaging_type;
      hasChanges = true;
    }

    if (hasChanges) {
      console.log('LineNode 數據同步完成');
    }
  }, [
    data?.external_service_config_id,
    data?.messaging_type,
    selectedConfigId,
    selectedMessagingType
  ]);

  // 處理服務配置下拉選單變更 - 防止重複觸發
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

  // 處理 Messaging Type 下拉選單變更
  const handleMessagingTypeChange = useCallback(
    (messagingType) => {
      // 防止重複更新
      if (messagingType === selectedMessagingType || isUpdating.current) {
        console.log('Messaging Type 未變更或正在更新中，跳過');
        return;
      }

      console.log(`Messaging Type 變更為: ${messagingType}`);
      setSelectedMessagingType(messagingType);
      updateParentState('messaging_type', messagingType);
    },
    [selectedMessagingType, updateParentState]
  );

  return (
    <div className='rounded-lg shadow-md overflow-hidden w-80 bg-white'>
      <div>
        {/* Header section with icon and title */}
        <div className='bg-gray-100 p-4'>
          <div className='flex items-center'>
            <div className='w-6 h-6 bg-[#06C755] rounded-full flex items-center justify-center mr-2'>
              <IconBase type='line' />
            </div>
            <span className='font-medium'>Line Message</span>
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
            {configLoadError && (
              <div className='text-red-500 text-xs mt-1'>{configLoadError}</div>
            )}
          </div>

          {/* Messaging types下拉選單 - 修正版本 */}
          <div>
            <label className='block text-sm text-gray-700 mb-2 font-bold'>
              Messaging types
            </label>
            <div className='relative'>
              <select
                className='w-full border border-gray-300 rounded p-2 text-sm appearance-none bg-white pr-8'
                value={selectedMessagingType}
                onChange={(e) => handleMessagingTypeChange(e.target.value)}
                disabled={isLoadingMessagingTypes}>
                <option value=''>
                  {isLoadingMessagingTypes
                    ? '載入中...'
                    : '選擇 Messaging Type'}
                </option>
                {messagingTypes.map((type) => (
                  <option
                    key={type.value}
                    value={type.value}>
                    {type.label}
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
            {messagingTypesLoadError && (
              <div className='text-red-500 text-xs mt-1'>
                {messagingTypesLoadError}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message section */}
      <div className='p-1 ml-3 flex items-center'>
        <span className='text-sm text-gray-700 mr-2 font-bold block text-sm text-gray-700 mb-2 font-bold'>
          Message
        </span>
      </div>
      <Handle
        type='target'
        position={Position.Left}
        id='message'
        style={{
          background: '#e5e7eb',
          border: '1px solid #D3D3D3',
          width: '12px',
          height: '12px',
          left: '-6px',
          top: '92%',
          transform: 'translateY(-50%)'
        }}
        isConnectable={isConnectable}
      />
    </div>
  );
};

export default memo(LineMessageNode);
