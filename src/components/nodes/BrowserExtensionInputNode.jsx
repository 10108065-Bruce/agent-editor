import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import { iconUploadService } from '../../services/index';
import IconBase from '../icons/IconBase';
import AddIcon from '../icons/AddIcon';

const BrowserExtensionInputNode = ({ data, isConnectable, id }) => {
  // 本地狀態管理
  const [localItems, setLocalItems] = useState(data?.items || []);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);
  const activeItemRef = useRef(null); // 追蹤當前正在上傳的項目索引

  // 同步外部數據到本地狀態 - 使用深度比較來決定是否更新
  useEffect(() => {
    console.log('BrowserExtensionInputNode 數據同步檢查:', {
      'data.items': data?.items,
      localItems,
      'node.id': id
    });

    // 使用深度比較檢查數據是否真的變更
    if (
      Array.isArray(data?.items) &&
      JSON.stringify(data.items) !== JSON.stringify(localItems)
    ) {
      console.log('同步 items 數據到本地狀態');
      setLocalItems([...data.items]); // 確保深拷貝
    }
  }, [data?.items]);

  // 統一更新父組件狀態的輔助函數
  const updateParentState = useCallback(
    (key, value) => {
      console.log(`嘗試更新父組件狀態 ${key}=`, value);

      // 方法1：使用特定回調函數
      if (key === 'items' && data && typeof data.updateItems === 'function') {
        data.updateItems(value);
        return true;
      }

      // 方法2：使用通用回調函數
      if (data && typeof data.updateNodeData === 'function') {
        data.updateNodeData(key, value);
        return true;
      }

      // 方法3：直接修改 data 對象（應急方案）
      if (data) {
        data[key] = value;
        return true;
      }

      console.warn(`無法更新父組件的 ${key}`);
      return false;
    },
    [data]
  );

  // 處理點擊圖標事件
  const handleIconClick = useCallback((index) => {
    console.log(`點擊項目 ${index} 的圖標，準備上傳新圖標`);
    activeItemRef.current = index;

    // 觸發隱藏的文件輸入元素
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  // 處理文件選擇
  const handleFileSelect = useCallback(
    async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const itemIndex = activeItemRef.current;
      if (
        itemIndex === null ||
        itemIndex < 0 ||
        itemIndex >= localItems.length
      ) {
        console.warn('沒有找到活動項目索引或索引超出範圍');
        return;
      }

      setIsUploading(true);
      setUploadError(null);

      try {
        // 使用 iconUploadService 上傳圖標
        const result = await iconUploadService.uploadIcon(file);

        if (result.success && result.url) {
          console.log('圖標上傳成功:', result.url);
          handleIconChange(itemIndex, result.url);
        } else {
          throw new Error(result.error || '上傳失敗');
        }
      } catch (error) {
        console.error('上傳或處理圖標時發生錯誤:', error);
        setUploadError(error.message || '上傳圖標失敗');
      } finally {
        setIsUploading(false);

        // 清空文件選擇，以便於下次選擇相同文件也能觸發 onChange 事件
        event.target.value = '';
      }
    },
    [localItems]
  );

  // 渲染圖標 - 使用包裝 div 來確保點擊事件正常工作
  const getIconComponent = useCallback(
    (iconValue, index) => {
      // 檢查是否為 URL
      if (iconUploadService.isIconUrl(iconValue)) {
        return (
          <div
            className='cursor-pointer'
            onClick={() => handleIconClick(index)}>
            <img
              src={iconValue}
              alt='Custom Icon'
              className='w-7 h-7 object-contain'
            />
          </div>
        );
      }

      // 所有默認圖標都顯示為上傳圖標，使用內聯 SVG 確保點擊事件正確傳遞
      return (
        <div
          className='cursor-pointer'
          onClick={() => handleIconClick(index)}>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'>
            <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'></path>
            <polyline points='17 8 12 3 7 8'></polyline>
            <line
              x1='12'
              y1='3'
              x2='12'
              y2='15'></line>
          </svg>
        </div>
      );
    },
    [handleIconClick]
  );

  // 處理圖標更新 - 僅更新指定項目的圖標屬性，保留其他所有屬性
  const handleIconChange = useCallback(
    (index, iconValue) => {
      console.log(`更新項目 ${index} 的圖標為`, iconValue);

      // 確保索引在有效範圍內
      if (index < 0 || index >= localItems.length) {
        console.warn(`項目索引 ${index} 超出範圍`);
        return;
      }

      // 使用 map 創建新的陣列並只更新指定索引的項目
      const updatedItems = localItems.map((item, idx) =>
        idx === index ? { ...item, icon: iconValue } : item
      );

      // 更新本地狀態
      setLocalItems(updatedItems);

      // 更新父組件狀態
      updateParentState('items', updatedItems);
    },
    [localItems, updateParentState]
  );

  // 處理名稱更新
  const handleNameChange = useCallback(
    (index, value) => {
      console.log(`修改項目 ${index} 的名稱為 "${value}"`);
      console.log('當前 items:', localItems);

      // 確保索引在有效範圍內
      if (index < 0 || index >= localItems.length) {
        console.warn(`項目索引 ${index} 超出範圍`);
        return;
      }

      // 首先，使用 updateItemName 回調（如果存在）
      if (typeof data?.updateItemName === 'function') {
        console.log('使用 updateItemName 回調函數');
        data.updateItemName(index, value);
      }

      // 無論如何，都更新本地狀態
      console.log('使用自定義方法更新項目名稱');

      // 使用 map 創建新的陣列並只更新指定索引的項目
      const updatedItems = localItems.map((item, idx) =>
        idx === index ? { ...item, name: value } : item
      );

      console.log('更新後的 items:', updatedItems);

      // 更新本地狀態
      setLocalItems(updatedItems);

      // 更新父組件狀態
      updateParentState('items', updatedItems);
    },
    [data, localItems, updateParentState]
  );

  // 處理刪除項目的函數
  const handleDeleteItem = useCallback(
    (index) => {
      console.log(`準備刪除項目 ${index}`);

      // 確保索引在有效範圍內
      if (index < 0 || index >= localItems.length) {
        console.warn(`項目索引 ${index} 超出範圍`);
        return;
      }

      // 不允許刪除最後一個項目
      if (localItems.length <= 1) {
        console.warn('不能刪除最後一個項目');
        if (typeof window !== 'undefined' && window.notify) {
          window.notify({
            message: '至少需要保留一個項目',
            type: 'warning',
            duration: 3000
          });
        }
        return;
      }

      // 獲取要刪除的項目資訊
      const itemToDelete = localItems[index];
      const itemOutputKey = itemToDelete.id || `a${index + 1}`;

      console.log(`刪除項目: ${itemToDelete.name}, 輸出鍵: ${itemOutputKey}`);

      // 斷開與此項目相關的所有連線
      if (typeof window !== 'undefined' && window.deleteEdgesBySourceHandle) {
        window.deleteEdgesBySourceHandle(id, itemOutputKey);
      }

      // 過濾掉要刪除的項目，但保持其他項目的原有 ID 不變
      const updatedItems = localItems.filter((_, idx) => idx !== index);

      console.log('刪除後的項目列表:', updatedItems);

      // 更新本地狀態
      setLocalItems(updatedItems);

      // 更新父組件狀態
      updateParentState('items', updatedItems);

      // 直接調用 useFlowNodes 中的 deleteItem 回調，但不讓它重複處理
      // 傳遞 -1 作為特殊標記，表示已經在組件內部處理完畢
      if (typeof data?.deleteItem === 'function') {
        console.log('通知 deleteItem 回調函數 (已處理標記)');
        data.deleteItem(-1); // 使用 -1 作為已處理標記
      }
    },
    [localItems, updateParentState, data, id]
  );

  // 添加新項目的函數
  const handleAddItem = useCallback(() => {
    console.log('添加新項目');

    // 方法1：使用 data.addItem 回調
    if (typeof data?.addItem === 'function') {
      console.log('使用 addItem 回調函數');
      data.addItem();
      return;
    }

    // 方法2：自行更新本地狀態和父組件狀態
    console.log('使用自定義方法添加項目');
    const newItem = { name: '', icon: 'upload' }; // 預設圖標使用 'upload'
    const updatedItems = [...localItems, newItem];

    setLocalItems(updatedItems);
    updateParentState('items', updatedItems);
  }, [data, localItems, updateParentState]);

  // 計算每個連接點的垂直位置
  const calculateHandlePosition = useCallback((index) => {
    // 標題區域高度
    const headerHeight = 46;

    // 內容區域的上邊距
    const contentPadding = 16;

    // 每個項目的高度（包括名稱輸入、圖標和分隔線）
    const itemHeight = 140;

    // 計算連接點的位置
    return headerHeight + contentPadding + index * itemHeight + itemHeight / 2;
  }, []);

  // 為每個item生成outputKey
  const getOutputKey = useCallback((item, index) => {
    // 使用項目的id或生成格式為 'a{index+1}' 的ID
    return item.id || `a${index + 1}`;
  }, []);

  // 使用本地項目或 data.items（如果存在）
  const items =
    Array.isArray(localItems) && localItems.length > 0
      ? localItems
      : Array.isArray(data?.items)
      ? data.items
      : [];

  return (
    <div className='shadow-md w-64 relative'>
      {/* 隱藏的文件輸入元素 */}
      <input
        type='file'
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept='image/*'
        onChange={handleFileSelect}
      />

      {/* 實際內容容器 - 帶圓角和overflow: hidden */}
      <div className='rounded-lg overflow-hidden'>
        {/* Header section with icon and title */}
        <div className='bg-gray-100 p-4'>
          <div className='flex items-center'>
            <div className='w-6 h-6 rounded-md bg-teal-500 flex items-center justify-center text-white mr-2'>
              <IconBase type='browser' />
            </div>
            <span className='font-medium'>Browser Extension input</span>
          </div>
        </div>

        {/* Separator line */}
        <div className='border-t border-gray-200'></div>

        {/* White content area */}
        <div className='bg-white p-2'>
          {/* Multiple name/icon pairs */}
          {items.map((item, idx) => (
            <div
              key={idx}
              className='mb-4 last:mb-2 relative border border-gray-200 bg-gray-50 rounded p-2'>
              {/* 刪除按鈕 - 放在右上角 */}
              {items.length > 1 && (
                <button
                  onClick={() => handleDeleteItem(idx)}
                  className='absolute top-1 right-0 text-gray-400 hover:text-teal-500 text-sm p-1 w-6 h-6 flex items-center justify-center z-10'
                  title='刪除此項目'
                  style={{ fontSize: '14px' }}>
                  ✕
                </button>
              )}

              <div className='mb-2'>
                <label className='block text-sm text-gray-700 mb-1 font-bold'>
                  name
                </label>
                <input
                  type='text'
                  className='w-full border border-gray-300 rounded p-2 text-sm'
                  value={item.name || ''}
                  onChange={(e) => {
                    console.log(`輸入框 ${idx} 值變更為:`, e.target.value);
                    handleNameChange(idx, e.target.value);
                  }}
                />
              </div>

              <div className='flex items-center mb-2'>
                <label className='block text-sm text-gray-700 mr-4 font-bold'>
                  icon
                </label>
                <div className='flex-1 flex justify-center items-center'>
                  <div
                    className={`w-10 h-10 flex justify-center items-center ${
                      isUploading && activeItemRef.current === idx
                        ? 'opacity-50'
                        : ''
                    }`}
                    title='點擊上傳自定義圖標'>
                    {isUploading && activeItemRef.current === idx ? (
                      <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500'></div>
                    ) : (
                      getIconComponent(item.icon, idx)
                    )}
                  </div>
                </div>

                {/* Empty space for alignment */}
                <div className='w-12 h-5'></div>
              </div>

              {/* 顯示上傳錯誤信息 */}
              {uploadError && activeItemRef.current === idx && (
                <div className='text-xs text-red-500 mt-1 mb-2'>
                  {uploadError}
                </div>
              )}

              {/* Separator if not the last item */}
              {/* {idx < items.length - 1 && (
                <div className='border-t border-gray-200 my-3'></div>
              )} */}
            </div>
          ))}

          {/* Add button - teal color - now adds items to the node */}
          <button
            className='w-full bg-teal-500 hover:bg-teal-600 text-white rounded-md p-2 flex justify-center items-center mt-4'
            onClick={handleAddItem}>
            <AddIcon />
          </button>
        </div>
      </div>

      {/* Place all handles outside the overflow:hidden container */}
      {items.map((item, idx) => {
        const outputKey = getOutputKey(item, idx);
        return (
          <Handle
            key={`handle-${idx}`}
            type='source'
            position={Position.Right}
            id={outputKey} // 改用 outputKey 作為 handle ID
            style={{
              background: '#e5e7eb',
              border: '1px solid #D3D3D3',
              width: '12px',
              height: '12px',
              right: '-7px',
              top: calculateHandlePosition(idx),
              transform: 'translateY(-50%)', // Only center vertically
              zIndex: 1000
            }}
            isConnectable={isConnectable}></Handle>
        );
      })}
    </div>
  );
};

export default memo(BrowserExtensionInputNode);
