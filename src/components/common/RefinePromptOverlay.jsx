import React, { useState, useEffect, useRef } from 'react';
import { PromptGeneratorService } from '../../services/PromptGeneratorService';
import IconBase from '../icons/IconBase';
import InsertIcon from '../../assets/text-insert-off.png';
import CopytIncon from '../../assets/text-copy-off.png';

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

// 專門用於可選取文字的滾動區域組件
const SelectableTextArea = ({ children, className }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    const scrollArea = scrollRef.current;
    if (!scrollArea) return;

    const handleWheelCapture = (e) => {
      if (scrollArea.contains(e.target)) {
        // 阻止事件冒泡以防止 ReactFlow 縮放
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

    // 防止 Ctrl/Cmd + 滾輪縮放
    const preventZoom = (e) => {
      if ((e.ctrlKey || e.metaKey) && scrollArea.contains(e.target)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // 阻止滑鼠拖拽事件傳播到父層（防止觸發節點移動）
    const handleMouseDown = (e) => {
      // 只在文字選取區域內阻止事件傳播
      if (scrollArea.contains(e.target)) {
        e.stopPropagation();
      }
    };

    const handleMouseMove = (e) => {
      // 如果正在選取文字，阻止事件傳播
      if (scrollArea.contains(e.target) && e.buttons === 1) {
        e.stopPropagation();
      }
    };

    const handleMouseUp = (e) => {
      if (scrollArea.contains(e.target)) {
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

    // 添加滑鼠事件監聽器
    scrollArea.addEventListener('mousedown', handleMouseDown, true);
    scrollArea.addEventListener('mousemove', handleMouseMove, true);
    scrollArea.addEventListener('mouseup', handleMouseUp, true);

    return () => {
      document.removeEventListener('wheel', handleWheelCapture, {
        passive: false,
        capture: true
      });
      document.removeEventListener('wheel', preventZoom, {
        passive: false,
        capture: true
      });

      scrollArea.removeEventListener('mousedown', handleMouseDown, true);
      scrollArea.removeEventListener('mousemove', handleMouseMove, true);
      scrollArea.removeEventListener('mouseup', handleMouseUp, true);
    };
  }, []);

  return (
    <div
      ref={scrollRef}
      className={className}>
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
  nodePosition = { x: 0, y: 0 },
  offsetX = 330, // 可動態傳入的 X 軸偏移量，默認 330
  offsetY = -200 // 也讓 Y 軸偏移量可配置，默認 -200
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
      // 檢查是否有選取的文字
      const selection = window.getSelection();
      let textToCopy = '';
      let copyType = '';

      if (selection && selection.toString().trim()) {
        // 有選取文字，複製選取的內容
        textToCopy = selection.toString();
        copyType = '選取內容';
      } else {
        // 沒有選取文字，複製全部內容
        textToCopy = optimizedPrompt;
        copyType = '全部內容';
      }

      // 首先嘗試使用 Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(textToCopy);

          // 顯示成功通知
          if (typeof window !== 'undefined' && window.notify) {
            window.notify({
              message: `已複製${copyType}到剪貼板`,
              type: 'success',
              duration: 2000
            });
          }

          // 執行複製回調
          if (onOptimizedPromptCopy) {
            onOptimizedPromptCopy(textToCopy);
          }
          return;
        } catch (clipboardError) {
          console.warn('Clipboard API 失敗，嘗試 fallback:', clipboardError);
        }
      }

      // Fallback 到傳統方法
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      textArea.style.cssText =
        'position:fixed;top:0;left:0;opacity:0;pointer-events:none;';

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      if (successful) {
        // 顯示成功通知
        if (typeof window !== 'undefined' && window.notify) {
          window.notify({
            message: `已複製${copyType}到剪貼板`,
            type: 'success',
            duration: 2000
          });
        }

        // 執行複製回調
        if (onOptimizedPromptCopy) {
          onOptimizedPromptCopy(textToCopy);
        }
      } else {
        throw new Error('所有複製方法都失敗');
      }
    } catch (error) {
      console.error('複製失敗:', error);
      if (typeof window !== 'undefined' && window.notify) {
        window.notify({
          message: '複製失敗，請手動複製 Prompt',
          type: 'error',
          duration: 3000
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

  // 計算原始 Prompt 的顯示內容
  const getOriginalPromptDisplayContent = () => {
    if (!originalPrompt) return '';

    if (promptExpanded) {
      // 展開時顯示完整內容，不截斷
      return originalPrompt;
    } else {
      // 收起時顯示簡短內容
      const maxChars = 100;
      if (originalPrompt.length <= maxChars) {
        return originalPrompt;
      }
      return originalPrompt.substring(0, maxChars) + '...';
    }
  };

  // 判斷是否需要顯示展開/收起按鈕
  const shouldShowExpandButton = () => {
    if (!originalPrompt) return false;

    // 如果內容超過100字符或包含多行，顯示展開按鈕
    const hasLongContent = originalPrompt.length > 100;
    const hasMultipleLines = originalPrompt.includes('\n');

    return hasLongContent || hasMultipleLines;
  };

  // 計算定位，讓 overlay 出現在節點右側
  const getOverlayPosition = () => {
    return {
      left: nodePosition.x + offsetX,
      top: Math.max(nodePosition.y + offsetY, 20) // 確保不會超出視窗頂部
    };
  };

  // 動態計算 overlay 的高度
  const getOverlayHeight = () => {
    const headerHeight = 70; // Header 區域高度
    const originalPromptHeight = promptExpanded ? 400 : 160; // 原始 Prompt 區域高度（增加收起時的高度）
    const buttonAreaHeight = 80; // 按鈕區域高度
    const paddingAndMargins = 40; // 內邊距和邊距

    let contentHeight = 200; // 基礎內容區域高度

    // 如果有優化後的 Prompt，調整內容區域高度
    if (optimizedPrompt) {
      contentHeight = Math.max(150, 250); // 最小150px，預設250px
    }

    const totalHeight =
      headerHeight +
      originalPromptHeight +
      contentHeight +
      buttonAreaHeight +
      paddingAndMargins;
    const maxHeight = 800; // 最大高度限制

    return Math.min(totalHeight, maxHeight);
  };

  if (!isOpen) return null;

  const position = getOverlayPosition();
  const overlayHeight = getOverlayHeight();

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
        className='absolute bg-white rounded-lg shadow-xl w-96 flex flex-col pointer-events-auto border border-gray-200 z-10'
        style={{
          left: `${position.left}px`,
          top: `${position.top}px`,
          height: `${overlayHeight}px`,
          maxHeight: '800px'
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b border-gray-200 rounded-t-lg flex-shrink-0'>
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

        {/* 原始 Prompt 顯示區域 - 手風琴樣式 */}
        <div className='border-b border-gray-100 flex-shrink-0'>
          {/* 手風琴標題區域 */}
          <div
            className='relative flex items-center justify-between mt-2 cursor-pointer transition-colors'
            onClick={() => setPromptExpanded(!promptExpanded)}>
            {/* 右側箭頭 */}
            {shouldShowExpandButton() && (
              <svg
                className={`absolute right-7 top-3 w-5 h-5 text-gray-400 transition-transform duration-200 ${
                  promptExpanded ? 'rotate-180' : ''
                }`}
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 9l-7 7-7-7'
                />
              </svg>
            )}
          </div>

          {/* 手風琴內容區域 */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              promptExpanded ? 'max-h-80 opacity-100' : 'opacity-100'
            }`}
            style={{
              height: promptExpanded ? 'auto' : '120px'
            }}>
            <div className='px-4 pb-2 h-full'>
              <ScrollableTextArea
                className={`text-gray-400 text-sm leading-relaxed overflow-y-auto p-3 pl-1 pr-7 ${
                  promptExpanded ? 'max-h-64' : 'h-full'
                }`}>
                <pre className='whitespace-pre-wrap font-sans'>
                  {getOriginalPromptDisplayContent()}
                </pre>
              </ScrollableTextArea>
            </div>
          </div>
        </div>

        {/* 優化結果顯示區域 - 使用 flex-1 填充剩餘空間 */}
        <div className='flex-1 p-4 overflow-hidden flex flex-col min-h-0 justify-center'>
          {/* 如果還沒有優化結果，顯示生成按鈕 */}
          {!optimizedPrompt && !isLoading && !error && (
            <div className='flex items-center justify-center py-8'>
              <button
                onClick={handleGeneratePrompt}
                disabled={!originalPrompt || !llmId}
                className='px-4 py-2 text-white rounded-md bg-[#00ced1] hover:bg-[#00b8bb] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'>
                優化 Prompt
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
            <div className='flex flex-col h-full min-h-0'>
              <div className='flex items-center justify-between mb-3 flex-shrink-0'>
                <div className='text-sm font-bold text-gray-600'>
                  優化後的 Prompt：
                </div>
              </div>

              {/* 優化結果文字區域 - 使用可選取的文字區域 */}
              <div
                className='flex-1 mb-3'
                style={{ minHeight: '150px' }}>
                <SelectableTextArea className='h-full border border-gray-200 rounded-md p-3 overflow-y-auto bg-gray-50'>
                  <pre className='text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed select-text cursor-text'>
                    {optimizedPrompt}
                  </pre>
                </SelectableTextArea>
              </div>

              {/* 按鈕區域 - 固定在底部 */}
              <div className='flex space-x-2 justify-end flex-shrink-0'>
                <div className='group relative'>
                  <button
                    onClick={applyOptimizedPrompt}
                    className='px-3 py-1 bg-[#00ced1] hover:bg-[#00b8bb] text-white rounded-md transition-colors text-sm flex items-center space-x-1'>
                    <img
                      src={InsertIcon}
                      alt='Replace Icon'
                      className='text-white'
                      width={16}
                      height={16}
                    />
                    <span>取代</span>
                  </button>
                  {/* Tooltip */}
                  <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[10000]'>
                    取代
                    {/* 箭頭 */}
                    <div className='absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800'></div>
                  </div>
                </div>
                <div className='group relative'>
                  <button
                    onClick={copyToClipboard}
                    className='px-3 py-1  text-white rounded-md transition-colors text-sm flex items-center space-x-1'>
                    <img
                      src={CopytIncon}
                      alt='Copy Icon'
                      className='text-white'
                      width={16}
                      height={16}
                    />
                  </button>
                  {/* Tooltip */}
                  <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[10000]'>
                    複製
                    {/* 箭頭 */}
                    <div className='absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800'></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RefinePromptOverlay;
