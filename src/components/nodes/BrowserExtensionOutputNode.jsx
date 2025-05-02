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

  // 初始化節點 - 確保 handle 正確載入並初始化
  useEffect(() => {
    // 追蹤初始化嘗試次數
    initAttempts.current += 1;
    console.log(
      `初始化 BrowserExtensionOutputNode ${nodeId}，嘗試 #${initAttempts.current}`
    );

    let handles = [];

    // 檢查是否從 node_input 載入資料（從後端加載時的情況）
    if (data.node_input && typeof data.node_input === 'object') {
      const inputKeys = Object.keys(data.node_input);
      console.log(`從 node_input 載入 handle (${nodeId}):`, inputKeys);

      if (inputKeys.length > 0) {
        // 從 node_input 直接獲取 handle
        handles = inputKeys.map((handleId) => ({
          id: handleId
        }));
        console.log(`從 node_input 找到 ${handles.length} 個 handle`);
      }
    }

    // 如果有明確的 inputHandles 資料，使用它
    if (data.inputHandles && Array.isArray(data.inputHandles)) {
      console.log(
        `從 inputHandles 屬性載入 ${data.inputHandles.length} 個 handle`
      );
      handles = data.inputHandles;
    }

    // 確保每個 handle ID 都是字符串類型，以防止 ReactFlow 錯誤
    handles = handles.map((handle) => ({
      id: String(handle.id || `input_${Date.now()}`)
    }));

    // 設置 inputs 並更新 ReactFlow 內部結構
    setInputs(handles);

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

  // 使用 useEdges 獲取所有邊緣
  const edges = useEdges();

  // 計算連接到 context handle 的連線數量
  const connectionCount = edges.filter((edge) => edge.target === id).length;

  // 處理新增輸出按鈕點擊
  const handleAddOutput = useCallback(() => {
    // 創建帶有時間戳的新 handle ID
    const newInputId = `input_${Date.now()}`;
    const newInputs = [...inputs, { id: newInputId }];

    console.log(`新增 handle (${nodeId}):`, newInputId);

    // 更新本地狀態
    setInputs(newInputs);

    // 呼叫回調函數以更新父元件中的節點資料
    if (data.onAddOutput) {
      data.onAddOutput(newInputs);
    }
  }, [inputs, data.onAddOutput, nodeId]);

  // 計算節點樣式，包括動態高度
  const nodeStyle = {
    height: `${getNodeHeight()}px`,
    transition: 'height 0.3s ease' // 添加平滑過渡效果
  };

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
            <div>共連線 {connectionCount} 個</div>
          </div>
        )}
      </div>

      {/* 動態渲染 handle */}
      {inputs.map((input, index) => {
        // 計算 handle 的位置
        // 從標準起始位置開始，每個間隔 25px
        const startY = 65; // 白色部分開始的位置
        const spacing = 25; // handle 之間的間距
        const topPosition = startY + index * spacing;

        return (
          <Handle
            key={`handle-${input.id}`}
            type='target'
            position={Position.Left}
            id={String(input.id)}
            style={{
              background: '#e5e7eb',
              borderColor: '#D3D3D3',
              width: '12px',
              height: '12px',
              left: '-6px',
              top: `${topPosition}px`
            }}
            isConnectable={isConnectable}
          />
        );
      })}
    </div>
  );
};

export default memo(BrowserExtensionOutputNode);
