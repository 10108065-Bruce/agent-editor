import React, { useEffect, useState, useCallback, useRef } from 'react';
import FlowEditor from './FlowEditor';
import { iframeBridge } from '../services/IFrameBridgeService';

/**
 * 增強版 IFrameFlowEditor - 處理從母網站接收標題修改及下載JSON功能
 */
const IFrameFlowEditor = () => {
  // 流程標題
  const [flowTitle, setFlowTitle] = useState('APA 診間小幫手');
  // 流程編輯器引用
  const flowEditorRef = useRef(null);

  // 處理從父頁面接收標題變更
  const handleTitleChange = useCallback((title) => {
    if (title && typeof title === 'string') {
      console.log('從父頁面接收到新標題:', title);
      setFlowTitle(title);
    }
  }, []);

  // 處理下載請求
  const handleDownloadRequest = useCallback((options) => {
    console.log('收到下載請求:', options);

    // 檢查是否有流程編輯器引用
    if (flowEditorRef.current && flowEditorRef.current.exportFlowData) {
      // 調用 FlowEditor 的匯出函數
      const flowData = flowEditorRef.current.exportFlowData();

      // 根據標題和日期產生檔案名稱
      const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const safeTitle = (flowData.title || '未命名_流程').replace(/\s+/g, '_');
      const filename = `${safeTitle}_${date}.json`;

      // 發送數據至父頁面進行下載
      iframeBridge.requestDownload(flowData, filename);
    } else {
      console.warn('流程編輯器實例未準備好，無法處理下載請求');
    }
  }, []);

  // 當標題在編輯器中變更時通知父頁面
  const notifyTitleChanged = useCallback((title) => {
    iframeBridge.sendToParent({
      type: 'TITLE_CHANGED',
      title: title,
      timestamp: new Date().toISOString()
    });
  }, []);

  // 註冊事件處理器
  useEffect(() => {
    // 監聽來自服務的標題變更事件
    iframeBridge.on('titleChange', handleTitleChange);

    // 監聽下載請求事件
    iframeBridge.on('downloadRequest', handleDownloadRequest);

    // 清理函數
    return () => {
      iframeBridge.off('titleChange', handleTitleChange);
      iframeBridge.off('downloadRequest', handleDownloadRequest);
    };
  }, [handleTitleChange, handleDownloadRequest]);

  return (
    <div className='iframe-flow-editor-container'>
      <FlowEditor
        ref={flowEditorRef}
        initialTitle={flowTitle}
        onTitleChange={notifyTitleChanged}
      />
    </div>
  );
};

export default IFrameFlowEditor;

/**
 * 主要功能

流程編輯器包裝器：IFrameFlowEditor 是一個包裝 FlowEditor 組件的容器，增加了與父頁面通信的能力。
與父頁面通信：使用 iframeBridge 服務來處理 iframe 與父頁面之間的雙向通信。
標題同步：能夠從父頁面接收標題更新，並在本地標題變更時通知父頁面。
下載功能：處理來自父頁面的下載請求，將流程數據導出並發送回父頁面進行下載。

關鍵部分詳解
1. 狀態管理
flowTitle：存儲當前流程的標題，初始值為「APA 診間小幫手」
flowEditorRef：使用 React 的 useRef 鉤子來保存對 FlowEditor 組件的引用

2回調函數
handleTitleChange：處理從父頁面接收到的標題變更
handleDownloadRequest：處理父頁面發來的下載請求，包括：

3.調用流程編輯器的導出功能
基於流程標題和當前日期生成檔案名稱
將數據發送回父頁面進行下載


4.notifyTitleChanged：當本地流程標題變更時，通知父頁面

5.生命週期管理
使用 useEffect 鉤子在組件初始化時註冊事件監聽器，並在組件卸載時清理
監聽兩種事件：titleChange 和 downloadRequest


當一個網站想要嵌入流程編輯器功能，但又希望保持對編輯器的控制
當流程編輯器需要在一個受限的環境中運行，如第三方網站中的一個 iframe
當需要在父頁面中處理下載功能，而不是在 iframe 中直接實現下載
 */
