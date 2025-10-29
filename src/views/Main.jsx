import React, { useState, useEffect, useRef } from 'react';
import FlowEditor from './FlowEditor';
import IFrameFlowEditor from './IFrameFlowEditor';
import RunHistoryView from './RunHistoryView';
import logoQocaApa from '../assets/logo-qoca.png';
import { iframeBridge } from '../services/IFrameBridgeService';
import { tokenService } from '../services/TokenService';

const WorkflowContainer = () => {
  const [activeView, setActiveView] = useState('canvas');
  // Determine if we're running inside an iframe
  const [isInIframe, setIsInIframe] = useState(false);
  const [isNewFlow, setIsNewFlow] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // FlowEditor 的 ref
  const flowEditorRef = useRef(null);
  const iframeFlowEditorRef = useRef(null);

  useEffect(() => {
    // Check if we're in an iframe
    try {
      setIsInIframe(window.self !== window.top);
    } catch {
      // If accessing window.top throws an error due to same-origin policy,
      // we're definitely in an iframe
      setIsInIframe(true);
    }
  }, []);

  const handleFlowStatusChange = (isNew) => {
    setIsNewFlow(isNew);
  };

  // 處理還原版本
  const handleRestoreVersion = async () => {
    try {
      // 切換回 Canvas 視圖
      setActiveView('canvas');

      // 等待視圖切換完成
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 獲取正確的 ref
      const editorRef = isInIframe ? iframeFlowEditorRef : flowEditorRef;

      // 獲取當前的 workflow ID
      const workflowId = tokenService.getWorkFlowId();

      // 清空並重新載入 FlowEditor
      if (editorRef.current && editorRef.current.loadWorkflow) {
        await editorRef.current.loadWorkflow(workflowId);
      } else {
        console.warn(
          'FlowEditor ref 不可用，嘗試使用 reloadTrigger 強制重新渲染'
        );
        // 如果 ref 不可用，使用 reloadTrigger 強制重新渲染
        setReloadTrigger((prev) => prev + 1);
      }
    } catch (error) {
      console.error('處理還原版本失敗:', error);
    }
  };

  // 處理 logo 點擊
  const handleLogoClick = () => {
    if (isInIframe) {
      // 如果在 iframe 中，發送訊息給父頁面
      iframeBridge.sendToParent({
        type: 'NAVIGATE_TO_HOME',
        timestamp: new Date().toISOString()
      });
    } else {
      // 如果不在 iframe 中，直接導航
      window.location.href = '/workflows-management';
    }
  };

  return (
    <div className='w-full h-screen flex flex-col bg-white'>
      {/* Header */}
      <header className='h-16 border-b border-gray-200 px-6 flex items-center justify-between bg-[#f9fafb] shadow-sm'>
        <img
          onClick={handleLogoClick}
          src={logoQocaApa}
          alt='Logo'
          className='h-9 cursor-pointer'
        />
        {/* 左側：標題編輯區 */}
        <div className='flex items-center gap-3'></div>

        {/* 右側：切換按鈕 */}
        <div className='flex items-center'>
          <div className='inline-flex rounded-lg border border-gray-200 p-1 bg-gray-50'>
            <button
              onClick={() => setActiveView('canvas')}
              className={`px-10 py-1 rounded-md font-medium text-sm transition-all ${
                activeView === 'canvas'
                  ? 'bg-[#00ced1] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}>
              Canvas
            </button>
            <button
              onClick={() => !isNewFlow && setActiveView('history')}
              disabled={isNewFlow}
              className={`px-10 py-1 rounded-md font-medium text-sm transition-all ${
                isNewFlow
                  ? 'text-gray-400 cursor-not-allowed opacity-50 bg-gray-100'
                  : activeView === 'history'
                  ? 'bg-[#00ced1] text-white shadow-sm cursor-pointer'
                  : 'text-gray-600 hover:text-gray-800 cursor-pointer hover:bg-gray-50'
              }`}
              style={{ cursor: isNewFlow ? 'not-allowed' : 'pointer' }}>
              Run History
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className='flex-1 overflow-hidden relative'>
        {/* Canvas View - 始終保持在 DOM 中，只是用 CSS 控制顯示 */}
        <div
          className='w-full absolute inset-0'
          style={{
            height: 'calc(100vh - 64px)',
            display: activeView === 'canvas' ? 'block' : 'none'
          }}>
          {isInIframe ? (
            // If we're in an iframe, use the IFrameFlowEditor which has
            // the iframe communication functionality
            <IFrameFlowEditor
              ref={iframeFlowEditorRef}
              key={`iframe-editor-${reloadTrigger}`}
              onFlowStatusChange={handleFlowStatusChange}
            />
          ) : (
            // Otherwise, use the regular FlowEditor for standalone mode
            <FlowEditor
              ref={flowEditorRef}
              key={`flow-editor-${reloadTrigger}`}
            />
          )}
        </div>

        {/* Run History View */}
        <div
          className='w-full absolute inset-0'
          style={{
            height: 'calc(100vh - 64px)',
            display: activeView === 'history' ? 'block' : 'none'
          }}>
          {/* 使用 key 來強制重新渲染和執行 loadHistory */}
          {activeView === 'history' && (
            <RunHistoryView onRestoreVersion={handleRestoreVersion} />
          )}
        </div>
      </main>
    </div>
  );
};

export default WorkflowContainer;
