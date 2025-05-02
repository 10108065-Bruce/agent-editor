import React, { memo, useEffect, useState, useRef, useCallback } from 'react';
import { Handle, Position, useUpdateNodeInternals } from 'reactflow';
import IconBase from '../icons/IconBase';
import AddIcon from '../icons/AddIcon';
const BrowserExtensionOutputNode = ({ id, data, isConnectable }) => {
  // 用來追蹤輸入 handle 的狀態
  const [inputs, setInputs] = useState([]);
  const updateNodeInternals = useUpdateNodeInternals(); // 用於通知 ReactFlow 更新節點內部結構
  const initAttempts = useRef(0);
  const nodeId = id || 'unknown'; // 防止 id 為 undefined

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

  return (
    <div className='rounded-lg shadow-md overflow-hidden w-64'>
      {/* 標題部分，帶有圖標 */}
      <div className='bg-gray-100 p-4'>
        <div className='flex items-center'>
          <div className='w-6 h-6 rounded-md bg-teal-500 flex items-center justify-center text-white mr-2'>
            <IconBase type='browser' />
          </div>
          <span className='font-medium'>Browser Extension output</span>
        </div>
      </div>

      {/* 分隔線 */}
      <div className='border-t border-gray-200'></div>

      {/* 白色內容區域 */}
      <div className='bg-white p-4'>
        {/* 添加按鈕 - 青色 */}
        <button
          className='w-full bg-teal-500 hover:bg-teal-600 text-white rounded-md p-2 flex justify-center items-center mb-3'
          onClick={handleAddOutput}>
          <AddIcon />
        </button>

        {/* 輸出文字標籤 */}
        {/* <div className='text-sm text-gray-700'>輸出文字</div> */}

        {/* 當沒有連接點時顯示提示 */}
        {inputs.length === 0 && (
          <div className='text-xs text-gray-500 mt-2 italic'>
            點擊 + 添加輸入點或連線到此節點
          </div>
        )}
      </div>

      {/* 動態渲染 handle */}
      {inputs.map((input, index) => (
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
            top: `${45 + (index + 1) * 20}px` // 每個 handle 之間適當間隔
          }}
          isConnectable={isConnectable}
        />
      ))}

      {/* 添加一個透明的 handle 用於新連線 */}
      {/* <Handle
        type='target'
        position={Position.Left}
        id='new-connection'
        style={{
          opacity: 0.1,
          background: '#999',
          width: '15px',
          height: '15px',
          left: '-7px',
          top: inputs.length > 0 ? `${(inputs.length + 1) * 25}px` : '25px'
        }}
        isConnectable={isConnectable}
      /> */}
    </div>
  );
};

export default memo(BrowserExtensionOutputNode);
