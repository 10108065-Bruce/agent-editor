import React, {
  memo,
  useReducer,
  useCallback,
  useState,
  useEffect,
  useRef
} from 'react';
import { Handle, Position } from 'reactflow';
import IconBase from '../icons/IconBase';
import AutoResizeTextarea from '../text/AutoResizeText';

const CustomInputNode = ({ data, isConnectable, id }) => {
  // 當前節點狀態管理
  const [localFields, setLocalFields] = useState([]);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  // 關鍵修正：添加 IME 和用戶輸入狀態追踪
  const isComposingInputNameRef = useRef(false);
  const isComposingDefaultValueRef = useRef(false);
  const isUserInputInputNameRef = useRef(false); // 新增：追踪輸入名稱的用戶操作
  const isUserInputDefaultValueRef = useRef(false); // 新增：追踪默認值的用戶操作
  const updateTimeoutRef = useRef({});
  const lastExternalInputNameRef = useRef(''); // 新增：追踪外部輸入名稱
  const lastExternalDefaultValueRef = useRef(''); // 新增：追踪外部默認值

  // 初始化和同步欄位 - 保持與舊版相容，但添加智能同步
  useEffect(() => {
    // 如果 data.fields 存在，更新本地欄位
    if (Array.isArray(data.fields)) {
      // 確保只使用第一個欄位，同時保持與舊版數據格式相容
      const fieldToUse =
        data.fields.length > 0
          ? [data.fields[0]]
          : [
              {
                inputName: 'input_name',
                defaultValue: 'Summary the input text'
              }
            ];

      // 智能同步：只有在非用戶輸入時才更新
      const currentField = localFields[0];
      const newField = fieldToUse[0];

      console.log('CustomInputNode 數據同步檢查:', {
        'current inputName': currentField?.inputName,
        'new inputName': newField?.inputName,
        'current defaultValue': currentField?.defaultValue,
        'new defaultValue': newField?.defaultValue,
        isUserInputInputName: isUserInputInputNameRef.current,
        isUserInputDefaultValue: isUserInputDefaultValueRef.current
      });

      // 只有在非用戶輸入且值真的改變時才同步
      let shouldUpdate = false;

      if (
        !isUserInputInputNameRef.current &&
        newField.inputName !== lastExternalInputNameRef.current
      ) {
        lastExternalInputNameRef.current = newField.inputName;
        shouldUpdate = true;
      }

      if (
        !isUserInputDefaultValueRef.current &&
        newField.defaultValue !== lastExternalDefaultValueRef.current
      ) {
        lastExternalDefaultValueRef.current = newField.defaultValue;
        shouldUpdate = true;
      }

      if (shouldUpdate || localFields.length === 0) {
        setLocalFields(fieldToUse);
      }
    } else {
      // 如果不存在，設置默認欄位
      const defaultFields = [
        {
          inputName: 'input_name',
          defaultValue: 'Summary the input text'
        }
      ];
      setLocalFields(defaultFields);
      lastExternalInputNameRef.current = 'input_name';
      lastExternalDefaultValueRef.current = 'Summary the input text';
    }
  }, [data.fields, localFields]);

  // 清理計時器
  useEffect(() => {
    return () => {
      Object.values(updateTimeoutRef.current).forEach((timeout) => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  // 處理更新欄位名稱 - 保持與舊版相容的函數
  const handleUpdateFieldInputName = useCallback(
    (index, value) => {
      if (typeof data.updateFieldInputName === 'function') {
        // 使用原來的更新函數 - 保持與舊版結構相容
        data.updateFieldInputName(index, value);
      } else {
        // 本地實現更新欄位名稱功能
        console.warn(
          `節點 ${id}: updateFieldInputName 函數未定義，使用本地實現`
        );

        const updatedFields = [...localFields];
        if (index >= 0 && index < updatedFields.length) {
          updatedFields[index] = {
            ...updatedFields[index],
            inputName: value
          };

          // 更新本地欄位狀態
          setLocalFields(updatedFields);

          // 如果 data.fields 存在，也同步更新
          if (data.fields) {
            data.fields = updatedFields;
          }

          // 強制重新渲染
          forceUpdate();
        }
      }
    },
    [data, localFields, id]
  );

  // 處理更新欄位默認值 - 保持與舊版相容的函數
  const handleUpdateFieldDefaultValue = useCallback(
    (index, value) => {
      if (typeof data.updateFieldDefaultValue === 'function') {
        // 使用原來的更新函數
        data.updateFieldDefaultValue(index, value);
      } else {
        // 本地實現更新欄位默認值功能

        const updatedFields = [...localFields];
        if (index >= 0 && index < updatedFields.length) {
          updatedFields[index] = {
            ...updatedFields[index],
            defaultValue: value
          };

          // 更新本地欄位狀態
          setLocalFields(updatedFields);

          // 如果 data.fields 存在，也同步更新
          if (data.fields) {
            data.fields = updatedFields;
          }

          // 強制重新渲染
          forceUpdate();
        }
      }
    },
    [data, localFields, id]
  );

  // 關鍵修正：改進的延遲更新函數
  const debouncedUpdate = useCallback(
    (updateFunction, index, value, fieldType) => {
      const timeoutKey = `${fieldType}_${index}`;

      // 清除之前的計時器
      if (updateTimeoutRef.current[timeoutKey]) {
        clearTimeout(updateTimeoutRef.current[timeoutKey]);
      }

      // 設置新的延遲更新
      updateTimeoutRef.current[timeoutKey] = setTimeout(() => {
        updateFunction(index, value);

        // 延遲重置用戶輸入標記
        setTimeout(() => {
          if (fieldType === 'inputName') {
            isUserInputInputNameRef.current = false;
          } else if (fieldType === 'defaultValue') {
            isUserInputDefaultValueRef.current = false;
          }
        }, 100);
      }, 150); // 增加延遲以確保操作完成
    },
    []
  );

  // 關鍵修正：處理輸入名稱變更 - 支援 IME 和刪除操作
  const handleInputNameChange = useCallback(
    (e) => {
      const value = e.target.value;

      // 標記為用戶輸入
      isUserInputInputNameRef.current = true;

      // 立即更新本地狀態和外部記錄
      const updatedFields = [...localFields];
      if (updatedFields.length > 0) {
        updatedFields[0] = {
          ...updatedFields[0],
          inputName: value
        };
        setLocalFields(updatedFields);
        lastExternalInputNameRef.current = value; // 同步記錄
      }

      // 只有在不是 IME 組合狀態時才延遲更新父組件
      if (!isComposingInputNameRef.current) {
        debouncedUpdate(handleUpdateFieldInputName, 0, value, 'inputName');
      }
    },
    [localFields, handleUpdateFieldInputName, debouncedUpdate]
  );

  // 關鍵修正：處理默認值變更 - 支援 IME 和刪除操作
  const handleDefaultValueChange = useCallback(
    (e) => {
      const value = e.target.value;

      // 標記為用戶輸入
      isUserInputDefaultValueRef.current = true;

      // 立即更新本地狀態和外部記錄
      const updatedFields = [...localFields];
      if (updatedFields.length > 0) {
        updatedFields[0] = {
          ...updatedFields[0],
          defaultValue: value
        };
        setLocalFields(updatedFields);
        lastExternalDefaultValueRef.current = value; // 同步記錄
      }

      // 只有在不是 IME 組合狀態時才延遲更新父組件
      if (!isComposingDefaultValueRef.current) {
        debouncedUpdate(
          handleUpdateFieldDefaultValue,
          0,
          value,
          'defaultValue'
        );
      }
    },
    [localFields, handleUpdateFieldDefaultValue, debouncedUpdate]
  );

  // 關鍵修正：IME 組合開始處理
  const handleInputNameCompositionStart = useCallback(() => {
    isComposingInputNameRef.current = true;
    isUserInputInputNameRef.current = true;

    // 清除任何待執行的更新
    const timeoutKey = 'inputName_0';
    if (updateTimeoutRef.current[timeoutKey]) {
      clearTimeout(updateTimeoutRef.current[timeoutKey]);
      updateTimeoutRef.current[timeoutKey] = null;
    }
  }, []);

  const handleDefaultValueCompositionStart = useCallback(() => {
    isComposingDefaultValueRef.current = true;
    isUserInputDefaultValueRef.current = true;

    // 清除任何待執行的更新
    const timeoutKey = 'defaultValue_0';
    if (updateTimeoutRef.current[timeoutKey]) {
      clearTimeout(updateTimeoutRef.current[timeoutKey]);
      updateTimeoutRef.current[timeoutKey] = null;
    }
  }, []);

  // 關鍵修正：IME 組合結束處理
  const handleInputNameCompositionEnd = useCallback(
    (e) => {
      isComposingInputNameRef.current = false;

      const finalValue = e.target.value;
      // 更新記錄
      lastExternalInputNameRef.current = finalValue;

      // 立即更新父組件
      handleUpdateFieldInputName(0, finalValue);

      // 延遲重置用戶輸入標記
      setTimeout(() => {
        isUserInputInputNameRef.current = false;
      }, 200);
    },
    [handleUpdateFieldInputName]
  );

  const handleDefaultValueCompositionEnd = useCallback(
    (e) => {
      isComposingDefaultValueRef.current = false;

      const finalValue = e.target.value;

      // 更新記錄
      lastExternalDefaultValueRef.current = finalValue;

      // 立即更新父組件
      handleUpdateFieldDefaultValue(0, finalValue);

      // 延遲重置用戶輸入標記
      setTimeout(() => {
        isUserInputDefaultValueRef.current = false;
      }, 200);
    },
    [handleUpdateFieldDefaultValue]
  );

  // 新增：處理鍵盤事件，特別是刪除操作
  const handleInputNameKeyDown = useCallback((e) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      isUserInputInputNameRef.current = true;

      // 延遲重置標記
      setTimeout(() => {
        isUserInputInputNameRef.current = false;
      }, 300);
    }
  }, []);

  const handleDefaultValueKeyDown = useCallback((e) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      isUserInputDefaultValueRef.current = true;

      // 延遲重置標記
      setTimeout(() => {
        isUserInputDefaultValueRef.current = false;
      }, 300);
    }
  }, []);

  // 使用本地欄位或 data.fields（如果存在）
  const fields =
    Array.isArray(localFields) && localFields.length > 0
      ? localFields
      : Array.isArray(data.fields)
      ? data.fields
      : [];

  return (
    <div className='shadow-md w-64 relative'>
      {/* Header section with icon and title */}
      <div className='bg-gray-100 rounded-t-lg p-4 overflow-hidden'>
        <div className='flex items-center'>
          <div className='w-6 h-6 flex items-center justify-center text-white mr-2'>
            <IconBase type='input' />
          </div>
          <span className='font-medium'>Input</span>
        </div>
      </div>

      {/* Separator line */}
      <div className='border-t border-gray-200'></div>

      {/* White content area */}
      <div className='rounded-lg shadow-md rounded-lg w-64 relative'>
        <div className='bg-white rounded-bl-xl rounded-br-xl p-4'>
          {/* Display a message if no fields */}
          {fields.length === 0 && (
            <div className='text-gray-500 text-sm mb-4'>
              No input field found
            </div>
          )}

          {/* Single input field - 只顯示第一個欄位 */}
          {fields.length > 0 && (
            <div className='mb-4 last:mb-2 relative'>
              <div className='mb-2'>
                <label className='block text-sm text-gray-700 mb-1 font-bold'>
                  input_name
                </label>
                {/* 關鍵修正：添加 IME 和鍵盤事件處理 */}
                <input
                  type='text'
                  className='w-full border border-gray-300 rounded p-2 text-sm'
                  placeholder='AI node prompt'
                  value={fields[0].inputName || ''}
                  onChange={handleInputNameChange}
                  onCompositionStart={handleInputNameCompositionStart}
                  onCompositionEnd={handleInputNameCompositionEnd}
                  onKeyDown={handleInputNameKeyDown} // 新增：處理刪除操作
                />
              </div>

              <div className='mb-2'>
                <label className='block text-sm text-gray-700 mb-1 font-bold'>
                  default_value
                </label>
                {/* 關鍵修正：添加 IME 和鍵盤事件處理 */}
                <AutoResizeTextarea
                  value={fields[0].defaultValue || ''}
                  onChange={handleDefaultValueChange}
                  onCompositionStart={handleDefaultValueCompositionStart}
                  onCompositionEnd={handleDefaultValueCompositionEnd}
                  onKeyDown={handleDefaultValueKeyDown} // 新增：處理刪除操作
                  placeholder='Summary the input text'
                />
              </div>

              {/* Handle with ID "output" instead of "output-0" */}
              <div
                style={{
                  position: 'absolute',
                  right: '-18px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '10px',
                  height: '10px',
                  background: 'transparent'
                }}>
                <Handle
                  type='source'
                  position={Position.Right}
                  id={`output`}
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(CustomInputNode);
