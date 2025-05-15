import React, { memo, useEffect, useState, useRef, useCallback } from 'react';
import { Handle, Position, useEdges, useUpdateNodeInternals } from 'reactflow';
import IconBase from '../icons/IconBase';
import AddIcon from '../icons/AddIcon';

const BrowserExtensionOutputNode = ({ id, data, isConnectable }) => {
  // 用來追蹤輸入 handle 的狀態
  const [inputs, setInputs] = useState([]);
  const updateNodeInternals = useUpdateNodeInternals(); // 用於通知 ReactFlow 更新節點內部結構
  const initAttempts = useRef(0);
  const nodeId = id || 'unknown'; // 防止 id 為 undefined

  // 計算節點的動態高度
  const getNodeHeight = useCallback(() => {
    // 標題區域高度
    const headerHeight = 50;
    // 按鈕區域高度
    const buttonAreaHeight = 48;
    // 文字提示區域高度 + 間距 (增加高度以容納兩行文字)
    const textAreaHeight = 40;
    // 額外的底部間距
    const bottomPadding = 10;
    // 每個 handle 之間的間距
    const handleSpacing = 20;

    // 計算總高度:
    // 固定部分 + (handle數量) * 間距
    return (
      headerHeight +
      buttonAreaHeight +
      textAreaHeight +
      bottomPadding +
      inputs.length * handleSpacing
    );
  }, [inputs.length]);

  // 使用 useEdges 獲取所有邊緣
  const edges = useEdges();

  // 初始化節點 - 確保 handle 正確載入並初始化
  useEffect(() => {
    // 追蹤初始化嘗試次數
    initAttempts.current += 1;
    console.log(
      `初始化 BrowserExtensionOutputNode ${nodeId}，嘗試 #${initAttempts.current}`
    );

    // 準備收集所有 handle
    let allHandles = new Map();

    // 首先從 node_input 中提取 handle
    if (data.node_input && typeof data.node_input === 'object') {
      const inputKeys = Object.keys(data.node_input);
      console.log(`從 node_input 載入 handle (${nodeId}):`, inputKeys);

      // 將 node_input 中的所有 handle 加入 map
      inputKeys.forEach((key) => {
        allHandles.set(key, { id: key });
      });

      console.log(`從 node_input 找到 ${allHandles.size} 個 handle`);
    }

    // 其次，如果有 inputHandles 屬性，也將它們加入 map
    if (data.inputHandles && Array.isArray(data.inputHandles)) {
      console.log(
        `從 inputHandles 屬性載入 ${data.inputHandles.length} 個 handle`
      );

      data.inputHandles.forEach((handle) => {
        if (handle && handle.id) {
          allHandles.set(handle.id, { id: handle.id });
        }
      });

      console.log(`合併後共有 ${allHandles.size} 個 handle`);
    }

    // 還要確認一下參數中的 inputHandles
    if (
      data.parameters &&
      data.parameters.inputHandles &&
      data.parameters.inputHandles.data
    ) {
      console.log(`從參數中載入 handle`);

      const paramHandles = data.parameters.inputHandles.data;
      if (Array.isArray(paramHandles)) {
        paramHandles.forEach((handleId) => {
          allHandles.set(handleId, { id: handleId });
        });
      }

      console.log(`加入參數後共有 ${allHandles.size} 個 handle`);
    }

    // 轉換 Map 為數組
    let handles = Array.from(allHandles.values());

    // 確保至少有一個默認 handle
    if (handles.length === 0) {
      handles = [{ id: 'input' }];
      console.log(`添加默認 handle: input`);
    }

    // 確保每個 handle ID 都是字符串類型，以防止 ReactFlow 錯誤
    handles = handles.map((handle) => ({
      id: String(handle.id || `input_${Date.now()}`)
    }));

    console.log(`最終設置節點 ${nodeId} 的 inputs:`, handles);

    // 設置 inputs 並更新 ReactFlow 內部結構
    setInputs(handles);

    // 同步 node_input - 關鍵修復：確保所有 handle 都有對應的 node_input 項
    if (data.node_input) {
      const nodeInput = { ...data.node_input };

      // 檢查每個 handle，確保在 node_input 中存在
      handles.forEach((handle) => {
        if (!nodeInput[handle.id]) {
          nodeInput[handle.id] = {
            node_id: '',
            output_name: '',
            type: 'string',
            data: '',
            is_empty: true
          };
          console.log(`為 handle ${handle.id} 創建 node_input 項`);
        }
      });

      // 更新 node_input
      data.node_input = nodeInput;
    }

    // 調試輸出完整的節點資料
    console.log(`節點 ${nodeId} 完整資料:`, {
      handles: handles,
      node_input: data.node_input || {},
      inputHandles: data.inputHandles || []
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
  }, [nodeId, data, updateNodeInternals]);

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

  // 處理新增輸出按鈕點擊 - 關鍵修改，直接更新 node_input
  const handleAddOutput = useCallback(() => {
    // 創建帶有時間戳的新 handle ID
    const newInputId = `input_${Date.now()}`;
    const newInputs = [...inputs, { id: newInputId }];

    console.log(`新增 handle (${nodeId}):`, newInputId);

    // 更新本地狀態
    setInputs(newInputs);

    // 直接更新 node_input - 不依賴回調函數
    if (data.node_input) {
      data.node_input[newInputId] = {
        node_id: '',
        output_name: '',
        type: 'string',
        data: '',
        is_empty: true
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

  // 計算節點樣式，包括動態高度
  const nodeStyle = {
    height: `${getNodeHeight()}px`,
    transition: 'height 0.3s ease' // 添加平滑過渡效果
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

      {/* 白色內容區域 - 明確設置背景為白色 */}
      <div
        className='p-4'
        style={{ backgroundColor: 'white' }}>
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

      {/* 動態渲染所有 handle */}
      {inputs.map((input, index) => {
        // 計算 handle 的位置
        // 從標準起始位置開始，每個間隔 25px
        const startY = 65; // 白色部分開始的位置
        const spacing = 25; // handle 之間的間距
        const topPosition = startY + index * spacing;

        // 獲取此 handle 的連線數量
        const connectionCount = connectionsPerHandle[input.id] || 0;

        // 根據是否有連線設置不同的樣式
        const handleStyle = {
          background: connectionCount > 0 ? '#e5e7eb' : '#f3f4f6',
          borderColor: connectionCount > 0 ? '#D3D3D3' : '#E0E0E0',
          width: '12px',
          height: '12px',
          left: '-6px',
          top: `${topPosition}px`,
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

            {/* 添加標籤顯示 handle ID */}
            <div
              className='text-xs text-gray-500 absolute'
              style={{
                left: '10px',
                top: `${topPosition - 6}px`,
                pointerEvents: 'none'
              }}>
              {input.id.length > 15 ? `...${input.id.slice(-12)}` : input.id}
              {connectionCount > 0 ? ` (${connectionCount})` : ''}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default memo(BrowserExtensionOutputNode);
