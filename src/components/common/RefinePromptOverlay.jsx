import React, { useState, useEffect, useRef } from 'react';
import { PromptGeneratorService } from '../../services/PromptGeneratorService';
import IconBase from '../icons/IconBase';

// 滾動防 zoom 組件
const ScrollableTextArea = ({ children, className }) => {
  const scrollRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const scrollArea = scrollRef.current;
    if (!scrollArea) return;

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    scrollArea.addEventListener('focus', handleFocus, true);
    scrollArea.addEventListener('blur', handleBlur, true);

    return () => {
      scrollArea.removeEventListener('focus', handleFocus, true);
      scrollArea.removeEventListener('blur', handleBlur, true);
    };
  }, []);

  // 滾輪事件處理 - 參考 AutoResizeText.jsx 的邏輯
  useEffect(() => {
    const scrollArea = scrollRef.current;
    if (!scrollArea) return;

    const handleWheelCapture = (e) => {
      if (scrollArea.contains(e.target)) {
        // 在滾動區域中滾動時，阻止事件冒泡以防止 ReactFlow 縮放
        e.stopPropagation();

        // 檢查是否到達滾動邊界
        const isAtTop = scrollArea.scrollTop <= 0;
        const isAtBottom =
          Math.abs(
            scrollArea.scrollTop +
              scrollArea.clientHeight -
              scrollArea.scrollHeight
          ) <= 1;

        // 如果在邊界嘗試繼續滾動，阻止默認行為以防止頁面滾動
        if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
          e.preventDefault();
        }
      }
    };

    const preventZoom = (e) => {
      if ((e.ctrlKey || e.metaKey) && scrollArea.contains(e.target)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener('wheel', handleWheelCapture, {
      passive: false,
      capture: true
    });
    document.addEventListener('wheel', preventZoom, {
      passive: false,
      capture: true
    });

    return () => {
      document.removeEventListener('wheel', handleWheelCapture, {
        passive: false,
        capture: true
      });
      document.removeEventListener('wheel', preventZoom, {
        passive: false,
        capture: true
      });
    };
  }, []);

  return (
    <div
      ref={scrollRef}
      className={className}
      tabIndex={0} // 使 div 可以獲得焦點
    >
      {children}
    </div>
  );
};

const RefinePromptOverlay = ({
  isOpen,
  onClose,
  originalPrompt,
  llmId,
  onOptimizedPromptApply,
  onOptimizedPromptCopy,
  nodePosition = { x: 0, y: 0 }
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [promptExpanded, setPromptExpanded] = useState(false);
  const [error, setError] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const overlayRef = useRef(null);

  // 追蹤上次的參數，用於判斷是否需要重新發送 API
  const lastParamsRef = useRef({ prompt: '', llmId: null });

  // 當 overlay 打開時重置狀態
  useEffect(() => {
    if (isOpen) {
      const currentParams = { prompt: originalPrompt, llmId };
      const lastParams = lastParamsRef.current;

      // 如果參數改變了，清除之前的結果
      if (
        currentParams.prompt !== lastParams.prompt ||
        currentParams.llmId !== lastParams.llmId
      ) {
        setOptimizedPrompt('');
        setApiResponse(null);
        setError(null);
        lastParamsRef.current = currentParams;
      }
    }
  }, [isOpen, originalPrompt, llmId]);

  // 當 overlay 關閉時重置展開狀態
  useEffect(() => {
    if (!isOpen) {
      setPromptExpanded(false);
    }
  }, [isOpen]);

  // 點擊空白處關閉 - 改進版本
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      // 確保 overlayRef 存在且點擊的不是對話框內部
      if (overlayRef.current && !overlayRef.current.contains(event.target)) {
        onClose();
      }
    };

    // 使用 setTimeout 確保事件監聽器在 DOM 更新後添加
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside, true);
      document.addEventListener('touchstart', handleClickOutside, true);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('touchstart', handleClickOutside, true);
    };
  }, [isOpen, onClose]);

  const generateOptimizedPrompt = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 使用 PromptGeneratorService 調用 API
      const data = await PromptGeneratorService.generateOptimizedPrompt(
        llmId,
        originalPrompt
      );

      setOptimizedPrompt(data.optimized_prompt);
      setApiResponse(data);
    } catch (err) {
      console.error('生成優化提示失敗:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(optimizedPrompt);

      // 顯示成功通知
      if (typeof window !== 'undefined' && window.notify) {
        window.notify({
          message: '已複製到剪貼板',
          type: 'success',
          duration: 2000
        });
      }

      // 執行複製回調（不自動填入）
      if (onOptimizedPromptCopy) {
        onOptimizedPromptCopy();
      }
    } catch (err) {
      console.error('複製失敗:', err);
      if (typeof window !== 'undefined' && window.notify) {
        window.notify({
          message: '複製失敗',
          type: 'error',
          duration: 2000
        });
      }
    }
  };

  const applyOptimizedPrompt = () => {
    if (onOptimizedPromptApply) {
      onOptimizedPromptApply(optimizedPrompt);
    }
    onClose();
  };

  const handleGeneratePrompt = () => {
    generateOptimizedPrompt();
  };

  const truncateText = (text, maxLines = 2) => {
    if (!text) return '';

    // 簡單的截斷邏輯，實際可以根據需要調整
    const words = text.split('');
    const maxChars = maxLines * 50; // 假設每行約 50 字符

    if (words.length <= maxChars || promptExpanded) {
      return text;
    }

    return text.substring(0, maxChars) + '...';
  };

  // 計算定位，讓 overlay 出現在節點右側
  const getOverlayPosition = () => {
    const offsetX = 330; // 節點寬度 + 間距
    const offsetY = -200; // 向上偏移以對齊節點中心

    return {
      left: nodePosition.x + offsetX,
      top: Math.max(nodePosition.y + offsetY, 20) // 確保不會超出視窗頂部
    };
  };

  if (!isOpen) return null;

  const position = getOverlayPosition();

  return (
    <div className='fixed inset-0 z-[9999]'>
      {/* 透明背景層，點擊時關閉對話框 */}
      <div
        className='absolute inset-0 bg-transparent pointer-events-auto'
        onClick={(e) => {
          console.log('背景層被點擊，關閉對話框');
          onClose();
        }}
      />

      {/* 對話框內容 */}
      <div
        ref={overlayRef}
        className='absolute bg-white rounded-lg shadow-xl w-96 max-h-[660px] flex flex-col pointer-events-auto border border-gray-200 z-10'
        style={{
          left: `${position.left}px`,
          top: `${position.top}px`
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-gray-200 rounded-t-lg'>
          <div className='flex items-center space-x-2'>
            <div className='w-6 h-6 bg-cyan-100 rounded flex items-center justify-center'>
              <IconBase type='prompt' />
            </div>
            <h3 className='text-lg font-semibold text-gray-900'>
              Refine Prompt
            </h3>
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 transition-colors'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='20'
              height='20'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'>
              <line
                x1='18'
                y1='6'
                x2='6'
                y2='18'></line>
              <line
                x1='6'
                y1='6'
                x2='18'
                y2='18'></line>
            </svg>
          </button>
        </div>

        {/* 原始 Prompt 顯示區域 - 限制最多2行，也添加滾動保護 */}
        <div className='p-4 border-b border-gray-100'>
          {/* <div className='text-sm text-gray-600 mb-2'>原始 Prompt：</div> */}
          <div className='relative'>
            <ScrollableTextArea className='text-gray-800 text-sm leading-relaxed'>
              {truncateText(originalPrompt)}
            </ScrollableTextArea>
            {originalPrompt && originalPrompt.length > 100 && (
              <button
                onClick={() => setPromptExpanded(!promptExpanded)}
                className='text-cyan-600 hover:text-cyan-700 text-sm mt-1 underline'>
                {promptExpanded ? '收起' : '展開'}
              </button>
            )}
          </div>
        </div>

        {/* 優化結果顯示區域 */}
        <div className='flex-1 p-4 overflow-hidden flex flex-col'>
          {/* 如果還沒有優化結果，顯示生成按鈕 */}
          {!optimizedPrompt && !isLoading && !error && (
            <div className='flex items-center justify-center py-8'>
              <button
                onClick={handleGeneratePrompt}
                disabled={!originalPrompt || !llmId}
                className='px-4 py-2 text-white rounded-md bg-[#00ced1] text-white hover:bg-[#00b8bb] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'>
                生成優化 Prompt
              </button>
            </div>
          )}

          {isLoading && (
            <div className='flex items-center justify-center py-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600'></div>
              <span className='ml-3 text-gray-600'>正在優化 Prompt...</span>
            </div>
          )}

          {error && (
            <div className='bg-red-50 border border-red-200 rounded-md p-4'>
              <div className='text-red-800 text-sm mb-3'>
                <strong>錯誤：</strong> {error}
              </div>
              <button
                onClick={handleGeneratePrompt}
                className='px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm'>
                重新嘗試
              </button>
            </div>
          )}

          {optimizedPrompt && !isLoading && (
            <div className='flex flex-col h-full'>
              <div className='flex items-center justify-between mb-3'>
                <div className='text-sm text-gray-600'>優化後的 Prompt：</div>
              </div>

              {/* 優化結果文字區域 - 限制最大高度並可滾動，防止 zoom 干擾 */}
              <ScrollableTextArea className='flex-1 border border-gray-200 rounded-md p-3 overflow-y-auto max-h-80'>
                <pre className='text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed'>
                  {optimizedPrompt}
                </pre>
              </ScrollableTextArea>

              {/* API 回傳資訊 */}
              {apiResponse && (
                <div className='flex space-x-2 mt-3 justify-end'>
                  <button
                    onClick={applyOptimizedPrompt}
                    className='px-3 py-1 bg-[#00ced1] hover:bg-[#00b8bb] text-white rounded-md transition-colors text-sm flex items-center space-x-1'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='14'
                      height='14'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'>
                      <polyline points='20 6 9 17 4 12'></polyline>
                    </svg>
                    <span>應用</span>
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className='px-3 py-1 text-white rounded-md bg-[#00ced1] hover:bg-[#00b8bb] transition-colors text-sm flex items-center space-x-1'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='14'
                      height='14'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'>
                      <rect
                        x='9'
                        y='9'
                        width='13'
                        height='13'
                        rx='2'
                        ry='2'></rect>
                      <path d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'></path>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RefinePromptOverlay;
