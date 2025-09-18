import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import IconBase from '../icons/IconBase';
import AutoResizeTextarea from '../text/AutoResizeText';
import { aimService, externalService } from '../../services/index';
import RefinePromptOverlay from '../common/RefinePromptOverlay';
import { PromptGeneratorService } from '../../services/PromptGeneratorService';
import promptIcon from '../../assets/prompt-generator.svg';
import promptDisabledIcon from '../../assets/prompt-generator-disabled.svg';
import { formatNodeTitle } from '../../utils/nodeUtils';

const QOCAAimNode = ({ data, isConnectable, id }) => {
  // 狀態管理 - 根據新的參數結構
  const [selectedAim, setSelectedAim] = useState(data?.aim_ml_id?.data || '');
  const [trainingId, setTrainingId] = useState(data?.training_id?.data || 0);
  const [simulatorId, setSimulatorId] = useState(
    data?.simulator_id?.data || ''
  );
  const [enableExplain, setEnableExplain] = useState(
    data?.enable_explain?.data ?? true
  ); // 預設為 true
  const [promptText, setPromptText] = useState(data?.prompt?.data || '');
  const [llmId, setLlmId] = useState(data?.llm_id?.data || 0);

  // 新增連結密鑰相關狀態
  const [externalServiceConfigId, setExternalServiceConfigId] = useState(
    data?.external_service_config_id?.data ||
      data?.externalServiceConfigId ||
      ''
  );
  const [externalServiceOptions, setExternalServiceOptions] = useState([]);
  const [isLoadingExternalServices, setIsLoadingExternalServices] =
    useState(false);

  // Refine Prompt 相關狀態
  const [showRefinePrompt, setShowRefinePrompt] = useState(false);

  // 模型欄位資訊狀態
  const [modelFieldsInfo, setModelFieldsInfo] = useState(
    data?.model_fields_info?.data || {}
  );

  const [aimOptions, setAimOptions] = useState([]);
  const [llmVisionOptions, setLlmVisionOptions] = useState([]);
  const [isLoadingAimOptions, setIsLoadingAimOptions] = useState(false);
  const [isLoadingLlmVisionOptions, setIsLoadingLlmVisionOptions] =
    useState(false);

  // 欄位資訊載入狀態
  const [isLoadingFieldInfo, setIsLoadingFieldInfo] = useState(false);

  // 防止重複更新的標記
  const isUpdating = useRef(false);
  // 防止重複載入的標記
  const hasInitializedAim = useRef(false);
  const hasInitializedLlmVision = useRef(false);

  // 關鍵IME 和用戶輸入狀態追蹤
  const isComposingRef = useRef(false);
  const updateTimeoutRef = useRef(null);
  const lastExternalValueRef = useRef(data?.prompt?.data || '');
  const isUserInputRef = useRef(false); // 追蹤是否為用戶輸入

  // 載入外部服務配置選項（連結密鑰）
  const loadExternalServiceOptions = useCallback(async () => {
    if (isLoadingExternalServices) {
      return;
    }

    setIsLoadingExternalServices(true);

    try {
      const options = await externalService.getExternalServiceConfigs('AIM');
      if (options && options.length > 0) {
        setExternalServiceOptions(options);
      } else {
        console.warn('未獲取到 AIM 外部服務配置或配置列表為空');
        setExternalServiceOptions([]);
      }
    } catch (error) {
      console.error('載入 AIM 外部服務配置失敗:', error);
      setExternalServiceOptions([]);
    } finally {
      setIsLoadingExternalServices(false);
    }
  }, []);

  // 組件載入時獲取所有必要資料
  useEffect(() => {
    loadExternalServiceOptions();
    loadLlmVisionOptions();
  }, []);

  // 當選擇連結密鑰時，重新載入 AIM 模型
  useEffect(() => {
    if (externalServiceConfigId) {
      // 清除現有的 AIM 模型快取
      hasInitializedAim.current = false;

      // 使用新的 external_service_config_id 重新載入 AIM 模型
      loadAimOptionsWithConfigId();
    } else {
      // 如果沒有選擇連結密鑰，清空 AIM 選項
      setAimOptions([]);
    }
  }, [externalServiceConfigId]);

  // 載入帶 config_id 的 AIM 模型選項
  const loadAimOptionsWithConfigId = useCallback(async () => {
    if (isLoadingAimOptions || !externalServiceConfigId) {
      if (!externalServiceConfigId) {
        console.log('未選擇連結密鑰，無法載入 AIM 模型');
        setAimOptions([]);
      }
      return;
    }

    if (hasInitializedAim.current) {
      console.log('AIM 選項已初始化，跳過重複載入');
      return;
    }

    hasInitializedAim.current = true;
    setIsLoadingAimOptions(true);

    try {
      const options = await aimService.getAIMModelOptions(
        externalServiceConfigId
      );

      if (options && options.length > 0) {
        setAimOptions(options);
      } else {
        console.warn('未獲取到 AIM 模型選項或選項列表為空');
        setAimOptions([]);
      }
    } catch (error) {
      console.error('載入 AIM 模型選項失敗:', error);
      setAimOptions([]);
      hasInitializedAim.current = false; // 失敗時重置，允許重試
    } finally {
      setIsLoadingAimOptions(false);
    }
  }, [externalServiceConfigId]);

  // 載入 LLM Vision 模型選項
  const loadLlmVisionOptions = useCallback(async () => {
    // 防止重複載入的完整檢查
    if (isLoadingLlmVisionOptions || hasInitializedLlmVision.current) {
      console.log('LLM Vision 選項已在載入中或已初始化，跳過重複載入');
      return;
    }

    hasInitializedLlmVision.current = true;
    setIsLoadingLlmVisionOptions(true);

    try {
      console.log('開始載入 LLM Vision 模型選項...');
      const options = await aimService.getLLMVisionModelOptions();
      console.log('載入的 LLM Vision 模型選項:', options);

      if (options && options.length > 0) {
        setLlmVisionOptions(options);
      } else {
        console.warn('未獲取到 LLM Vision 模型選項或選項列表為空，設置空陣列');
        setLlmVisionOptions([]);
      }
    } catch (error) {
      console.error('載入 LLM Vision 模型選項失敗:', error);
      setLlmVisionOptions([]);
      hasInitializedLlmVision.current = false; // 失敗時重置，允許重試

      if (typeof window !== 'undefined' && window.notify) {
        window.notify({
          message: '載入 LLM Vision 模型選項失敗',
          type: 'error',
          duration: 3000
        });
      }
    } finally {
      setIsLoadingLlmVisionOptions(false);
    }
  }, []);

  // 載入模型欄位資訊的函數（帶 config_id）
  const loadModelFieldsInfo = useCallback(
    async (targetTrainingId) => {
      if (!targetTrainingId || targetTrainingId === 0) {
        console.log('training_id 無效，清空欄位資訊');
        setModelFieldsInfo({});
        updateParentState('model_fields_info', { data: {} });
        return;
      }

      setIsLoadingFieldInfo(true);

      try {
        const fieldInfo = await aimService.getAIMFieldInfo(
          targetTrainingId,
          externalServiceConfigId
        );

        setModelFieldsInfo(fieldInfo);
        updateParentState('model_fields_info', { data: fieldInfo });
      } catch (error) {
        console.error('載入模型欄位資訊失敗:', error);
        setModelFieldsInfo({});
        updateParentState('model_fields_info', { data: {} });
      } finally {
        setIsLoadingFieldInfo(false);
      }
    },
    [externalServiceConfigId]
  );

  // 輸出類型（當解釋功能開啟時）
  const outputHandles = enableExplain ? ['text', 'images'] : ['text'];

  // 統一更新父組件狀態的函數
  const updateParentState = useCallback(
    (key, value) => {
      console.log(`updateParentState 被調用: ${key}`, value);
      if (data && typeof data.updateNodeData === 'function') {
        // 映射到正確的屬性名
        const propertyMap = {
          aim_ml_id: 'selectedAim',
          training_id: 'trainingId',
          simulator_id: 'simulatorId',
          enable_explain: 'enableExplain',
          llm_id: 'llmId',
          prompt: 'promptText',
          model_fields_info: 'modelFieldsInfo',
          external_service_config_id: 'externalServiceConfigId'
        };

        const propertyName = propertyMap[key] || key;
        const propertyValue = value.data !== undefined ? value.data : value;

        data.updateNodeData(propertyName, propertyValue);
        console.log(`更新屬性 ${propertyName}:`, propertyValue);
      } else {
        console.error('data.updateNodeData 不存在或不是函數', data);
      }
    },
    [data]
  );

  // 同步外部資料變更
  useEffect(() => {
    if (isUpdating.current) {
      console.log('正在更新中，跳過同步');
      return;
    }

    let hasChanges = false;

    // 同步 externalServiceConfigId
    if (
      data?.externalServiceConfigId !== undefined &&
      data.externalServiceConfigId !== externalServiceConfigId
    ) {
      setExternalServiceConfigId(data.externalServiceConfigId);
      hasChanges = true;
    }

    // 只在數據真正不同時才同步
    if (data?.selectedAim !== undefined && data.selectedAim !== selectedAim) {
      console.log('同步 selectedAim:', data.selectedAim, '當前:', selectedAim);
      setSelectedAim(data.selectedAim);
      hasChanges = true;
    }

    if (data?.trainingId !== undefined && data.trainingId !== trainingId) {
      console.log('同步 trainingId:', data.trainingId, '當前:', trainingId);
      setTrainingId(data.trainingId);
      hasChanges = true;
    }

    if (data?.simulatorId !== undefined && data.simulatorId !== simulatorId) {
      console.log('同步 simulatorId:', data.simulatorId, '當前:', simulatorId);
      setSimulatorId(data.simulatorId);
      hasChanges = true;
    }

    if (
      data?.enableExplain !== undefined &&
      data.enableExplain !== enableExplain
    ) {
      console.log(
        '同步 enableExplain:',
        data.enableExplain,
        '當前:',
        enableExplain
      );
      setEnableExplain(data.enableExplain);
      hasChanges = true;
    }

    // 同步 promptText，避免覆蓋用戶輸入
    if (
      data?.promptText !== undefined &&
      data.promptText !== lastExternalValueRef.current &&
      !isComposingRef.current &&
      !isUserInputRef.current
    ) {
      console.log('同步 promptText:', data.promptText, '當前:', promptText);
      setPromptText(data.promptText);
      lastExternalValueRef.current = data.promptText;
      hasChanges = true;
    }

    if (data?.llmId !== undefined && data.llmId !== llmId) {
      console.log('同步 llmId:', data.llmId, '當前:', llmId);
      setLlmId(data.llmId);
      hasChanges = true;
    }

    // 同步 modelFieldsInfo
    if (
      data?.modelFieldsInfo !== undefined &&
      data.modelFieldsInfo !== modelFieldsInfo
    ) {
      console.log(
        '同步 modelFieldsInfo:',
        data.modelFieldsInfo,
        '當前:',
        modelFieldsInfo
      );
      setModelFieldsInfo(data.modelFieldsInfo);
      hasChanges = true;
    }

    if (hasChanges) {
      console.log('檢測到數據變化，已同步');
    }
  }, [
    data?.externalServiceConfigId,
    data?.selectedAim,
    data?.trainingId,
    data?.simulatorId,
    data?.enableExplain,
    data?.promptText,
    data?.llmId,
    data?.modelFieldsInfo,
    externalServiceConfigId,
    selectedAim,
    trainingId,
    simulatorId,
    enableExplain,
    promptText,
    llmId,
    modelFieldsInfo
  ]);

  // 處理連結密鑰選擇變更
  const handleExternalServiceChange = useCallback(
    (configId) => {
      console.log('選擇連結密鑰:', configId);

      isUpdating.current = true;

      try {
        setExternalServiceConfigId(configId);
        updateParentState('external_service_config_id', {
          data: parseInt(configId) || ''
        });

        // 清空現有的 AIM 模型選擇
        setSelectedAim('');
        setTrainingId(0);
        setSimulatorId('');
        setModelFieldsInfo('');

        updateParentState('aim_ml_id', { data: '' });
        updateParentState('training_id', { data: 0 });
        updateParentState('simulator_id', { data: '' });
        updateParentState('model_fields_info', { data: '' });

        // 重置載入標記，允許重新載入 AIM 模型
        hasInitializedAim.current = false;
      } finally {
        setTimeout(() => {
          isUpdating.current = false;
        }, 300);
      }
    },
    [updateParentState]
  );

  // 處理 AIM 選擇變更
  const handleAimChange = useCallback(
    async (aimValue) => {
      console.log('handleAimChange:', selectedAim, '->', aimValue);

      // 設置更新標記，防止同步衝突
      isUpdating.current = true;

      try {
        setSelectedAim(aimValue);
        const selectedModel = aimOptions.find(
          (option) => option.value === aimValue
        );
        console.log('選中的模型:', selectedModel);

        if (selectedModel) {
          // 批量更新
          updateParentState('aim_ml_id', { data: aimValue });
          updateParentState('training_id', {
            data: selectedModel.training_id || 0
          });
          updateParentState('simulator_id', {
            data: selectedModel.simulator_id || ''
          });

          // 更新本地狀態
          setTrainingId(selectedModel.training_id || 0);
          setSimulatorId(selectedModel.simulator_id || '');

          // 載入模型欄位資訊
          if (selectedModel.training_id && selectedModel.training_id !== 0) {
            console.log(
              `載入模型欄位資訊 (training_id: ${selectedModel.training_id})`
            );
            await loadModelFieldsInfo(selectedModel.training_id);
          } else {
            console.log('training_id 無效，清空欄位資訊');
            setModelFieldsInfo('');
            updateParentState('model_fields_info', { data: '' });
          }

          console.log('AIM 模型批量更新完成');
        }
      } finally {
        // 延遲重置標記
        setTimeout(() => {
          isUpdating.current = false;
          console.log('AIM 模型更新完成');
        }, 300);
      }
    },
    [selectedAim, aimOptions, updateParentState, loadModelFieldsInfo]
  );

  // 處理解釋功能開關
  const handleEnableExplainToggle = useCallback(() => {
    const newValue = !enableExplain;
    console.log('handleEnableExplainToggle:', enableExplain, '->', newValue);

    // 設置更新標記，防止同步衝突
    isUpdating.current = true;

    try {
      setEnableExplain(newValue);
      updateParentState('enable_explain', { data: newValue });
    } finally {
      // 延遲重置標記
      setTimeout(() => {
        isUpdating.current = false;
        console.log('enableExplain 更新完成');
      }, 300);
    }
  }, [enableExplain, updateParentState]);

  // 處理 LLM 選擇變更
  const handleLlmChange = useCallback(
    (llmValue) => {
      console.log('handleLlmChange:', llmId, '->', llmValue);
      const numericValue = parseInt(llmValue);

      // 設置更新標記，防止同步衝突
      isUpdating.current = true;

      try {
        setLlmId(numericValue);
        updateParentState('llm_id', { data: numericValue });
      } finally {
        // 延遲重置標記
        setTimeout(() => {
          isUpdating.current = false;
          console.log('LLM 模型更新完成');
        }, 300);
      }
    },
    [llmId, updateParentState]
  );

  // 處理提示文字變更 - 支援 IME 和刪除操作
  const handlePromptChange = useCallback(
    (e) => {
      const value = e.target.value;

      // 標記為用戶輸入
      isUserInputRef.current = true;

      // 立即更新本地狀態
      setPromptText(value);
      lastExternalValueRef.current = value; // 同步記錄

      // 清除之前的更新計時器
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      // 如果不是在組合狀態，延遲更新父組件
      if (!isComposingRef.current) {
        updateTimeoutRef.current = setTimeout(() => {
          updateParentState('prompt', {
            type: 'string',
            data: value,
            node_id: data?.id || ''
          });

          // 重置用戶輸入標記
          setTimeout(() => {
            isUserInputRef.current = false;
          }, 100);
        }, 150); // 稍微增加延遲以確保操作完成
      }
    },
    [updateParentState, data?.id]
  );

  // 關鍵IME 組合開始處理
  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
    isUserInputRef.current = true;

    // 清除任何待執行的更新
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
      updateTimeoutRef.current = null;
    }
  }, []);

  // IME 組合結束處理
  const handleCompositionEnd = useCallback(
    (e) => {
      isComposingRef.current = false;

      const finalText = e.target.value;

      // 確保狀態同步
      setPromptText(finalText);
      lastExternalValueRef.current = finalText;

      // 立即更新父組件
      updateParentState('prompt', {
        type: 'string',
        data: finalText,
        node_id: data?.id || ''
      });

      // 延遲重置用戶輸入標記
      setTimeout(() => {
        isUserInputRef.current = false;
      }, 200);
    },
    [updateParentState, data?.id]
  );

  // 關鍵處理鍵盤事件，特別是刪除操作
  const handleKeyDown = useCallback((e) => {
    // 對於刪除操作，立即標記為用戶輸入
    if (e.key === 'Backspace' || e.key === 'Delete') {
      isUserInputRef.current = true;

      // 延遲重置標記
      setTimeout(() => {
        isUserInputRef.current = false;
      }, 300);
    }
  }, []);

  // 處理 Refine Prompt 按鈕點擊
  const handleRefinePromptClick = useCallback(() => {
    // 驗證參數
    const validation = PromptGeneratorService.validateParameters(
      llmId,
      promptText
    );

    if (!validation.isValid) {
      if (typeof window !== 'undefined' && window.notify) {
        window.notify({
          message: validation.errors[0],
          type: 'error',
          duration: 3000
        });
      }
      return;
    }

    setShowRefinePrompt(true);
  }, [llmId, promptText]);

  // 處理優化 Prompt 應用
  const handleOptimizedPromptApply = useCallback(
    (optimizedPrompt) => {
      // 將優化後的 prompt 填入文字區域
      setPromptText(optimizedPrompt);
      lastExternalValueRef.current = optimizedPrompt;
      updateParentState('prompt', {
        type: 'string',
        data: optimizedPrompt,
        node_id: data?.id || ''
      });

      console.log('優化後的 Prompt 已應用:', optimizedPrompt);

      // 顯示成功通知
      if (typeof window !== 'undefined' && window.notify) {
        window.notify({
          message: '優化 Prompt 已應用',
          type: 'success',
          duration: 2000
        });
      }
    },
    [updateParentState, data?.id]
  );

  // 處理複製
  const handleOptimizedPromptCopy = useCallback(() => {
    console.log('優化後的 Prompt 已複製到剪貼板');
  }, []);

  // 關閉 Refine Prompt 對話框
  const closeRefinePrompt = useCallback(() => {
    setShowRefinePrompt(false);
  }, []);

  // 清理計時器
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  // 計算標籤寬度
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

  // 獲取分群的 LLM Vision 選項
  const getGroupedLlmVisionOptions = useCallback(() => {
    if (!llmVisionOptions || llmVisionOptions.length === 0) {
      return {};
    }

    return llmVisionOptions.reduce((groups, option) => {
      const provider = option.provider || 'Other';
      if (!groups[provider]) {
        groups[provider] = [];
      }
      groups[provider].push(option);
      return groups;
    }, {});
  }, [llmVisionOptions]);

  // 渲染分群的 LLM Vision 選項
  const renderGroupedLlmVisionOptions = useCallback(() => {
    const groupedOptions = getGroupedLlmVisionOptions();
    const providers = Object.keys(groupedOptions).sort();

    return providers.map((provider) => (
      <optgroup
        key={provider}
        label={provider}>
        {groupedOptions[provider].map((option) => (
          <option
            key={option.value}
            value={option.value}
            title={option.description || ''}>
            {option.label}
          </option>
        ))}
      </optgroup>
    ));
  }, [getGroupedLlmVisionOptions]);

  return (
    <>
      {/* 左側輸入 Handle */}
      <Handle
        type='target'
        position={Position.Left}
        id='input'
        style={{
          background: '#e5e7eb',
          border: '1px solid #D3D3D3',
          width: '12px',
          height: '12px',
          left: '-6px',
          top: '50%',
          transform: 'translateY(-50%)'
        }}
        isConnectable={isConnectable}
      />

      <div className='rounded-lg shadow-md overflow-hidden w-80'>
        {/* Header section */}
        <div className='bg-gray-100 rounded-t-lg p-4 overflow-hidden'>
          <div className='flex items-center'>
            <div className='w-6 h-6 flex items-center justify-center text-white mr-2'>
              <IconBase
                type='aim'
                className='text-teal-600'
              />
            </div>
            <span className='font-medium'>
              {formatNodeTitle('QOCA aim', id)}
            </span>
          </div>
        </div>

        {/* White content area */}
        <div className='bg-white p-4 space-y-4'>
          {/* 連結密鑰選擇 */}
          <div>
            <label className='block text-sm text-gray-700 mb-2 font-medium'>
              連結密鑰
            </label>
            <div className='relative'>
              <select
                className={`w-full border border-gray-300 rounded p-2 text-sm appearance-none bg-white pr-8
                    ${showRefinePrompt ? 'opacity-50 cursor-not-allowed' : ''}`}
                value={externalServiceConfigId}
                onChange={(e) => handleExternalServiceChange(e.target.value)}
                disabled={isLoadingExternalServices || showRefinePrompt}>
                <option value=''>
                  {isLoadingExternalServices ? '載入中...' : '選擇連結密鑰'}
                </option>
                {externalServiceOptions.map((option) => (
                  <option
                    key={option.id}
                    value={option.id}>
                    {option.name}
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

          {/* AIM 模型選擇 - 需要先選擇連結密鑰 */}
          <div>
            <label className='block text-sm text-gray-700 mb-2 font-medium'>
              ML Model
            </label>
            <div className='relative'>
              <select
                className={`w-full border border-gray-300 rounded p-2 text-sm appearance-none bg-white pr-8
                    ${
                      showRefinePrompt || !externalServiceConfigId
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                value={selectedAim}
                onChange={(e) => handleAimChange(e.target.value)}
                disabled={
                  isLoadingAimOptions ||
                  showRefinePrompt ||
                  !externalServiceConfigId
                }>
                <option value=''>
                  {!externalServiceConfigId
                    ? '請先選擇連結密鑰'
                    : isLoadingAimOptions
                    ? '載入中...'
                    : '選擇 ML 模型'}
                </option>
                {aimOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}>
                    {option.label}
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

          {/* 解釋功能開關 */}
          <div className='flex items-center justify-between'>
            <label className='text-sm text-gray-700 font-medium'>
              結果解釋
            </label>
            <div
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                enableExplain ? 'bg-cyan-500' : 'bg-gray-200'
              } ${
                showRefinePrompt
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer'
              }`}
              onClick={
                showRefinePrompt ? undefined : handleEnableExplainToggle
              }>
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  enableExplain ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </div>
          </div>

          {/* 當解釋功能開啟時顯示的內容 */}
          {enableExplain && (
            <>
              {/* LLM Vision 選擇 */}
              <div>
                <label className='block text-sm text-gray-700 mb-2 font-bold'>
                  LLM Vision 模型
                </label>
                <div className='relative'>
                  <select
                    className={`w-full border border-gray-300 rounded p-2 text-sm appearance-none bg-white pr-8
                        ${
                          showRefinePrompt
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                        }`}
                    value={llmId}
                    onChange={(e) => handleLlmChange(e.target.value)}
                    disabled={isLoadingLlmVisionOptions || showRefinePrompt}>
                    <option value=''>
                      {isLoadingLlmVisionOptions
                        ? '載入中...'
                        : '選擇 LLM Vision 模型'}
                    </option>
                    {renderGroupedLlmVisionOptions()}
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

              {/* Prompt 輸入 */}
              <div>
                <div className='flex items-center justify-between mb-1'>
                  <label className='block text-sm text-gray-700 font-bold'>
                    Prompt
                  </label>
                  {/* Refine Prompt 按鈕 */}
                  <button
                    onClick={handleRefinePromptClick}
                    disabled={
                      !promptText || promptText.trim().length === 0 || !llmId
                    }
                    className='group w-6 h-6 disabled:cursor-not-allowed rounded flex items-center justify-center transition-colors'
                    title='Refine prompt'>
                    <img
                      src={promptIcon}
                      width={18}
                      height={18}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                      }}
                      className='max-w-full max-h-full object-contain group-disabled:hidden'
                    />
                    <img
                      src={promptDisabledIcon}
                      width={18}
                      height={18}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                      }}
                      className='max-w-full max-h-full object-contain hidden group-disabled:block'
                    />
                  </button>
                </div>
                <div className='relative'>
                  <AutoResizeTextarea
                    value={promptText}
                    onChange={handlePromptChange}
                    onCompositionStart={handleCompositionStart}
                    onCompositionEnd={handleCompositionEnd}
                    onKeyDown={handleKeyDown}
                    placeholder='Type your prompt here.'
                    className='w-full border border-gray-300 rounded p-2 text-sm min-h-[80px] pr-10'
                    disabled={showRefinePrompt}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 右側輸出標籤區域 - 只在解釋功能開啟時顯示 */}
      {enableExplain && (
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
                  border: '1px solid #d1d5db',
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
                className='inline-flex items-center px-3 py-1 rounded text-xs font-bold text-white whitespace-nowrap select-none'
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

      {/* ReactFlow Handle - 只在解釋功能開啟時顯示 */}
      {outputHandles.map((handleType, index) => {
        const labelWidth = calculateLabelWidth(handleType);
        const totalWidth = labelWidth + 8;
        const style = enableExplain
          ? {
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
            }
          : {
              background: '#e5e7eb',
              border: '1px solid #D3D3D3',
              width: '12px',
              height: '12px',
              right: '-6px'
            };
        return (
          <Handle
            key={handleType}
            type='source'
            position={Position.Right}
            id={handleType}
            style={style}
            isConnectable={isConnectable}
          />
        );
      })}

      {/* Refine Prompt 覆蓋層 */}
      <RefinePromptOverlay
        isOpen={showRefinePrompt}
        onClose={closeRefinePrompt}
        originalPrompt={promptText}
        llmId={llmId}
        onOptimizedPromptApply={handleOptimizedPromptApply}
        onOptimizedPromptCopy={handleOptimizedPromptCopy}
        nodePosition={{ x: data?.position?.x || 0, y: data?.position?.y || 0 }}
        offsetX={330}
        offsetY={-150}
      />
    </>
  );
};

export default memo(QOCAAimNode);
