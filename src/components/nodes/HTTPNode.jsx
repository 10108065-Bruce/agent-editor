import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import IconBase from '../icons/IconBase';
import AddIcon from '../icons/AddIcon';
import AutoResizeTextarea from '../text/AutoResizeText';
import { formatNodeTitle } from '../../utils/nodeUtils';

const HttpRequestNode = ({ data, isConnectable, id }) => {
  // 管理各個狀態
  const [localUrl, setLocalUrl] = useState(data?.url || '');
  const [localMethod, setLocalMethod] = useState(data?.method || 'GET');
  const [headers, setHeaders] = useState(
    data?.headers || [{ key: '', value: '' }]
  );
  const [localBody, setLocalBody] = useState(data?.body || '');

  // IME 和用戶輸入狀態追踪 - URL 欄位
  const isComposingUrlRef = useRef(false);
  const updateUrlTimeoutRef = useRef(null);
  const lastExternalUrlRef = useRef(data?.url || '');
  const isUserInputUrlRef = useRef(false);

  // IME 和用戶輸入狀態追踪 - Body 欄位
  const isComposingBodyRef = useRef(false);
  const updateBodyTimeoutRef = useRef(null);
  const lastExternalBodyRef = useRef(data?.body || '');
  const isUserInputBodyRef = useRef(false);

  // Header 欄位的 IME 狀態追踪
  const isComposingHeaderKeyRef = useRef({});
  const isComposingHeaderValueRef = useRef({});
  const updateHeaderTimeoutRef = useRef({});
  const isUserInputHeaderRef = useRef({});
  const lastExternalHeaderRef = useRef({});

  // 改進的同步狀態 - URL
  useEffect(() => {
    if (
      data?.url !== undefined &&
      data.url !== lastExternalUrlRef.current &&
      !isComposingUrlRef.current &&
      !isUserInputUrlRef.current
    ) {
      setLocalUrl(data.url);
      lastExternalUrlRef.current = data.url;
    }
  }, [data?.url]);

  // 改進的同步狀態 - Method
  useEffect(() => {
    if (data?.method && data.method !== localMethod) {
      setLocalMethod(data.method);
    }
  }, [data?.method, localMethod]);

  // 改進的同步狀態 - Headers
  useEffect(() => {
    if (
      data?.headers &&
      JSON.stringify(data.headers) !== JSON.stringify(headers)
    ) {
      setHeaders(data.headers);
    }
  }, [data?.headers, headers]);

  // 改進的同步狀態 - Body
  useEffect(() => {
    if (
      data?.body !== undefined &&
      data.body !== lastExternalBodyRef.current &&
      !isComposingBodyRef.current &&
      !isUserInputBodyRef.current
    ) {
      setLocalBody(data.body);
      lastExternalBodyRef.current = data.body;
    }
  }, [data?.body]);

  const updateParentState = useCallback(
    (key, value) => {
      if (data && typeof data.updateNodeData === 'function') {
        data.updateNodeData(key, value);
        return true;
      }
      if (data) {
        data[key] = value;
        return true;
      }
      return false;
    },
    [data]
  );

  // URL 變更處理 - 支援 IME
  const handleUrlChange = useCallback(
    (e) => {
      const newUrl = e.target.value;

      // 標記為用戶輸入
      isUserInputUrlRef.current = true;

      // 立即更新本地狀態
      setLocalUrl(newUrl);
      lastExternalUrlRef.current = newUrl;

      // 清除之前的更新計時器
      if (updateUrlTimeoutRef.current) {
        clearTimeout(updateUrlTimeoutRef.current);
      }

      // 如果不是在組合狀態，延遲更新父組件
      if (!isComposingUrlRef.current) {
        updateUrlTimeoutRef.current = setTimeout(() => {
          updateParentState('url', newUrl);

          // 重置用戶輸入標記
          setTimeout(() => {
            isUserInputUrlRef.current = false;
          }, 100);
        }, 150);
      }
    },
    [updateParentState]
  );

  // URL IME 組合開始處理
  const handleUrlCompositionStart = useCallback(() => {
    isComposingUrlRef.current = true;
    isUserInputUrlRef.current = true;

    // 清除任何待執行的更新
    if (updateUrlTimeoutRef.current) {
      clearTimeout(updateUrlTimeoutRef.current);
      updateUrlTimeoutRef.current = null;
    }
  }, []);

  // URL IME 組合結束處理
  const handleUrlCompositionEnd = useCallback(
    (e) => {
      isComposingUrlRef.current = false;

      const finalValue = e.target.value;
      setLocalUrl(finalValue);
      lastExternalUrlRef.current = finalValue;

      // 立即更新父組件
      updateParentState('url', finalValue);

      // 延遲重置用戶輸入標記
      setTimeout(() => {
        isUserInputUrlRef.current = false;
      }, 200);
    },
    [updateParentState]
  );

  // URL 鍵盤事件處理
  const handleUrlKeyDown = useCallback((e) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      isUserInputUrlRef.current = true;
      setTimeout(() => {
        isUserInputUrlRef.current = false;
      }, 300);
    }
  }, []);

  // Method 變更處理
  const handleMethodChange = useCallback(
    (e) => {
      const newMethod = e.target.value;
      setLocalMethod(newMethod);
      updateParentState('method', newMethod);
    },
    [updateParentState]
  );

  // Body 變更處理 - 支援 IME
  const handleBodyChange = useCallback(
    (e) => {
      const newBody = e.target.value;

      // 標記為用戶輸入
      isUserInputBodyRef.current = true;

      // 立即更新本地狀態
      setLocalBody(newBody);
      lastExternalBodyRef.current = newBody;

      // 清除之前的更新計時器
      if (updateBodyTimeoutRef.current) {
        clearTimeout(updateBodyTimeoutRef.current);
      }

      // 如果不是在組合狀態，延遲更新父組件
      if (!isComposingBodyRef.current) {
        updateBodyTimeoutRef.current = setTimeout(() => {
          updateParentState('body', newBody);

          // 重置用戶輸入標記
          setTimeout(() => {
            isUserInputBodyRef.current = false;
          }, 100);
        }, 150);
      }
    },
    [updateParentState]
  );

  // Body IME 組合開始處理
  const handleBodyCompositionStart = useCallback(() => {
    isComposingBodyRef.current = true;
    isUserInputBodyRef.current = true;

    // 清除任何待執行的更新
    if (updateBodyTimeoutRef.current) {
      clearTimeout(updateBodyTimeoutRef.current);
      updateBodyTimeoutRef.current = null;
    }
  }, []);

  // Body IME 組合結束處理
  const handleBodyCompositionEnd = useCallback(
    (e) => {
      isComposingBodyRef.current = false;

      const finalValue = e.target.value;
      setLocalBody(finalValue);
      lastExternalBodyRef.current = finalValue;

      // 立即更新父組件
      updateParentState('body', finalValue);

      // 延遲重置用戶輸入標記
      setTimeout(() => {
        isUserInputBodyRef.current = false;
      }, 200);
    },
    [updateParentState]
  );

  // Body 鍵盤事件處理
  const handleBodyKeyDown = useCallback((e) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      isUserInputBodyRef.current = true;
      setTimeout(() => {
        isUserInputBodyRef.current = false;
      }, 300);
    }
  }, []);

  // 新增 Header
  const handleAddHeader = useCallback(() => {
    const newHeader = { key: '', value: '' };
    const newHeaders = [...headers, newHeader];
    setHeaders(newHeaders);
    updateParentState('headers', newHeaders);
  }, [headers, updateParentState]);

  // 刪除 Header
  const handleDeleteHeader = useCallback(
    (index) => {
      const newHeaders = headers.filter((_, i) => i !== index);
      setHeaders(newHeaders);
      updateParentState('headers', newHeaders);

      // 清理該索引的相關 ref
      delete isComposingHeaderKeyRef.current[index];
      delete isComposingHeaderValueRef.current[index];
      delete updateHeaderTimeoutRef.current[`key_${index}`];
      delete updateHeaderTimeoutRef.current[`value_${index}`];
      delete isUserInputHeaderRef.current[`key_${index}`];
      delete isUserInputHeaderRef.current[`value_${index}`];
      delete lastExternalHeaderRef.current[`key_${index}`];
      delete lastExternalHeaderRef.current[`value_${index}`];
    },
    [headers, updateParentState]
  );

  // 更新 Header Key - 支援 IME
  const handleHeaderKeyChange = useCallback(
    (index, value) => {
      const fieldKey = `key_${index}`;

      // 標記為用戶輸入
      isUserInputHeaderRef.current[fieldKey] = true;

      // 立即更新本地狀態
      const newHeaders = [...headers];
      newHeaders[index].key = value;
      setHeaders(newHeaders);
      lastExternalHeaderRef.current[fieldKey] = value;

      // 清除之前的更新計時器
      if (updateHeaderTimeoutRef.current[fieldKey]) {
        clearTimeout(updateHeaderTimeoutRef.current[fieldKey]);
      }

      // 如果不是在組合狀態，延遲更新父組件
      if (!isComposingHeaderKeyRef.current[index]) {
        updateHeaderTimeoutRef.current[fieldKey] = setTimeout(() => {
          updateParentState('headers', newHeaders);

          // 重置用戶輸入標記
          setTimeout(() => {
            isUserInputHeaderRef.current[fieldKey] = false;
          }, 100);
        }, 150);
      }
    },
    [headers, updateParentState]
  );

  // 更新 Header Value - 支援 IME
  const handleHeaderValueChange = useCallback(
    (index, value) => {
      const fieldKey = `value_${index}`;

      // 標記為用戶輸入
      isUserInputHeaderRef.current[fieldKey] = true;

      // 立即更新本地狀態
      const newHeaders = [...headers];
      newHeaders[index].value = value;
      setHeaders(newHeaders);
      lastExternalHeaderRef.current[fieldKey] = value;

      // 清除之前的更新計時器
      if (updateHeaderTimeoutRef.current[fieldKey]) {
        clearTimeout(updateHeaderTimeoutRef.current[fieldKey]);
      }

      // 如果不是在組合狀態，延遲更新父組件
      if (!isComposingHeaderValueRef.current[index]) {
        updateHeaderTimeoutRef.current[fieldKey] = setTimeout(() => {
          updateParentState('headers', newHeaders);

          // 重置用戶輸入標記
          setTimeout(() => {
            isUserInputHeaderRef.current[fieldKey] = false;
          }, 100);
        }, 150);
      }
    },
    [headers, updateParentState]
  );

  // Header Key IME 事件處理
  const handleHeaderKeyCompositionStart = useCallback((index) => {
    isComposingHeaderKeyRef.current[index] = true;
    isUserInputHeaderRef.current[`key_${index}`] = true;

    // 清除任何待執行的更新
    const fieldKey = `key_${index}`;
    if (updateHeaderTimeoutRef.current[fieldKey]) {
      clearTimeout(updateHeaderTimeoutRef.current[fieldKey]);
      updateHeaderTimeoutRef.current[fieldKey] = null;
    }
  }, []);

  const handleHeaderKeyCompositionEnd = useCallback(
    (index, e) => {
      isComposingHeaderKeyRef.current[index] = false;

      const finalValue = e.target.value;
      const newHeaders = [...headers];
      newHeaders[index].key = finalValue;
      setHeaders(newHeaders);
      lastExternalHeaderRef.current[`key_${index}`] = finalValue;

      // 立即更新父組件
      updateParentState('headers', newHeaders);

      // 延遲重置用戶輸入標記
      setTimeout(() => {
        isUserInputHeaderRef.current[`key_${index}`] = false;
      }, 200);
    },
    [headers, updateParentState]
  );

  // Header Value IME 事件處理
  const handleHeaderValueCompositionStart = useCallback((index) => {
    isComposingHeaderValueRef.current[index] = true;
    isUserInputHeaderRef.current[`value_${index}`] = true;

    // 清除任何待執行的更新
    const fieldKey = `value_${index}`;
    if (updateHeaderTimeoutRef.current[fieldKey]) {
      clearTimeout(updateHeaderTimeoutRef.current[fieldKey]);
      updateHeaderTimeoutRef.current[fieldKey] = null;
    }
  }, []);

  const handleHeaderValueCompositionEnd = useCallback(
    (index, e) => {
      isComposingHeaderValueRef.current[index] = false;

      const finalValue = e.target.value;
      const newHeaders = [...headers];
      newHeaders[index].value = finalValue;
      setHeaders(newHeaders);
      lastExternalHeaderRef.current[`value_${index}`] = finalValue;

      // 立即更新父組件
      updateParentState('headers', newHeaders);

      // 延遲重置用戶輸入標記
      setTimeout(() => {
        isUserInputHeaderRef.current[`value_${index}`] = false;
      }, 200);
    },
    [headers, updateParentState]
  );

  // Header 鍵盤事件處理
  const handleHeaderKeyDown = useCallback((index, type, e) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      const fieldKey = `${type}_${index}`;
      isUserInputHeaderRef.current[fieldKey] = true;
      setTimeout(() => {
        isUserInputHeaderRef.current[fieldKey] = false;
      }, 300);
    }
  }, []);

  // 清理計時器
  useEffect(() => {
    return () => {
      if (updateUrlTimeoutRef.current) {
        clearTimeout(updateUrlTimeoutRef.current);
      }
      if (updateBodyTimeoutRef.current) {
        clearTimeout(updateBodyTimeoutRef.current);
      }
      Object.values(updateHeaderTimeoutRef.current).forEach((timeout) => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  // Method 選項
  const methodOptions = [
    { value: 'GET', label: 'GET' },
    { value: 'POST', label: 'POST' }
  ];

  return (
    <div className='rounded-lg shadow-md overflow-hidden w-98 max-w-lg'>
      {/* Header section */}
      <div className='bg-gray-100 p-4'>
        <div className='flex items-center'>
          <div className='w-6 h-6 rounded-full bg-red-400 flex items-center justify-center text-white mr-2'>
            <IconBase type='http' />
          </div>
          <span className='font-medium'> {formatNodeTitle('HTTP', id)}</span>
        </div>
      </div>

      <div className='border-t border-gray-200'></div>

      {/* Content area */}
      <div className='bg-white p-4'>
        {/* URL section - 關鍵修正部分 */}
        <div className='mb-4'>
          <label className='block text-sm text-gray-700 mb-1 font-bold'>
            url
          </label>
          <input
            type='text'
            value={localUrl}
            onChange={handleUrlChange}
            onCompositionStart={handleUrlCompositionStart}
            onCompositionEnd={handleUrlCompositionEnd}
            onKeyDown={handleUrlKeyDown}
            className='w-full border border-gray-300 rounded p-2 text-sm'
            placeholder='url'
          />
        </div>

        {/* Method section */}
        <div className='mb-4'>
          <label className='block text-sm text-gray-700 mb-1 font-bold'>
            Method
          </label>
          <div className='relative'>
            <select
              className='w-full border border-gray-300 rounded p-2 text-sm bg-white appearance-none'
              value={localMethod}
              onChange={handleMethodChange}>
              {methodOptions.map((option) => (
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

        {/* Header section - 關鍵修正部分 */}
        <div className='mb-4'>
          <label className='block text-sm text-gray-700 mb-2 font-bold'>
            Header (optional)
          </label>

          {/* Headers list */}
          <div className='space-y-2'>
            {headers.map((header, index) => (
              <div
                key={index}
                className='grid grid-cols-12 gap-2 items-center'>
                {/* Key column */}
                <div className='col-span-5'>
                  <label className='block text-xs text-gray-600 mb-1 font-bold'>
                    Key
                  </label>
                  <input
                    type='text'
                    value={header.key}
                    onChange={(e) =>
                      handleHeaderKeyChange(index, e.target.value)
                    }
                    onCompositionStart={() =>
                      handleHeaderKeyCompositionStart(index)
                    }
                    onCompositionEnd={(e) =>
                      handleHeaderKeyCompositionEnd(index, e)
                    }
                    onKeyDown={(e) => handleHeaderKeyDown(index, 'key', e)}
                    className='w-full border border-gray-300 rounded px-2 py-1 text-xs'
                    placeholder='key'
                  />
                </div>

                {/* Value column */}
                <div className='col-span-6'>
                  <label className='block text-xs text-gray-600 mb-1 font-bold'>
                    Value
                  </label>
                  <input
                    type='text'
                    value={header.value}
                    onChange={(e) =>
                      handleHeaderValueChange(index, e.target.value)
                    }
                    onCompositionStart={() =>
                      handleHeaderValueCompositionStart(index)
                    }
                    onCompositionEnd={(e) =>
                      handleHeaderValueCompositionEnd(index, e)
                    }
                    onKeyDown={(e) => handleHeaderKeyDown(index, 'value', e)}
                    className='w-full border border-gray-300 rounded px-2 py-1 text-xs'
                    placeholder='value'
                  />
                </div>

                {/* Delete button */}
                {headers.length > 1 && (
                  <div className='col-span-1 flex justify-center items-end h-full pb-1 mt-2'>
                    <button
                      onClick={() => handleDeleteHeader(index)}
                      className='text-black-500 hover:text-red-600 text-sm p-1'
                      title='刪除 Header'>
                      ✕
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Add Header button */}
        <button
          className='w-full bg-teal-500 hover:bg-teal-600 text-white rounded-md p-2 flex justify-center items-center mb-4'
          onClick={handleAddHeader}>
          <AddIcon />
        </button>

        {/* Body section - 關鍵修正部分 - 只有當 method 是 POST 時才顯示 */}
        {localMethod === 'POST' && (
          <div className='mb-4'>
            <label className='block text-sm text-gray-700 mb-1 font-bold'>
              Body (optional)
            </label>
            <AutoResizeTextarea
              value={localBody}
              onChange={handleBodyChange}
              onCompositionStart={handleBodyCompositionStart}
              onCompositionEnd={handleBodyCompositionEnd}
              onKeyDown={handleBodyKeyDown}
              placeholder='{"flow_id": "9e956c37-20ea-47a5-bcd5-3cafc35b967a", "func_id": "q1", "data":"$input"}'
              className='text-xs font-mono bg-gray-900 text-green-400 border-gray-300'
              style={{
                fontFamily: 'Monaco, Menlo, Consolas, "Courier New", monospace'
              }}
            />
          </div>
        )}
      </div>

      {/* Handles */}
      <Handle
        type='target'
        position={Position.Left}
        id='body'
        style={{
          background: '#e5e7eb',
          border: '1px solid #D3D3D3',
          width: '12px',
          height: '12px',
          left: '-6px',
          transform: 'translateY(-50%)'
        }}
        isConnectable={isConnectable}
      />

      <Handle
        type='source'
        position={Position.Right}
        id='output'
        style={{
          background: '#e5e7eb',
          border: '1px solid #D3D3D3',
          width: '12px',
          height: '12px',
          right: '-6px'
        }}
        isConnectable={isConnectable}
      />
    </div>
  );
};

export default memo(HttpRequestNode);
