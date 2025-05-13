import React, {
  memo,
  useReducer,
  useCallback,
  useState,
  useEffect
} from 'react';
import { Handle, Position } from 'reactflow';
import IconBase from '../icons/IconBase';
import AutoResizeTextarea from '../text/AutoResizeText';

const CustomInputNode = ({ data, isConnectable, id }) => {
  // 當前節點狀態管理
  const [localFields, setLocalFields] = useState([]);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  // 初始化和同步欄位 - 保持與舊版相容
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
      setLocalFields(fieldToUse);
    } else {
      // 如果不存在，設置默認欄位
      setLocalFields([
        {
          inputName: 'input_name',
          defaultValue: 'Summary the input text'
        }
      ]);
    }
  }, [data.fields]);

  // 處理更新欄位名稱 - 保持與舊版相容的函數
  const handleUpdateFieldInputName = useCallback(
    (index, value) => {
      console.log('更新欄位名稱', {
        hasUpdateField: typeof data.updateFieldInputName === 'function',
        index,
        value,
        nodeId: id
      });

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
      console.log('更新欄位默認值', {
        hasUpdateDefaultValue:
          typeof data.updateFieldDefaultValue === 'function',
        index,
        value,
        nodeId: id
      });

      if (typeof data.updateFieldDefaultValue === 'function') {
        // 使用原來的更新函數
        data.updateFieldDefaultValue(index, value);
      } else {
        // 本地實現更新欄位默認值功能
        console.warn(
          `節點 ${id}: updateFieldDefaultValue 函數未定義，使用本地實現`
        );

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
                <input
                  type='text'
                  className='w-full border border-gray-300 rounded p-2 text-sm'
                  placeholder='AI node prompt'
                  value={fields[0].inputName || ''}
                  onChange={(e) =>
                    handleUpdateFieldInputName(0, e.target.value)
                  }
                />
              </div>

              <div className='mb-2'>
                <label className='block text-sm text-gray-700 mb-1 font-bold'>
                  default_value
                </label>
                <AutoResizeTextarea
                  value={fields[0].defaultValue || ''}
                  onChange={(e) =>
                    handleUpdateFieldDefaultValue(0, e.target.value)
                  }
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
