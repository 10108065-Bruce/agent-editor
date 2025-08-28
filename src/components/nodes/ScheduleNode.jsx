import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import IconBase from '../icons/IconBase';
import SelectableTextWrapper from '../../components/text/SelectableTextWrapper';
import DateTimeSelector from '../common/DateTimeSelector';
import { scheduleTriggerService } from '../../services/ScheduleTriggerService';
import { llmService } from '../../services/index';
import magicIcon from '../../assets/magic-refine-default.svg';
import { formatNodeTitle } from '../../utils/nodeUtils';

const ScheduleTriggerNode = ({ data, isConnectable, id }) => {
  // 狀態管理
  const [scheduleType, setScheduleType] = useState(
    data?.schedule_type || 'cron'
  );
  const [cronExpression, setCronExpression] = useState(
    data?.cron_expression || ''
  );
  const [executeAt, setExecuteAt] = useState(data?.execute_at || null);
  const [timezone, setTimezone] = useState(data?.timezone || 'Asia/Taipei');
  const [enabled, setEnabled] = useState(data?.enabled ?? true);
  const [description, setDescription] = useState(data?.description || '');

  // 智慧設定助手狀態
  const [showSmartDialog, setShowSmartDialog] = useState(false);
  const [defaultDescriptions, setDefaultDescriptions] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [selectedLlm, setSelectedLlm] = useState('3'); // 預設 LLM ID
  const [isGenerating, setIsGenerating] = useState(false);
  const [llmOptions, setLlmOptions] = useState([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelLoadError, setModelLoadError] = useState(null);

  // 時區和頻率相關狀態
  const [timezoneOptions, setTimezoneOptions] = useState([]);
  const [frequencyMode, setFrequencyMode] = useState('preset'); // 'preset' 或 'custom'
  const [isLoadingTimezones, setIsLoadingTimezones] = useState(false);
  const [isLoadingDescriptions, setIsLoadingDescriptions] = useState(false);

  // 記錄用戶選擇的預設選項值
  const [selectedPresetValue, setSelectedPresetValue] = useState('');

  // 預設調度設定相關狀態
  const [presetScheduleConfigs, setPresetScheduleConfigs] = useState([]);
  const [isLoadingScheduleConfigs, setIsLoadingScheduleConfigs] =
    useState(false);

  const isInitialized = useRef(false);
  const lastSyncedData = useRef({});

  // 統一更新父組件狀態的輔助函數
  const updateParentState = useCallback(
    (key, value) => {
      console.log(`Schedule節點更新: ${key}=${value}`);
      if (data && typeof data.updateNodeData === 'function') {
        data.updateNodeData(key, value);
        lastSyncedData.current[key] = value;
        return true;
      }
      console.warn(`無法更新父組件的 ${key}`);
      return false;
    },
    [data]
  );

  // 載入 LLM 選項
  const loadLlmOptions = useCallback(async () => {
    try {
      const options = await llmService.getModelOptions();
      setLlmOptions(options);

      // 如果沒有設定選擇的 LLM，使用第一個可用的
      if (options.length > 0 && !selectedLlm) {
        setSelectedLlm(options[0].value);
      }
    } catch (error) {
      console.error('載入 LLM 選項失敗:', error);
    }
  }, [selectedLlm]);

  // 載入時區選項
  const loadTimezoneOptions = useCallback(async () => {
    if (isLoadingTimezones) return;

    setIsLoadingTimezones(true);
    try {
      const options = await scheduleTriggerService.getTimezoneOptions({
        region: 'Asia',
        format: 'detailed'
      });
      setTimezoneOptions(options);
    } catch (error) {
      console.error('載入時區選項失敗:', error);
      window.notify?.({
        message: '載入時區選項失敗',
        type: 'error',
        duration: 3000
      });
    } finally {
      setIsLoadingTimezones(false);
    }
  }, [isLoadingTimezones]);

  // 載入預設描述選項
  const loadDefaultDescriptions = useCallback(async () => {
    if (isLoadingDescriptions) return;

    setIsLoadingDescriptions(true);
    try {
      const options =
        await scheduleTriggerService.getDefaultDescriptionOptions();
      setDefaultDescriptions(options);
    } catch (error) {
      console.error('載入預設描述失敗:', error);
      window.notify?.({
        message: '載入預設描述失敗',
        type: 'error',
        duration: 3000
      });
    } finally {
      setIsLoadingDescriptions(false);
    }
  }, [isLoadingDescriptions]);

  // 載入預設調度設定選項
  const loadDefaultScheduleConfigs = useCallback(async () => {
    if (isLoadingScheduleConfigs) return;

    setIsLoadingScheduleConfigs(true);
    try {
      const options =
        await scheduleTriggerService.getDefaultScheduleConfigOptions();
      setPresetScheduleConfigs(options);
      console.log('載入的預設調度設定選項:', options);
    } catch (error) {
      console.error('載入預設調度設定選項失敗:', error);
      window.notify?.({
        message: '載入預設調度設定選項失敗',
        type: 'error',
        duration: 3000
      });
    } finally {
      setIsLoadingScheduleConfigs(false);
    }
  }, [isLoadingScheduleConfigs]);

  // 初始化載入
  useEffect(() => {
    if (!isInitialized.current) {
      loadLlmOptions();
      loadTimezoneOptions();
      loadDefaultScheduleConfigs();
      isInitialized.current = true;
    }
  }, [loadLlmOptions, loadTimezoneOptions, loadDefaultScheduleConfigs]);

  // 同步父組件數據
  useEffect(() => {
    let hasChanges = false;

    const fieldsToSync = [
      'schedule_type',
      'cron_expression',
      'execute_at',
      'timezone',
      'enabled',
      'description'
    ];

    fieldsToSync.forEach((field) => {
      if (
        data?.[field] !== undefined &&
        data[field] !== lastSyncedData.current[field]
      ) {
        switch (field) {
          case 'schedule_type':
            setScheduleType(data[field]);
            break;
          case 'cron_expression':
            setCronExpression(data[field]);
            break;
          case 'execute_at':
            setExecuteAt(data[field]);
            break;
          case 'timezone':
            setTimezone(data[field]);
            break;
          case 'enabled':
            setEnabled(data[field]);
            break;
          case 'description':
            setDescription(data[field]);
            break;
        }
        lastSyncedData.current[field] = data[field];
        hasChanges = true;
      }
    });

    if (hasChanges) {
      console.log('Schedule節點數據同步完成');
    }
  }, [data]);

  // 初始化 selectedPresetValue 狀態
  useEffect(() => {
    // 在組件載入時，根據當前 cron 表達式設置正確的模式
    if (cronExpression && presetScheduleConfigs.length > 0) {
      const matchedConfig = presetScheduleConfigs.find(
        (config) =>
          config.cronExpression === cronExpression &&
          config.value !== 'custom' &&
          config.cronExpression !== ''
      );

      if (matchedConfig) {
        // 找到匹配的預設配置
        setFrequencyMode('preset');
        setSelectedPresetValue(matchedConfig.cronExpression);
      } else {
        // 沒有找到匹配的預設配置，設置為自訂模式
        setFrequencyMode('custom');
        setSelectedPresetValue('');
      }
    } else if (presetScheduleConfigs.length > 0 && !cronExpression) {
      // 沒有 cron 表達式時，默認選擇第一個非自訂的預設選項
      const firstNonCustomOption = presetScheduleConfigs.find(
        (config) => config.value !== 'custom' && config.cronExpression !== ''
      );
      if (firstNonCustomOption) {
        setFrequencyMode('preset');
        setSelectedPresetValue(firstNonCustomOption.cronExpression);
      }
    }
  }, [cronExpression, presetScheduleConfigs]);

  // 處理啟用/停用切換
  const handleEnabledToggle = useCallback(() => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    updateParentState('enabled', newEnabled);
  }, [enabled, updateParentState]);

  // 處理類型變更
  const handleTypeChange = useCallback(
    (newType) => {
      setScheduleType(newType);
      updateParentState('schedule_type', newType);
    },
    [updateParentState]
  );

  // 處理 cron 表達式變更
  const handleCronExpressionChange = useCallback(
    (newExpression) => {
      setCronExpression(newExpression);
      updateParentState('cron_expression', newExpression);
    },
    [updateParentState]
  );

  // 處理執行時間變更
  const handleExecuteAtChange = useCallback(
    (dateTimeData) => {
      const isoString = new Date(dateTimeData.timestamp).toISOString();
      setExecuteAt(isoString);
      updateParentState('execute_at', isoString);
    },
    [updateParentState]
  );

  // 處理時區變更
  const handleTimezoneChange = useCallback(
    (newTimezone) => {
      setTimezone(newTimezone);
      updateParentState('timezone', newTimezone);
    },
    [updateParentState]
  );

  // 處理描述變更
  const handleDescriptionChange = useCallback(
    (newDescription) => {
      setDescription(newDescription);
      updateParentState('description', newDescription);
    },
    [updateParentState]
  );

  // 下拉選單的 value 綁定邏輯
  const getDropdownValue = useCallback(() => {
    if (frequencyMode === 'custom') {
      // 在自訂模式下，找到後端提供的自訂表達式選項
      const customOption = presetScheduleConfigs.find(
        (config) => config.value === 'custom' || config.cronExpression === ''
      );
      return customOption ? customOption.cronExpression : '';
    } else {
      // 在 preset 模式下，優先使用用戶最後選擇的預設值
      if (selectedPresetValue) {
        return selectedPresetValue;
      } else {
        // 如果沒有記錄的選擇，使用第一個非自訂的預設選項
        const firstNonCustomOption = presetScheduleConfigs.find(
          (config) => config.value !== 'custom' && config.cronExpression !== ''
        );
        return firstNonCustomOption ? firstNonCustomOption.cronExpression : '';
      }
    }
  }, [frequencyMode, selectedPresetValue, presetScheduleConfigs]);

  // 下拉選單的 onChange 處理函數
  const handleFrequencySelectChange = useCallback(
    (e) => {
      const selectedValue = e.target.value;
      // 找到選中的配置
      const selectedConfig = presetScheduleConfigs.find(
        (config) => config.cronExpression === selectedValue
      );

      // 檢查是否為自訂表達式選項（通常 cronExpression 為空或者 value 為 'custom'）
      const isCustomOption =
        selectedConfig &&
        (selectedConfig.value === 'custom' ||
          selectedConfig.cronExpression === '');

      if (isCustomOption) {
        setFrequencyMode('custom');
        setSelectedPresetValue(''); // 清空預設選項記錄
        // 清空 cron 表達式，讓用戶手動輸入
        handleCronExpressionChange('');
      } else {
        setFrequencyMode('preset');
        setSelectedPresetValue(selectedValue); // 記錄用戶選擇的預設選項

        if (selectedConfig) {
          handleCronExpressionChange(selectedConfig.cronExpression);
        } else {
          // 如果找不到對應的設定，直接使用選擇的值作為 cron 表達式
          handleCronExpressionChange(selectedValue);
        }
      }
    },
    [presetScheduleConfigs, handleCronExpressionChange]
  );

  // 開啟智慧設定助手
  const openSmartDialog = useCallback(async () => {
    setShowSmartDialog(true);
    if (defaultDescriptions.length === 0) {
      await loadDefaultDescriptions();
    }
  }, [defaultDescriptions.length, loadDefaultDescriptions]);

  // 關閉智慧設定助手
  const closeSmartDialog = useCallback(() => {
    setShowSmartDialog(false);
    setUserInput('');
  }, []);

  // 選擇預設描述
  const selectDefaultDescription = useCallback((description) => {
    setUserInput(description);
  }, []);

  // 生成設定函數，智慧處理返回的 cron 表達式
  const generateScheduleSettings = useCallback(async () => {
    if (!userInput.trim()) {
      window.notify?.({
        message: '請輸入任務描述',
        type: 'warning',
        duration: 2000
      });
      return;
    }

    setIsGenerating(true);
    try {
      const requestData = {
        current_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        llm_id: parseInt(selectedLlm),
        task_description: userInput,
        timezone: timezone,
        user_input: userInput
      };

      const response = await scheduleTriggerService.generateScheduleTime(
        requestData
      );

      if (response.success && response.result) {
        const result = response.result;

        // 更新節點數據
        setScheduleType(result.schedule_type);
        updateParentState('schedule_type', result.schedule_type);

        if (result.schedule_type === 'cron') {
          // 更新 cron 表達式
          setCronExpression(result.schedule_config.cron_expression);
          updateParentState(
            'cron_expression',
            result.schedule_config.cron_expression
          );

          // 檢查返回的 cron 表達式是否在預設選項中
          const matchedConfig = presetScheduleConfigs.find(
            (config) =>
              config.cronExpression === result.schedule_config.cron_expression
          );

          if (matchedConfig) {
            // 如果找到匹配的預設配置，切換到預設模式並選中該選項
            setFrequencyMode('preset');
            setSelectedPresetValue(matchedConfig.cronExpression);
          } else {
            // 如果沒有找到匹配的預設配置，切換到自訂模式
            setFrequencyMode('custom');
            setSelectedPresetValue('');
          }
        } else if (result.schedule_type === 'once') {
          setExecuteAt(result.schedule_config.execute_at);
          updateParentState('execute_at', result.schedule_config.execute_at);
        }

        if (result.schedule_config.timezone) {
          setTimezone(result.schedule_config.timezone);
          updateParentState('timezone', result.schedule_config.timezone);
        }

        if (result.description) {
          setDescription(result.schedule_config.description);
          updateParentState('description', result.schedule_config.description);
        }

        window.notify?.({
          message: '排程設定生成成功',
          type: 'success',
          duration: 2000
        });

        closeSmartDialog();
      } else {
        throw new Error(response.error || '生成設定失敗');
      }
    } catch (error) {
      console.error('生成排程設定失敗:', error);
      window.notify?.({
        message: '生成排程設定失敗',
        type: 'error',
        duration: 3000
      });
    } finally {
      setIsGenerating(false);
    }
  }, [
    userInput,
    selectedLlm,
    timezone,
    updateParentState,
    closeSmartDialog,
    presetScheduleConfigs
  ]);

  return (
    <>
      <div className='rounded-lg shadow-md overflow-hidden w-80'>
        {/* Header section with icon, title, and controls */}
        <div
          className='p-4'
          style={{ backgroundColor: '#dccafa' }}>
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <div className='w-6 h-6 rounded-full flex items-center justify-center mr-2'>
                <IconBase type='schedule' />
              </div>
              <span className='font-bold text-gray-800'>
                {formatNodeTitle('Schedule', id)}
              </span>
            </div>

            <div className='flex items-center space-x-2'>
              {/* Switch Button */}
              <button
                onClick={handleEnabledToggle}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
                  enabled ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
                role='switch'
                aria-checked={enabled}
                title={enabled ? '停用排程' : '啟用排程'}>
                <span
                  aria-hidden='true'
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>

              {/* Magic Button */}
              <button
                onClick={openSmartDialog}
                title='智慧設定助手'>
                <img
                  src={magicIcon}
                  alt='Magic Icon'
                />
              </button>
            </div>
          </div>
        </div>

        {/* White content area */}
        <div className='bg-white p-4'>
          {/* 類型選擇 */}
          <div className='mb-4'>
            <label className='block text-sm text-gray-700 mb-2 font-bold'>
              類型
            </label>
            <div className='relative'>
              <select
                value={scheduleType}
                onChange={(e) => handleTypeChange(e.target.value)}
                className='w-full border border-gray-300 rounded p-2 text-sm bg-white appearance-none pr-8'>
                <option value='cron'>週期性</option>
                <option value='once'>一次性</option>
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

          {/* 週期性設定 */}
          {scheduleType === 'cron' && (
            <>
              {/* 頻率設定 */}
              <div className='mb-4'>
                <label className='block text-sm text-gray-700 mb-2 font-bold'>
                  頻率
                </label>

                {/* 整合的下拉選單 */}
                <div className='space-y-3'>
                  <select
                    value={getDropdownValue()}
                    onChange={handleFrequencySelectChange}
                    disabled={isLoadingScheduleConfigs}
                    className='w-full border border-gray-300 rounded p-2 text-sm bg-white'>
                    {/* 載入中狀態 */}
                    {isLoadingScheduleConfigs && (
                      <option>載入頻率選項中...</option>
                    )}

                    {/* 預設頻率選項 - 包含來自後端的所有選項 */}
                    {!isLoadingScheduleConfigs &&
                      presetScheduleConfigs.map((config) => (
                        <option
                          key={config.value}
                          value={config.cronExpression}
                          title={config.description}>
                          {config.label}
                        </option>
                      ))}
                  </select>

                  {/* 當選擇自訂表達式時顯示輸入框 */}
                  {frequencyMode === 'custom' && (
                    <div className='mt-3'>
                      <label className='block text-sm text-gray-700 mb-2 font-bold'>
                        進階表達式
                      </label>
                      <input
                        type='text'
                        value={cronExpression}
                        onChange={(e) =>
                          handleCronExpressionChange(e.target.value)
                        }
                        placeholder='* * * * *'
                        className='w-full border border-gray-300 rounded p-2 text-sm'
                      />
                      <div className='mt-1'>
                        <span className='text-xs text-gray-500'>
                          格式：分 時 日 月 週
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* 一次性設定 */}
          {scheduleType === 'once' && (
            <div className='mb-4'>
              <label className='block text-sm text-gray-700 mb-2 font-medium'>
                指定時間
              </label>
              <DateTimeSelector
                value={executeAt ? new Date(executeAt).getTime() : null}
                onChange={handleExecuteAtChange}
                placeholder='選擇執行時間'
                className='w-full'
                position='bottom-right' // 顯示在輸入框右下方
                offsetX={-10} // 稍微向左偏移
                offsetY={5} // 稍微向下偏移
              />
            </div>
          )}

          {/* 時區設定 */}
          <div className='mb-4'>
            <label className='block text-sm text-gray-700 mb-2 font-bold'>
              時區
            </label>
            <select
              value={timezone}
              onChange={(e) => handleTimezoneChange(e.target.value)}
              disabled={isLoadingTimezones}
              className='w-full border border-gray-300 rounded p-2 text-sm bg-white'>
              {isLoadingTimezones ? (
                <option>載入中...</option>
              ) : (
                timezoneOptions.map((tz) => (
                  <option
                    key={tz.value}
                    value={tz.value}>
                    {tz.label}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* 任務描述 */}
          <div className='mb-4'>
            <label className='block text-sm text-gray-700 mb-2 font-bold'>
              任務描述
            </label>
            <SelectableTextWrapper>
              <textarea
                value={description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                placeholder='輸入任務描述...'
                className='w-full border border-gray-300 rounded p-2 text-sm h-20 resize-none'
              />
            </SelectableTextWrapper>
          </div>
        </div>
      </div>

      {/* 智慧設定助手對話框  */}
      {showSmartDialog && (
        <div className='fixed inset-0 z-[9999]'>
          {/* 透明背景層，點擊時關閉對話框 */}
          <div
            className='absolute inset-0 bg-black bg-opacity-50 pointer-events-auto rounded-lg overflow-hidden'
            onClick={closeSmartDialog}
          />

          {/* 對話框內容 */}
          <div
            className='absolute -left-[250px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto border border-gray-200 z-10 w-[450px]'
            onClick={(e) => {
              e.stopPropagation();
            }}>
            {/* 標題欄 */}
            <div className='flex items-center justify-between p-4 border-b border-gray-200'>
              <div className='flex items-center'>
                <svg
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='mr-2 text-purple-600'>
                  <path d='M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z' />
                </svg>
                <h3 className='text-lg font-medium text-gray-900'>
                  智慧設定助手
                </h3>
              </div>
              <button
                onClick={closeSmartDialog}
                className='p-1 hover:bg-gray-100 rounded'>
                <svg
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'>
                  <line
                    x1='18'
                    y1='6'
                    x2='6'
                    y2='18'></line>
                  <line
                    x1='6'
                    y1='6'
                    x2='18'
                    y2='18'></line>
                </svg>
              </button>
            </div>

            {/* 內容區域 */}
            <div className='p-4 flex-1 overflow-y-auto'>
              <p className='text-sm text-gray-600 mb-4'>
                用自然語言描述您的需求，例如：
              </p>

              {/* 預設描述選項 */}
              {isLoadingDescriptions ? (
                <div className='mb-4 text-sm text-gray-500'>
                  載入預設選項中...
                </div>
              ) : (
                <div className='mb-4 space-y-2'>
                  {defaultDescriptions.map((desc, index) => (
                    <button
                      key={index}
                      type='button'
                      disabled={isGenerating}
                      onClick={() => selectDefaultDescription(desc.value)}
                      className='block w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors'>
                      "{desc.value}"
                    </button>
                  ))}
                </div>
              )}

              {/* 文字輸入框 */}
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder='請輸入您的需求...'
                disabled={isGenerating}
                className='w-full border border-gray-300 rounded p-3 text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
              />
            </div>

            {/* 底部操作區 */}
            <div className='p-4 border-t border-gray-200 bg-gray-50'>
              <div className='flex items-center justify-between'>
                {/* LLM 選擇 */}
                <div className='flex items-center space-x-2'>
                  <div className='relative'>
                    <select
                      value={selectedLlm}
                      onChange={(e) => setSelectedLlm(e.target.value)}
                      className={`border border-gray-300 rounded p-1 text-sm bg-white appearance-none pr-8
                        ${isLoadingModels ? 'opacity-70 cursor-wait' : ''} 
                        ${modelLoadError ? 'border-red-300' : ''}`}
                      disabled={isLoadingModels || isGenerating}>
                      {llmOptions.map((llm) => (
                        <option
                          key={llm.value}
                          value={llm.value}>
                          {llm.label}
                        </option>
                      ))}
                    </select>
                    {isLoadingModels ? (
                      <div className='absolute right-1 top-1/2 transform -translate-y-1/2'>
                        <div className='animate-spin rounded-full h-3 w-3 border-b-2 border-gray-500'></div>
                      </div>
                    ) : (
                      <div className='absolute inset-y-0 right-0 flex items-center px-1 pointer-events-none'>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          width='12'
                          height='12'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='currentColor'
                          strokeWidth='2'
                          strokeLinecap='round'
                          strokeLinejoin='round'>
                          <polyline points='6 9 12 15 18 9'></polyline>
                        </svg>
                      </div>
                    )}
                  </div>
                  {modelLoadError && (
                    <div className='flex items-center space-x-1'>
                      <span className='text-xs text-red-500'>載入失敗</span>
                      <button
                        onClick={loadLlmOptions}
                        className='text-xs text-blue-500 hover:text-blue-700'
                        title='重新載入'>
                        ↻
                      </button>
                    </div>
                  )}
                </div>

                {/* 生成按鈕 */}
                <button
                  onClick={generateScheduleSettings}
                  disabled={isGenerating || !userInput.trim()}
                  className='bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 min-w-[120px] whitespace-nowrap'>
                  <span>{isGenerating ? '生成中...' : '生成設定'}</span>
                  {isGenerating && (
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Output Handle */}
      <Handle
        type='source'
        position={Position.Right}
        id='trigger'
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
    </>
  );
};

export default memo(ScheduleTriggerNode);
