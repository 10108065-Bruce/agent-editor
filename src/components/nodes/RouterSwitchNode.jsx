import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import { Handle, Position, useUpdateNodeInternals } from 'reactflow';
import IconBase from '../icons/IconBase';
import { llmService } from '../../services/index';
import AddIcon from '../icons/AddIcon';
import DeleteIcon from '../icons/DeleteIcon';
import dragIcon from '../../assets/icon-drag-handle-line.svg';
import AutoResizeTextarea from '../../components/text/AutoResizeText';
import { formatNodeTitle } from '../../utils/nodeUtils';

const RouterSwitchNode = ({ data, isConnectable, id }) => {
  const updateNodeInternals = useUpdateNodeInternals();
  // 狀態管理
  const [selectedModelId, setSelectedModelId] = useState(data?.llm_id || '1');
  const [routers, setRouters] = useState(
    data?.routers || [
      {
        router_id: 'router0',
        router_name: 'Router',
        ai_condition: '',
        connection_id: `router_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`
      }
    ]
  );
  const [modelOptions, setModelOptions] = useState([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [isScrollContainerHovered, setIsScrollContainerHovered] =
    useState(false);

  // 使用 ref 來防止重複執行
  const isInitialized = useRef(false);
  const isUpdating = useRef(false);
  const lastModelOptionsRef = useRef([]);
  const scrollContainerRef = useRef(null);

  // 統一更新父組件狀態的輔助函數
  const updateParentState = useCallback(
    (key, value) => {
      console.log('嘗試更新父組件狀態:', key, value);

      if (isUpdating.current) {
        console.log('更新被阻擋：正在更新中');
        return false;
      }

      if (data && typeof data.updateNodeData === 'function') {
        isUpdating.current = true;
        try {
          console.log('執行父組件更新:', key);
          data.updateNodeData(key, value);
          console.log('父組件更新成功');
          return true;
        } catch (error) {
          console.error('父組件更新失敗:', error);
          return false;
        } finally {
          // 減少延遲時間，避免阻擋後續更新
          setTimeout(() => {
            isUpdating.current = false;
            console.log('更新狀態重置');
          }, 50);
        }
      } else {
        console.warn('無法更新父組件：data 或 updateNodeData 不存在');
      }
      return false;
    },
    [data]
  );

  // 載入模型選項 - 添加防止重複渲染的邏輯
  const loadModelOptions = useCallback(async () => {
    if (isLoadingModels) return;

    setIsLoadingModels(true);
    try {
      const options = await llmService.getFunctionCallingModelOptions(true);

      // 檢查選項是否真的有變化，避免不必要的更新
      const optionsString = JSON.stringify(options);
      const lastOptionsString = JSON.stringify(lastModelOptionsRef.current);

      if (optionsString === lastOptionsString) {
        return;
      }

      if (options && options.length > 0) {
        setModelOptions(options);
        lastModelOptionsRef.current = options;

        // 檢查當前選中的模型是否在選項中
        const isCurrentModelValid = options.some(
          (opt) => opt.value === selectedModelId
        );

        if (!isCurrentModelValid) {
          // 如果當前模型不在選項中，選擇第一個或默認模型
          let defaultModel = options[0].value;
          const defaultOption = options.find((opt) => opt.isDefault);
          if (defaultOption) {
            defaultModel = defaultOption.value;
          }
          setSelectedModelId(defaultModel);
          updateParentState('llm_id', defaultModel);
        }
      } else {
        // 更新 fallback 選項為 Function Calling 模型
        const fallbackOptions = [
          {
            value: '15',
            label: 'GPT-5 (預設)',
            description:
              'GPT-5 is our flagship model for coding, reasoning, and agentic tasks across domains.',
            provider: 'AZURE_OPENAI'
          },
          {
            value: '17',
            label: 'GPT-5 mini (預設)',
            description:
              'GPT-5 mini is a faster, more cost-efficient version of GPT-5.',
            provider: 'AZURE_OPENAI'
          }
        ];
        setModelOptions(fallbackOptions);
        lastModelOptionsRef.current = fallbackOptions;
      }
    } catch (error) {
      console.error('載入模型選項失敗:', error);

      if (
        error.message &&
        (error.message.includes('已有進行中的LLM模型請求') ||
          error.message.includes('進行中的請求') ||
          error.message.includes('使用相同請求'))
      ) {
        console.log('檢測到進行中的模型請求，跳過錯誤通知');
        return;
      }

      if (typeof window !== 'undefined' && window.notify) {
        window.notify({
          message: '載入模型選項失敗',
          type: 'error',
          duration: 3000
        });
      }

      const fallbackOptions = [
        {
          value: '15',
          label: 'GPT-5 (預設)',
          description:
            'GPT-5 is our flagship model for coding, reasoning, and agentic tasks across domains.',
          provider: 'AZURE_OPENAI'
        },
        {
          value: '17',
          label: 'GPT-5 mini (預設)',
          description:
            'GPT-5 mini is a faster, more cost-efficient version of GPT-5.',
          provider: 'AZURE_OPENAI'
        }
      ];
      setModelOptions(fallbackOptions);
      lastModelOptionsRef.current = fallbackOptions;
    } finally {
      setIsLoadingModels(false);
    }
  }, [selectedModelId, updateParentState]);

  // 組件初始化
  useEffect(() => {
    if (!isInitialized.current) {
      loadModelOptions();
      isInitialized.current = true;
    }
  }, [loadModelOptions]);

  // 滾輪事件處理 - 參考 AutoResizeText 的方法
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleWheelCapture = (e) => {
      if (
        isScrollContainerHovered &&
        (e.target === scrollContainer || scrollContainer.contains(e.target))
      ) {
        // 在滾動容器中滾動時，阻止事件冒泡以防止ReactFlow縮放
        e.stopPropagation();

        // 檢查是否到達滾動邊界
        const isAtTop = scrollContainer.scrollTop <= 0;
        const isAtBottom =
          Math.abs(
            scrollContainer.scrollTop +
              scrollContainer.clientHeight -
              scrollContainer.scrollHeight
          ) <= 1;

        // 如果在邊界嘗試繼續滾動，阻止默認行為以防止頁面滾動
        if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
          e.preventDefault();
        }
      }
    };

    document.addEventListener('wheel', handleWheelCapture, {
      passive: false,
      capture: true
    });

    return () => {
      document.removeEventListener('wheel', handleWheelCapture, {
        passive: false,
        capture: true
      });
    };
  }, [isScrollContainerHovered]);

  // 同步父組件數據
  useEffect(() => {
    if (isUpdating.current) return;

    let hasChanges = false;

    if (data?.llm_id !== undefined && data.llm_id !== selectedModelId) {
      setSelectedModelId(data.llm_id);
      hasChanges = true;
    }

    if (data?.routers !== undefined) {
      const dataRoutersString = JSON.stringify(data.routers);
      const currentRoutersString = JSON.stringify(routers);

      if (dataRoutersString !== currentRoutersString) {
        setRouters(data.routers);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      console.log('RouterSwitchNode 數據同步完成');
    }
  }, [data?.llm_id, data?.routers]); // 移除 selectedModelId 和 routers 依賴，避免循環

  // 處理模型變更
  const handleModelChange = useCallback(
    (modelId) => {
      setSelectedModelId(modelId);
      updateParentState('llm_id', modelId);
    },
    [updateParentState]
  );

  // 更新 routers 到父組件
  const updateRoutersToParent = useCallback(
    (newRouters) => {
      const routersWithOther = [...newRouters];

      const hasOtherRouter = routersWithOther.some(
        (router) => router.router_id === 'default_router'
      );
      if (!hasOtherRouter) {
        routersWithOther.push({
          router_id: 'default_router',
          router_name: 'Other',
          ai_condition: ''
        });
      }

      console.log('更新 routers 到父組件:', routersWithOther);
      setRouters(routersWithOther);
      updateParentState('routers', routersWithOther);

      // 立即通知 ReactFlow 重新計算這個節點的內部結構
      setTimeout(() => {
        updateNodeInternals(id);
      }, 0);

      // // 🔧 保險起見，再觸發一次
      // setTimeout(() => {
      //   updateNodeInternals(id);
      // }, 100);
    },
    [updateParentState, updateNodeInternals, id]
  );

  // Calculate otherRouters early to avoid "before initialization" error
  const otherRouters = routers.filter((r) => r.router_id !== 'default_router');

  // 新增 router - 修改版本，避免名稱重複
  const addRouter = useCallback(() => {
    if (otherRouters.length >= 8) {
      if (typeof window !== 'undefined' && window.notify) {
        window.notify({
          message: '最多只能添加 8 個 Router',
          type: 'warning',
          duration: 3000
        });
      }
      return;
    }

    // 找到目前 router_id 中的最大數字
    let maxRouterId = -1;
    otherRouters.forEach((router) => {
      const match = router.router_id.match(/^router(\d+)$/);
      if (match) {
        const routerNum = parseInt(match[1], 10);
        if (routerNum > maxRouterId) {
          maxRouterId = routerNum;
        }
      }
    });

    // 新的 router_id 使用最大數字+1
    const newRouterId = maxRouterId + 1;

    // 找到下一個可用的 router 名稱編號
    const existingNames = otherRouters.map((router) => router.router_name);
    let nextNumber = 1;

    // 從 1 開始檢查，找到第一個不存在的 Router 編號
    while (existingNames.includes(`Router ${nextNumber}`)) {
      nextNumber++;
    }

    // 生成獨立的連線識別 ID (使用時間戳確保唯一性)
    const connectionId = `router_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const newRouter = {
      router_id: `router${newRouterId}`,
      router_name: `Router ${nextNumber}`,
      ai_condition: '',
      connection_id: connectionId // 新增獨立的連線識別 ID
    };

    const newRouters = [...otherRouters, newRouter];
    updateRoutersToParent(newRouters);
  }, [otherRouters, updateRoutersToParent]);

  //  deleteRouter 函數 - 保持原有 router_id
  const deleteRouter = useCallback(
    (routerIndex) => {
      if (otherRouters.length <= 1) {
        if (typeof window !== 'undefined' && window.notify) {
          window.notify({
            message: '至少需要保留一個 Router',
            type: 'warning',
            duration: 3000
          });
        }
        return;
      }

      const routerToDelete = otherRouters[routerIndex];
      const handleIdToDelete = routerToDelete.router_id;

      // 在刪除 router 前先斷開所有使用此 router_id 的連線
      if (typeof window !== 'undefined' && window.deleteEdgesBySourceHandle) {
        // 獲取當前節點的 ID
        const currentNodeId = id; // 假設節點 ID 在組件中可用

        // 斷開所有從此節點使用被刪除 router 的 router_id 的連線
        window.deleteEdgesBySourceHandle(currentNodeId, handleIdToDelete);
      }

      const newRouters = otherRouters.filter(
        (_, index) => index !== routerIndex
      );

      // 保持原有的 router_id 不變，只確保 connection_id 存在
      const routersWithConnectionIds = newRouters.map((router) => ({
        ...router,
        // 保持原有的 router_id 不變！
        connection_id:
          router.connection_id ||
          `router_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }));

      updateRoutersToParent(routersWithConnectionIds);

      // 🔧 修復：額外的清理工作 - 通知其他組件 router 已被刪除
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('routerDeleted', {
          detail: {
            nodeId: id,
            deletedRouter: routerToDelete,
            remainingRouters: routersWithConnectionIds
          }
        });
        window.dispatchEvent(event);
      }
    },
    [otherRouters, updateRoutersToParent, id]
  );

  // 更新 router 名稱
  const updateRouterName = useCallback(
    (index, newName) => {
      const updatedRouters = otherRouters.map((router, i) =>
        i === index
          ? {
              ...router,
              router_name: newName,
              // 確保 connection_id 存在
              connection_id:
                router.connection_id ||
                `router_${Date.now()}_${Math.random()
                  .toString(36)
                  .substr(2, 9)}`
            }
          : router
      );
      updateRoutersToParent(updatedRouters);
    },
    [otherRouters, updateRoutersToParent]
  );

  // 更新 AI 條件
  const updateAiCondition = useCallback(
    (index, newCondition) => {
      const updatedRouters = otherRouters.map((router, i) =>
        i === index
          ? {
              ...router,
              ai_condition: newCondition,
              // 確保 connection_id 存在
              connection_id:
                router.connection_id ||
                `router_${Date.now()}_${Math.random()
                  .toString(36)
                  .substr(2, 9)}`
            }
          : router
      );
      updateRoutersToParent(updatedRouters);
    },
    [otherRouters, updateRoutersToParent]
  );

  const ensureConnectionIds = useCallback((routers) => {
    return routers.map((router) => ({
      ...router,
      connection_id:
        router.connection_id ||
        `router_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }));
  }, []);

  useEffect(() => {
    if (data?.routers !== undefined) {
      const dataRoutersString = JSON.stringify(data.routers);
      const currentRoutersString = JSON.stringify(routers);

      if (dataRoutersString !== currentRoutersString) {
        // 確保所有 router 都有 connection_id
        const routersWithConnectionIds = ensureConnectionIds(data.routers);
        setRouters(routersWithConnectionIds);
      }
    }
  }, [data?.routers, ensureConnectionIds]);

  const handleDragStart = useCallback((e, index) => {
    setDraggedIndex(index);
    setDragOverIndex(null);

    // 設置拖拽數據
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';

    // 阻止 ReactFlow 的預設拖拽行為
    e.stopPropagation();
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnter = useCallback(
    (e, index) => {
      e.preventDefault();
      e.stopPropagation();

      if (draggedIndex !== null && draggedIndex !== index) {
        setDragOverIndex(index);
      }
    },
    [draggedIndex]
  );

  const handleDragEnd = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  // handleDrop 函數 - 保持原有 router_id 不變
  const handleDrop = useCallback(
    (e, dropIndex) => {
      e.preventDefault();
      e.stopPropagation();

      const dragIndex =
        draggedIndex !== null
          ? draggedIndex
          : parseInt(e.dataTransfer.getData('text/plain'));

      if (dragIndex === null || isNaN(dragIndex) || dragIndex === dropIndex) {
        setDraggedIndex(null);
        setDragOverIndex(null);
        return;
      }

      if (dragIndex < 0 || dragIndex >= otherRouters.length) {
        setDraggedIndex(null);
        setDragOverIndex(null);
        return;
      }

      // 創建新陣列並執行排序
      const newRouters = [...otherRouters];

      // 移除被拖拽的項目
      const [draggedItem] = newRouters.splice(dragIndex, 1);

      // 重新計算插入位置 - 簡化邏輯
      let insertIndex;

      if (dropIndex >= otherRouters.length) {
        // 拖拽到列表最後
        insertIndex = newRouters.length;
        console.log('拖拽到列表最後，插入位置:', insertIndex);
      } else {
        // 直接使用 dropIndex 作為插入位置
        // 當向下拖拽時，由於我們已經移除了前面的元素，索引會自動調整
        insertIndex = dropIndex;
        console.log('插入到位置:', insertIndex, '(原目標索引:', dropIndex, ')');
      }

      // 確保插入位置有效
      insertIndex = Math.max(0, Math.min(insertIndex, newRouters.length));

      // 在計算出的位置插入項目
      newRouters.splice(insertIndex, 0, draggedItem);

      // 保持原有的 router_id 和 connection_id 不變
      const routersWithConnectionIds = newRouters.map((router) => ({
        ...router,
        // 保持原有的 router_id 不變！
        // 只確保 connection_id 存在
        connection_id:
          router.connection_id ||
          `router_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }));

      // 更新狀態
      updateRoutersToParent(routersWithConnectionIds);

      // 清理拖拽狀態
      setDraggedIndex(null);
      setDragOverIndex(null);

      updateRoutersToParent(routersWithConnectionIds);
      setDraggedIndex(null);
      setDragOverIndex(null);

      // 立即更新節點內部結構
      updateNodeInternals(id);
    },
    [draggedIndex, otherRouters, updateRoutersToParent, updateNodeInternals, id]
  );

  // 計算標籤寬度
  const calculateLabelWidth = (text) => {
    const baseWidth = 24;
    const charWidth = 8;
    return baseWidth + text.length * charWidth;
  };

  // 獲取所有輸出 handles（包括 other） - 使用 router_id 作為 handle ID
  const getAllOutputHandles = useCallback(() => {
    const handles = otherRouters.map((router) => ({
      // 使用 router_id 作為 handle 的 id，保持 React Flow handle 標識符的穩定性
      id: router.router_id,
      name: router.router_name,
      router_id: router.router_id,
      connection_id: router.connection_id
    }));

    handles.push({
      id: 'default_router',
      name: 'Other',
      router_id: 'default_router',
      connection_id: 'default_router'
    });

    return handles;
  }, [otherRouters]);

  const outputHandles = getAllOutputHandles();
  const HANDLE_SPACING = 40; // Handle 之間的垂直間距
  const LABEL_HEIGHT = 32; // 每個標籤的高度（包含 padding 和 margin）
  return (
    <>
      <div className='rounded-lg shadow-md overflow-hidden w-[400px]'>
        {/* Header section */}
        <div className='bg-[#ecfdf5] p-4'>
          <div className='flex items-center'>
            <div className='w-6 h-6 flex items-center justify-center mr-2'>
              <IconBase type='router_switch' />
            </div>
            <span className='font-medium'>{formatNodeTitle('Router', id)}</span>
          </div>
        </div>

        {/* Content area */}
        <div className='bg-white p-4'>
          {/* Model 下拉選單 */}
          <div className='mb-4'>
            <label className='block text-sm text-gray-700 mb-2 font-bold'>
              Model
            </label>
            <div className='relative'>
              <select
                className='w-full border border-gray-300 rounded p-2 text-sm appearance-none bg-white pr-8 nodrag'
                value={selectedModelId}
                onChange={(e) => handleModelChange(e.target.value)}
                disabled={isLoadingModels}
                onMouseDown={(e) => e.stopPropagation()}>
                <option value=''>
                  {isLoadingModels ? '載入中...' : '選擇模型'}
                </option>
                {modelOptions.map((model) => (
                  <option
                    key={model.value}
                    value={model.value}>
                    {model.label}
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

          {/* Context section 標題 */}
          <div className='mb-2'>
            <label className='block text-sm text-gray-700 font-bold'>
              Context
            </label>
            <label className='block text-sm text-gray-700 font-bold'>
              Router
            </label>
          </div>

          {/* Router sections - 添加滾動容器 */}
          <div
            ref={scrollContainerRef}
            className='mb-4 space-y-2 overflow-y-auto nodrag'
            style={{
              maxHeight: '360px', // 大約可容納3個router section的高度
              scrollbarWidth: 'thin',
              scrollbarColor: '#cbd5e0 #f7fafc'
            }}
            onMouseEnter={() => setIsScrollContainerHovered(true)}
            onMouseLeave={() => setIsScrollContainerHovered(false)}
            onTouchStart={(e) => {
              e.stopPropagation();
              setIsScrollContainerHovered(true);
            }}
            onTouchEnd={() => setIsScrollContainerHovered(false)}>
            {otherRouters.map((router, index) => {
              const isDraggedItem = draggedIndex === index;
              const isDropTarget =
                dragOverIndex === index &&
                draggedIndex !== null &&
                draggedIndex !== index;

              return (
                <React.Fragment key={router.router_id}>
                  <div
                    className={`border rounded-lg pt-3 pb-3 pl-1 pr-1 transition-all duration-150 ${
                      isDraggedItem
                        ? 'opacity-30 border-gray-300 bg-gray-100'
                        : isDropTarget
                        ? 'border-cyan-400 bg-cyan-50'
                        : 'border-gray-200 bg-[#fafafa] hover:bg-gray-50'
                    }`}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDragEnter={(e) => handleDragEnter(e, index)}
                    onDragEnd={handleDragEnd}
                    onDrop={(e) => handleDrop(e, index)}>
                    <div className='flex items-start gap-2'>
                      {/* 排序按鈕 */}
                      <div
                        className={`flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing nodrag transition-colors duration-200 ${
                          isDraggedItem ? 'text-cyan-500' : ''
                        }`}
                        style={{
                          alignSelf: 'center',
                          marginTop: '32px'
                        }}>
                        <img
                          src={dragIcon}
                          width={12}
                          height={12}
                          className='max-w-full max-h-full object-contain pointer-events-none'
                          alt='drag handle'
                          draggable={false}
                        />
                      </div>

                      {/* Router 內容 */}
                      <div className='flex-1 space-y-2'>
                        {/* Router Name */}
                        <div>
                          <label className='block text-xs text-gray-600 mb-1 font-bold'>
                            Router Name
                          </label>
                          <input
                            type='text'
                            className='w-full border border-gray-300 rounded px-2 py-1 text-sm nodrag'
                            value={router.router_name}
                            onChange={(e) =>
                              updateRouterName(index, e.target.value)
                            }
                            placeholder='Router'
                            onDragStart={(e) => e.preventDefault()}
                          />
                        </div>

                        {/* AI Condition */}
                        <div>
                          <label className='block text-xs text-gray-600 mb-1 font-bold'>
                            AI Condition
                          </label>
                          <AutoResizeTextarea
                            value={router.ai_condition}
                            onChange={(e) =>
                              updateAiCondition(index, e.target.value)
                            }
                            placeholder='輸入 AI 條件...'
                            className='w-full border border-gray-300 rounded px-2 py-1 text-sm nodrag'
                            onDragStart={(e) => e.preventDefault()}
                          />
                        </div>
                      </div>

                      {/* 刪除按鈕 */}
                      {otherRouters.length > 1 && (
                        <button
                          className='flex items-center justify-center w-6 h-6 text-gray-400 hover:text-red-600 transition-colors duration-200 nodrag'
                          style={{
                            alignSelf: 'center',
                            marginTop: '32px'
                          }}
                          onClick={() => deleteRouter(index)}
                          disabled={otherRouters.length <= 1}
                          onMouseDown={(e) => e.stopPropagation()}>
                          <DeleteIcon />
                        </button>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}

            {/* 拖拽到最後位置的隱形區域 */}
            {draggedIndex !== null && (
              <div
                className='h-8 w-full border-2 border-dashed border-transparent hover:border-cyan-300 transition-colors nodrag'
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, otherRouters.length)}
                onDrop={(e) => handleDrop(e, otherRouters.length)}></div>
            )}
          </div>

          {/* 新增 Router 按鈕 */}
          <button
            className='w-full bg-cyan-500 hover:bg-cyan-600 text-white rounded-md p-2 font-medium flex items-center justify-center gap-2 nodrag'
            onClick={addRouter}
            onMouseDown={(e) => e.stopPropagation()}>
            <AddIcon />
            Router
          </button>
        </div>
      </div>

      {/* Input Handle */}
      <Handle
        type='target'
        position={Position.Left}
        id='context'
        style={{
          background: '#e5e7eb',
          borderColor: '#D3D3D3',
          width: '12px',
          height: '12px',
          left: '-6px',
          top: '165px',
          border: '1px solid #D3D3D3'
        }}
        isConnectable={isConnectable}
      />

      {/* 右側標籤區域 */}
      <div className='absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2 ml-2 pointer-events-none'>
        {outputHandles.map((handle, index) => {
          // 🔧 修復：使用與 Handle 相同的位置計算邏輯
          const verticalOffset =
            (index - (outputHandles.length - 1) / 2) * HANDLE_SPACING;

          return (
            <div
              key={handle.id}
              className='flex items-center absolute'
              style={{
                pointerEvents: 'none',
                top: `${verticalOffset}px`,
                transform: 'translateY(-50%)', // 確保標籤垂直置中
                left: 0
              }}>
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
                  backgroundColor: '#00ced1',
                  transform: 'translateX(-6px)'
                }}
              />
              <span
                className={`inline-flex items-center px-3 py-1 rounded text-xs font-medium text-white whitespace-nowrap select-none ${
                  handle.id === 'default_router' ? 'bg-gray-500' : 'bg-cyan-500'
                }`}
                style={{
                  transform: 'translateX(-6px)',
                  backgroundColor: '#00ced1'
                }}>
                {handle.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Output Handles */}
      {outputHandles.map((handle, index) => {
        const labelWidth = calculateLabelWidth(handle.name);
        const totalWidth = labelWidth + 8;

        // 🔧 修復：使用統一的位置計算邏輯
        const verticalOffset =
          (index - (outputHandles.length - 1) / 2) * HANDLE_SPACING;

        return (
          <Handle
            key={handle.id}
            type='source'
            position={Position.Right}
            id={handle.id}
            style={{
              background: 'transparent',
              border: 'none',
              width: `${totalWidth}px`,
              height: `${LABEL_HEIGHT}px`, // 使用統一的高度
              right: `-${totalWidth + 6}px`,
              top: `calc(50% + ${verticalOffset}px)`, // 使用相同的計算邏輯
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

export default memo(RouterSwitchNode);
