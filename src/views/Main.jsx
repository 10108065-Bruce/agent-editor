import React, { useState, useEffect } from 'react';
import FlowEditor from './FlowEditor';
import IFrameFlowEditor from './IFrameFlowEditor';
import RunHistoryView from './RunHistoryView';
import logoQocaApa from '../assets/logo-qoca.png';

const WorkflowContainer = () => {
  const [activeView, setActiveView] = useState('canvas');
  // Determine if we're running inside an iframe
  const [isInIframe, setIsInIframe] = useState(false);
  const [isNewFlow, setIsNewFlow] = useState(false);

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

  return (
    <div className='w-full h-screen flex flex-col bg-white'>
      {/* Header */}
      <header className='h-16 border-b border-gray-200 px-6 flex items-center justify-between bg-[#f9fafb] shadow-sm'>
        <img
          src={logoQocaApa}
          alt='Logo'
          className='h-9'
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
            <IFrameFlowEditor onFlowStatusChange={handleFlowStatusChange} />
          ) : (
            // Otherwise, use the regular FlowEditor for standalone mode
            <FlowEditor />
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
          {activeView === 'history' && <RunHistoryView />}
        </div>
      </main>
    </div>
  );
};

export default WorkflowContainer;
