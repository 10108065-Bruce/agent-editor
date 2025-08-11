import React, { memo, useEffect, useState, useRef, useCallback } from 'react';
import { Handle, Position, useEdges, useUpdateNodeInternals } from 'reactflow';
import IconBase from '../icons/IconBase';
import AddIcon from '../icons/AddIcon';

const BrowserExtensionOutputNode = ({ id, data, isConnectable }) => {
  // 用來追蹤輸入 handle 的狀態
  const [inputs, setInputs] = useState([]);
  // 新增 handleLabels 狀態來儲存每個 handle 的自定義標籤
  const [handleLabels, setHandleLabels] = useState({});
  const updateNodeInternals = useUpdateNodeInternals();
  const initAttempts = useRef(0);
  const nodeId = id || 'unknown';
  const isUpdating = useRef(false); // 防止循環更新
  const isInitialized = useRef(false); // 標記是否已初始化

  // 每個 handle 的高度 (增加高度)
  const handleHeight = 40; // 從原本的 25 增加到 40
  const getNodeHeight = useCallback(() => {
    // 標題區域高度
    const headerHeight = 50;
    // 按鈕區域高度
    const buttonAreaHeight = 48;
    // 文字提示區域高度 + 間距 (增加高度以容納兩行文字)
    const textAreaHeight = 40;
    // 額外的底部間距
    const bottomPadding = 30;

    // 計算總高度
    return (
      headerHeight +
      inputs.length * handleHeight +
      buttonAreaHeight +
      textAreaHeight +
      bottomPadding
    );
  }, [inputs.length]);

  // 使用 useEdges 獲取所有邊緣
  const edges = useEdges();

  // 處理 handle ID，將多連線格式 (output0_0, output0_1) 轉換為基本格式 (output0)
  const processHandleId = (handleId) => {
    // 使用正則表達式匹配多連線格式
    if (!handleId) return '';
    const match = handleId && handleId.match(/^(output\d+)(?:_\d+)?$/);
    if (match && match[1]) {
      return match[1]; // 返回基本 handle ID
    }

    // 如果是舊版 'input' 格式，轉換為 'output0'
    if (handleId === 'input') {
      return 'output0';
    }

    // 其他情況直接返回原始 ID
    return handleId;
  };

  // 從 node_input 讀取標籤 - 只在初始化時調用一次
  const loadLabelsFromNodeInput = useCallback(() => {
    if (!data.node_input) return {};

    const labels = {};
    Object.entries(data.node_input).forEach(([key, value]) => {
      if (value && value.return_name) {
        const baseHandleId = processHandleId(key);
        labels[baseHandleId] = value.return_name;
      }
    });

    return labels;
  }, [data.node_input]);

  // 初始化節點 - 確保 handle 正確載入並初始化
  useEffect(() => {
    if (isUpdating.current || isInitialized.current) return;
    isUpdating.current = true;

    initAttempts.current += 1;
    console.log(
      `初始化 BrowserExtensionOutputNode ${nodeId}，嘗試 #${initAttempts.current}`
    );

    // 準備收集所有 handle
    const handleSet = new Set();

    // 從 node_input 提取基本 handle ID (處理多連線格式)
    if (data.node_input && typeof data.node_input === 'object') {
      const inputKeys = Object.keys(data.node_input);
      console.log(`從 node_input 載入 handle (${nodeId}):`, inputKeys);

      // 為每個 key 提取基本 handle ID
      inputKeys.forEach((key) => {
        const baseHandleId = processHandleId(key);
        if (baseHandleId) {
          handleSet.add(baseHandleId);
        }
      });
    }

    // 從 inputHandles 屬性添加 handle
    if (data.inputHandles && Array.isArray(data.inputHandles)) {
      console.log(
        `從 inputHandles 屬性載入 ${data.inputHandles.length} 個 handle`
      );

      data.inputHandles.forEach((handle) => {
        if (handle && handle.id) {
          const baseHandleId = processHandleId(handle.id);
          if (baseHandleId) {
            handleSet.add(baseHandleId);
          }
        }
      });
    }

    // 從參數中添加 handle
    if (
      data.parameters &&
      data.parameters.inputHandles &&
      data.parameters.inputHandles.data
    ) {
      console.log(`從參數中載入 handle`);

      const paramHandles = data.parameters.inputHandles.data;
      if (Array.isArray(paramHandles)) {
        paramHandles.forEach((handleId) => {
          const baseHandleId = processHandleId(handleId);
          if (baseHandleId) {
            handleSet.add(baseHandleId);
          }
        });
      }
    }

    // 確保至少有一個默認 handle
    if (handleSet.size === 0) {
      handleSet.add('output0');
      console.log(`添加默認 handle: output0`);
    }

    // 轉換 Set 為數組
    const handles = Array.from(handleSet).map((id) => ({ id: String(id) }));
    console.log(`最終設置節點 ${nodeId} 的 inputs:`, handles);

    // 設置 inputs
    setInputs(handles);

    // 同步 node_input - 確保所有 handle 都有對應的 node_input 項
    if (data.node_input) {
      const nodeInput = { ...data.node_input };

      // 構建一個映射，將多連線格式映射到基本 handle ID
      const handleMapping = {};
      Object.keys(nodeInput).forEach((key) => {
        const baseHandleId = processHandleId(key);
        if (!handleMapping[baseHandleId]) {
          handleMapping[baseHandleId] = [];
        }
        handleMapping[baseHandleId].push(key);
      });

      // 檢查每個 handle，確保在 node_input 中存在
      handles.forEach((handle) => {
        const baseHandleId = handle.id;

        // 如果沒有對應的 node_input 項，創建一個
        if (
          !handleMapping[baseHandleId] ||
          handleMapping[baseHandleId].length === 0
        ) {
          nodeInput[baseHandleId] = {
            node_id: '',
            output_name: '',
            type: 'string',
            data: '',
            is_empty: true,
            return_name: '' // 確保有 return_name 屬性
          };
        }
        // 確保所有多連線格式的項都有 return_name 屬性
        else if (handleMapping[baseHandleId]) {
          handleMapping[baseHandleId].forEach((key) => {
            if (
              !Object.prototype.hasOwnProperty.call(
                nodeInput[key],
                'return_name'
              )
            ) {
              nodeInput[key].return_name = '';
            }
          });
        }
      });

      // 更新 node_input
      data.node_input = nodeInput;
    }

    // 更新 inputHandles
    if (data.inputHandles) {
      data.inputHandles = handles;
    }

    // 設置標籤狀態
    const initialLabels = loadLabelsFromNodeInput();
    if (Object.keys(initialLabels).length > 0) {
      setHandleLabels(initialLabels);
      console.log('設置初始標籤:', initialLabels);
    }

    // 調試輸出完整的節點資料
    console.log(`節點 ${nodeId} 完整資料:`, {
      handles: handles,
      node_input: data.node_input || {},
      inputHandles: data.inputHandles || [],
      labels: initialLabels
    });

    // 標記為已初始化
    isInitialized.current = true;

    // 多次延遲更新節點內部結構，確保 ReactFlow 能正確識別 handle
    const updateTimes = [0, 50, 150, 300, 600, 1000, 1500];
    updateTimes.forEach((delay) => {
      setTimeout(() => {
        try {
          updateNodeInternals(nodeId);
        } catch (error) {
          console.error(`更新節點內部結構時出錯:`, error);
        }
      }, delay);
    });

    // 重置更新狀態
    setTimeout(() => {
      isUpdating.current = false;
    }, 200);
  }, [nodeId, data, updateNodeInternals, loadLabelsFromNodeInput]);

  // 當 inputs 變更時，也更新節點內部結構
  useEffect(() => {
    if (inputs.length > 0) {
      console.log(`inputs 更新為 ${inputs.length} 個 handle，更新內部結構`);

      // 延遲更新以確保渲染完成
      setTimeout(() => {
        try {
          updateNodeInternals(nodeId);
        } catch (error) {
          console.error(`更新節點內部結構時出錯:`, error);
        }
      }, 50);
    }
  }, [inputs, nodeId, updateNodeInternals]);

  // 處理新增輸出按鈕點擊
  const handleAddOutput = useCallback(() => {
    // 查找當前最大的輸出索引，以便生成下一個序號
    let maxIndex = -1;
    inputs.forEach((input) => {
      if (input.id && input.id.startsWith('output')) {
        const indexStr = input.id.substring(6);
        const index = parseInt(indexStr, 10);
        if (!isNaN(index) && index > maxIndex) {
          maxIndex = index;
        }
      }
    });

    // 創建新的 handle ID，格式為 "outputX"，其中 X 是遞增的數字
    const newIndex = maxIndex + 1;
    const newInputId = `output${newIndex}`;
    const newInputs = [...inputs, { id: newInputId }];

    console.log(`新增 handle (${nodeId}):`, newInputId);

    const currentLabels = { ...handleLabels };

    // 更新本地狀態
    setInputs(newInputs);

    // 直接更新 node_input
    if (data.node_input) {
      data.node_input[newInputId] = {
        node_id: '',
        output_name: '',
        type: 'string',
        data: '',
        is_empty: true,
        return_name: '' // 確保有 return_name 屬性
      };
    }

    // 更新 inputHandles
    if (data.inputHandles) {
      data.inputHandles = newInputs;
    } else {
      data.inputHandles = newInputs;
    }

    // 同時也嘗試更新參數
    if (data.parameters && data.parameters.inputHandles) {
      data.parameters.inputHandles.data = newInputs.map((h) => h.id);
    }

    // 🔧 修復：確保同步更新 node_input 中的 inputHandles 信息
    if (data.updateNodeData) {
      try {
        data.updateNodeData('inputHandles', newInputs);
        data.updateNodeData('node_input', data.node_input);
      } catch (err) {
        console.warn('同步更新節點數據時出錯:', err);
      }
    }

    // 🔧 修復：在更新完所有數據後，確保標籤狀態不會丟失
    setTimeout(() => {
      setHandleLabels((prevLabels) => {
        // 合併之前的標籤和當前保存的標籤
        const mergedLabels = { ...currentLabels, ...prevLabels };

        return mergedLabels;
      });
    }, 0);

    // 如果有回調函數，也嘗試調用
    if (data.onAddOutput) {
      try {
        data.onAddOutput(newInputs);
      } catch (err) {
        console.warn(`調用 onAddOutput 時出錯:`, err);
      }
    } else {
      console.warn(`節點 ${nodeId} 沒有 onAddOutput 回調函數`);
    }
  }, [inputs, data, nodeId, handleLabels]);

  // 新增：處理刪除輸入 handle 的函數
  const handleDeleteInput = useCallback(
    (handleId) => {
      // 過濾掉要刪除的 handle
      const newInputs = inputs.filter((input) => input.id !== handleId);

      // 🔧 修復：保存當前標籤狀態，除了要刪除的handle
      const currentLabels = { ...handleLabels };
      delete currentLabels[handleId];

      // 更新本地狀態
      setInputs(newInputs);

      // 從 node_input 中刪除對應項目
      if (data.node_input) {
        const updatedNodeInput = { ...data.node_input };

        // 刪除所有與此 handle 相關的項目（包括多連線格式）
        Object.keys(updatedNodeInput).forEach((key) => {
          const baseHandleId = processHandleId(key);
          if (baseHandleId === handleId) {
            delete updatedNodeInput[key];
          }
        });

        data.node_input = updatedNodeInput;
      }

      // 更新 inputHandles
      data.inputHandles = newInputs;

      // 同時也嘗試更新參數
      if (data.parameters && data.parameters.inputHandles) {
        data.parameters.inputHandles.data = newInputs.map((h) => h.id);
      }

      // 從標籤狀態中刪除
      setHandleLabels(currentLabels);

      if (data.updateNodeData) {
        try {
          data.updateNodeData('inputHandles', newInputs);
          data.updateNodeData('node_input', data.node_input);
        } catch (err) {
          console.warn('同步更新節點數據時出錯:', err);
        }
      }

      // 自動斷開與此 handle 相關的所有連線
      if (typeof window !== 'undefined' && window.deleteEdgesByHandle) {
        window.deleteEdgesByHandle(nodeId, handleId);
      }

      // 如果有回調函數，也嘗試調用
      if (data.onRemoveHandle) {
        try {
          data.onRemoveHandle(handleId);
        } catch (err) {
          console.warn(`調用 onRemoveHandle 時出錯:`, err);
        }
      }
    },
    [inputs, data, nodeId, handleLabels]
  );

  // 處理標籤變更的函數 - 避免無限循環
  const handleLabelChange = useCallback(
    (handleId, newLabel) => {
      // 🔧 修復：立即更新本地標籤狀態，避免延遲導致的丟失
      setHandleLabels((prev) => {
        // 如果標籤沒有變化，不更新
        if (prev[handleId] === newLabel) return prev;

        const updatedLabels = { ...prev, [handleId]: newLabel };
        console.log('更新標籤狀態:', updatedLabels);
        return updatedLabels;
      });

      // 同時更新節點數據
      if (data.node_input) {
        // 查找所有與此基本 handle ID 相關的項
        Object.keys(data.node_input).forEach((key) => {
          const baseKey = processHandleId(key);
          if (baseKey === handleId) {
            // 更新所有相關連線的 return_name
            data.node_input[key].return_name = newLabel;
            data.node_input[key].has_return_name = true; // 標記為有 return_name
          }
        });

        // 如果 node_input 中沒有對應的 handle，創建一個
        const baseHandleExists = Object.keys(data.node_input).some(
          (key) => processHandleId(key) === handleId
        );

        if (!baseHandleExists) {
          data.node_input[handleId] = {
            node_id: '',
            output_name: '',
            type: 'string',
            data: '',
            is_empty: true,
            return_name: newLabel,
            has_return_name: true // 標記為有 return_name
          };
        }
      }

      // 確保立即更新到後端 - 如果有 updateNodeData 方法
      if (data.updateNodeData && data.node_input) {
        try {
          // 創建一個深拷貝，確保不會意外修改原始數據
          const updatedNodeInput = JSON.parse(JSON.stringify(data.node_input));

          // 遍歷並更新所有相關的 entry
          Object.keys(updatedNodeInput).forEach((key) => {
            const baseKey = processHandleId(key);
            if (baseKey === handleId) {
              updatedNodeInput[key].return_name = newLabel;
              updatedNodeInput[key].has_return_name = true;
            }
          });

          // 如果沒有對應的 entry，創建一個
          if (
            !Object.keys(updatedNodeInput).some(
              (key) => processHandleId(key) === handleId
            )
          ) {
            updatedNodeInput[handleId] = {
              node_id: '',
              output_name: '',
              type: 'string',
              data: '',
              is_empty: true,
              return_name: newLabel,
              has_return_name: true
            };
          }

          // 調用更新方法
          data.updateNodeData('node_input', updatedNodeInput);
        } catch (err) {
          console.warn('更新節點數據時出錯:', err);
        }
      }
    },
    [data]
  );

  // 計算節點樣式，包括動態高度
  const nodeStyle = {
    height: `${getNodeHeight()}px`,
    transition: 'height 0.3s ease'
  };

  const cleanupOrphanNodeInputs = useCallback(() => {
    if (!data.node_input) return;

    const currentEdges = window.currentEdges || []; // 假設全局可訪問當前邊緣
    const nodeInputKeys = Object.keys(data.node_input);
    const connectedHandles = new Set();

    // 收集所有有實際連線的 handle
    currentEdges
      .filter((edge) => edge.target === nodeId)
      .forEach((edge) => {
        if (edge.targetHandle) {
          const baseHandle = edge.targetHandle.split('_')[0];
          connectedHandles.add(baseHandle);
        }
      });

    // 檢查是否有孤兒 node_input 項目
    let hasOrphans = false;
    const cleanedNodeInput = { ...data.node_input };

    nodeInputKeys.forEach((key) => {
      const baseKey = key.split('_')[0];
      const inputData = data.node_input[key];

      // 如果這個 node_input 項目沒有對應的連線且不是空項目，則為孤兒
      if (inputData.node_id && !connectedHandles.has(baseKey)) {
        console.log(`發現孤兒 node_input 項目: ${key}，準備清理`);
        delete cleanedNodeInput[key];
        hasOrphans = true;
      }
    });

    // 如果發現孤兒項目，更新 node_input
    if (hasOrphans) {
      console.log(`清理了孤兒 node_input 項目，更新節點數據`);

      // 更新節點數據
      if (data.updateNodeData) {
        data.updateNodeData('node_input', cleanedNodeInput);
      }

      // 同時更新本地狀態（如果需要的話）
      // 這裡可能需要根據具體的狀態管理邏輯進行調整
    }
  }, [data, nodeId]);

  useEffect(() => {
    const handleRouterDeleted = () => {
      // 稍微延遲執行清理，確保連線已經被正確斷開
      setTimeout(() => {
        cleanupOrphanNodeInputs();
      }, 100);
    };

    // 監聽全局的 router 刪除事件
    if (typeof window !== 'undefined') {
      window.addEventListener('routerDeleted', handleRouterDeleted);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('routerDeleted', handleRouterDeleted);
      }
    };
  }, [cleanupOrphanNodeInputs]);

  // 也可以在邊緣變更時進行清理
  useEffect(() => {
    // 當邊緣發生變化時，檢查並清理孤兒 node_input 項目
    const timeoutId = setTimeout(() => {
      cleanupOrphanNodeInputs();
    }, 200); // 給邊緣更新一些時間

    return () => clearTimeout(timeoutId);
  }, [edges, cleanupOrphanNodeInputs]); // 依賴 edges 變化

  return (
    <div
      className='rounded-lg shadow-md overflow-visible w-64 bg-white'
      style={nodeStyle}>
      {/* 標題部分，帶有圖标 - 使用固定的淺灰色背景 */}
      <div
        className='p-3 rounded-t-lg'
        style={{ backgroundColor: '#f3f4f6' }}>
        <div className='flex items-center'>
          <div className='w-8 h-8 rounded-md bg-teal-500 flex items-center justify-center text-white mr-2'>
            <IconBase type='browser' />
          </div>
          <span className='font-medium text-base'>
            Browser Extension output
          </span>
        </div>
      </div>

      {/* 動態渲染所有 handle */}
      {inputs.map((input, index) => {
        // 計算 handle 的位置
        const startY = 65; // 白色部分開始的位置
        const topPosition = startY + index * handleHeight;

        // 根據是否有連線設置不同的樣式
        const handleStyle = {
          background: '#e5e7eb',
          borderColor: '#D3D3D3',
          width: '12px',
          height: '12px',
          left: '-6px',
          top: `${topPosition + 14}px`,
          border: '1px solid #D3D3D3'
        };

        return (
          <React.Fragment key={`handle-${input.id}`}>
            {/* Handle 元素 */}
            <Handle
              type='target'
              position={Position.Left}
              id={String(input.id)}
              style={handleStyle}
              isConnectable={isConnectable}
            />

            {/* 輸入欄位和刪除按鈕的容器 */}
            <div
              className='absolute flex items-center'
              style={{ left: '10px', top: `${topPosition}px` }}>
              {/* 可編輯的標籤 */}
              <input
                type='text'
                className='text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 focus:outline-none'
                placeholder='請輸入'
                value={handleLabels[input.id] || ''}
                onChange={(e) => handleLabelChange(input.id, e.target.value)}
                title={`輸入 ${input.id} 的標籤（將儲存為 return_name）`}
                style={{
                  height: '30px',
                  lineHeight: '28px',
                  fontSize: '14px',
                  width: '210px' // 調整寬度為刪除按鈕留空間
                }}
              />

              {/* 刪除按鈕 */}
              {inputs.length > 1 && (
                <button
                  onClick={() => handleDeleteInput(input.id)}
                  className='ml-2 text-gray-500 hover:text-teal-600 text-sm p-1 w-6 h-6 flex items-center justify-center'
                  title='刪除此輸入'>
                  ✕
                </button>
              )}
            </div>
          </React.Fragment>
        );
      })}

      {/* 白色內容區域 - 移到底部 */}
      <div
        className='p-4 absolute bottom-1 left-1 right-1 rounded-b-lg'
        style={{
          backgroundColor: 'white',
          borderTop: '1px solid #f0f0f0'
        }}>
        {/* 添加按鈕 - 青色 */}
        <button
          className='w-full bg-teal-500 hover:bg-teal-600 text-white rounded-md p-2 flex justify-center items-center'
          onClick={handleAddOutput}>
          <AddIcon />
        </button>

        {/* 顯示輸入點的數量，移除連線數量資訊 */}
        {inputs.length > 0 && (
          <div className='text-xs text-gray-600 mt-2'>
            <div>已有 {inputs.length} 個輸入點</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(BrowserExtensionOutputNode);
