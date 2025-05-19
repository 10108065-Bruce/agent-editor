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
      console.log('loadLabelsFromNodeInput:', key, value);
      if (value && value.return_name) {
        const baseHandleId = processHandleId(key);
        console.log(`讀取 ${key} 的 return_name:`, value.return_name);
        labels[baseHandleId] = value.return_name;
      }
    });

    return labels;
  }, [data.node_input]);

  // 初始化節點 - 確保 handle 正確載入並初始化
  useEffect(() => {
    if (isUpdating.current) return;
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
          console.log(`為 handle ${baseHandleId} 創建 node_input 項`);
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
              console.log(`為 handle ${key} 添加 return_name 屬性`);
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

  // 計算連接到該節點的連線數量和每個 handle 的連線詳情
  const connectionInfo = useCallback(() => {
    // 計算總連接數
    const totalConnections = edges.filter((edge) => edge.target === id).length;

    // 計算每個 handle 的連接數
    const connectionsPerHandle = {};

    inputs.forEach((input) => {
      const handleId = input.id;
      const connectionsToHandle = edges.filter(
        (edge) => edge.target === id && edge.targetHandle === handleId
      ).length;

      connectionsPerHandle[handleId] = connectionsToHandle;
    });

    return { totalConnections, connectionsPerHandle };
  }, [edges, id, inputs]);

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
      console.log(`已在 node_input 中添加 ${newInputId}`);
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
  }, [inputs, data, nodeId]);

  // 處理標籤變更的函數 - 避免無限循環
  // 處理標籤變更的函數 - 避免無限循環
  const handleLabelChange = useCallback(
    (handleId, newLabel) => {
      // 更新本地標籤狀態
      setHandleLabels((prev) => {
        // 如果標籤沒有變化，不更新
        if (prev[handleId] === newLabel) return prev;

        // 標籤有變化，更新節點數據
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

        console.log(`已更新 ${handleId} 的標籤為: ${newLabel}`);
        return { ...prev, [handleId]: newLabel };
      });

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
          console.log(`已將 ${handleId} 的標籤變更同步到後端`);
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

  // 取得連線信息
  const { totalConnections, connectionsPerHandle } = connectionInfo();

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

        // 獲取此 handle 的連線數量
        const connectionCount = connectionsPerHandle[input.id] || 0;

        // 根據是否有連線設置不同的樣式
        const handleStyle = {
          background: connectionCount > 0 ? '#e5e7eb' : '#f3f4f6',
          borderColor: connectionCount > 0 ? '#D3D3D3' : '#E0E0E0',
          width: '12px',
          height: '12px',
          left: '-6px',
          top: `${topPosition + 14}px`,
          border:
            connectionCount > 0 ? '1px solid #D3D3D3' : '1px dashed #A0A0A0'
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

            {/* 可編輯的標籤 - 替換原有的靜態標籤 */}
            <div
              className='absolute flex'
              style={{ left: '10px', top: `${topPosition}px` }}>
              <input
                type='text'
                className='text-sm border border-gray-300 rounded px-2 py-1 w-55 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 focus:outline-none'
                placeholder='請輸入'
                value={handleLabels[input.id] || ''}
                onChange={(e) => handleLabelChange(input.id, e.target.value)}
                title={`輸入 ${input.id} 的標籤（將儲存為 return_name）`}
                style={{
                  height: '30px', // 增加高度到30px
                  lineHeight: '28px', // 調整行高以便文字垂直居中
                  fontSize: '14px', // 增加字體大小到14px
                  width: '180px' // 設定固定寬度
                }}
              />
              {connectionCount > 0 ? (
                <span className='text-xs text-gray-500 ml-1 mt-1'>
                  ({connectionCount})
                </span>
              ) : null}
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

        {/* 顯示輸入點的數量和連線數量 */}
        {inputs.length > 0 && (
          <div className='text-xs text-gray-600 mt-2'>
            <div>已有 {inputs.length} 個輸入點</div>
            <div>共連線 {totalConnections} 個</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(BrowserExtensionOutputNode);
