import React, { useEffect, useState, useCallback, useRef } from 'react';
import FlowEditor from './FlowEditor';
import { iframeBridge } from '../services/IFrameBridgeService';
import { tokenService } from '../services/TokenService';

/**
 * 增強版 IFrameFlowEditor - 處理從母網站接收標題修改及下載JSON功能
 * 並在收到 SET_TITLE 訊息時載入工作流數據
 */
const IFrameFlowEditor = () => {
  // 流程標題
  const [flowTitle, setFlowTitle] = useState('');
  // 流程編輯器引用
  const flowEditorRef = useRef(null);
  // 載入狀態
  const [isLoading, setIsLoading] = useState(false);
  // 錯誤狀態
  const [error, setError] = useState(null);
  // 追蹤事件處理器註冊狀態
  const eventsRegistered = useRef(false);

  // 處理從父頁面接收標題變更
  // const handleTitleChange = useCallback((title) => {
  //   if (title && typeof title === 'string') {
  //     console.log('IFrameFlowEditor: 從父頁面接收到新標題:', title);
  //     setFlowTitle(title);

  //     // 如果流程編輯器引用可用，也直接設置標題
  //     if (flowEditorRef.current && flowEditorRef.current.setFlowTitle) {
  //       console.log('IFrameFlowEditor: 直接設置流程編輯器標題:', title);
  //       flowEditorRef.current.setFlowTitle(title);
  //     } else {
  //       console.log('IFrameFlowEditor: 流程編輯器引用不可用，只更新狀態');
  //     }
  //   } else {
  //     console.warn('IFrameFlowEditor: 接收到無效標題:', title);
  //   }
  // }, []);

  // 處理從父頁面接收 token
  const handleTokenReceived = useCallback((data) => {
    console.log('IFrameFlowEditor: 從 Bridge 接收到 token');

    const { token, storage } =
      typeof data === 'object' ? data : { token: data, storage: 'local' };

    // 根據存儲類型選擇存儲位置
    const storageObj = storage === 'session' ? sessionStorage : localStorage;

    // 如果流程編輯器引用可用，直接設置 token
    if (flowEditorRef.current && flowEditorRef.current.setToken) {
      // flowEditorRef.current.setToken(token);
      tokenService.setToken(token, storage);
    } else {
      console.log('IFrameFlowEditor: 流程編輯器引用不可用，暫存 token');
      // 可以在這裡暫存 token，等編輯器準備好後再設置
      storageObj.setItem('pending_token', token);
      tokenService.setToken(token, storage);
    }
  }, []);

  const isLoadingRef = useRef(false);
  // 處理載入工作流
  const handleLoadWorkflow = useCallback(async (workflowId) => {
    console.log('IFrameFlowEditor: 處理載入工作流請求:', workflowId);

    // 防止重複執行
    if (isLoadingRef.current) {
      console.log('IFrameFlowEditor: 載入工作流已在進行中，忽略重複請求');
      return;
    }

    isLoadingRef.current = true;
    setIsLoading(true);

    try {
      if (flowEditorRef.current && flowEditorRef.current.loadWorkflow) {
        console.log('IFrameFlowEditor: 調用流程編輯器載入方法');
        const result = await flowEditorRef.current.loadWorkflow(workflowId);
        console.log('IFrameFlowEditor: 載入工作流結果:', result);

        // 移除額外的 updateNodeFunctions 調用，因為 loadWorkflow 內部已經處理了
      } else {
        console.warn(
          'IFrameFlowEditor: 流程編輯器實例未準備好，無法處理載入請求'
        );
        setError('流程編輯器未準備好');
      }
    } catch (err) {
      console.error('IFrameFlowEditor: 載入工作流時發生錯誤:', err);
      setError(err.message || '載入時發生未知錯誤');
    } finally {
      setIsLoading(false);
      // 確保無論成功失敗都重置標誌
      isLoadingRef.current = false;
    }
  }, []);

  // 處理下載請求
  const handleDownloadRequest = useCallback((options) => {
    console.log('IFrameFlowEditor: 收到下載請求:', options);

    // 檢查是否有流程編輯器引用
    if (flowEditorRef.current && flowEditorRef.current.exportFlowData) {
      // 調用 FlowEditor 的匯出函數
      const flowData = flowEditorRef.current.exportFlowData();
      console.log('IFrameFlowEditor: 已從編輯器匯出數據:', flowData);

      // 根據標題和日期產生檔案名稱
      const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const safeTitle = (flowData.title || '未命名_流程').replace(/\s+/g, '_');
      const filename = `${safeTitle}_${date}.json`;

      // 發送數據至父頁面進行下載
      const result = iframeBridge.requestDownload(flowData, filename);
      console.log('IFrameFlowEditor: 下載請求結果:', result);
    } else {
      console.warn(
        'IFrameFlowEditor: 流程編輯器實例未準備好，無法處理下載請求'
      );
    }
  }, []);

  // 當標題在編輯器中變更時通知父頁面
  // const notifyTitleChanged = useCallback((title) => {
  //   console.log('IFrameFlowEditor: 通知父頁面標題已變更:', title);

  //   iframeBridge.sendToParent({
  //     type: 'TITLE_CHANGED',
  //     title: title,
  //     timestamp: new Date().toISOString()
  //   });
  // }, []);

  // 註冊事件處理器
  useEffect(() => {
    console.log('IFrameFlowEditor: 註冊事件處理器');

    // 清理之前的事件處理器
    // iframeBridge.off('titleChange', handleTitleChange);
    iframeBridge.off('loadWorkflow', handleLoadWorkflow);
    iframeBridge.off('downloadRequest', handleDownloadRequest);
    iframeBridge.off('tokenReceived', handleTokenReceived);
    // 監聽來自服務的標題變更事件
    // iframeBridge.on('titleChange', handleTitleChange);

    // 監聽載入工作流事件
    iframeBridge.on('loadWorkflow', handleLoadWorkflow);

    // 監聽下載請求事件
    iframeBridge.on('downloadRequest', handleDownloadRequest);
    // 監聽來自服務的 token 變更事件
    iframeBridge.on('tokenReceived', handleTokenReceived);
    // 標記已註冊
    eventsRegistered.current = true;

    // 檢查是否有暫存的 token
    const pendingToken = localStorage.getItem('pending_token');
    if (
      pendingToken &&
      flowEditorRef.current &&
      flowEditorRef.current.setToken
    ) {
      flowEditorRef.current.setToken(pendingToken);
      localStorage.removeItem('pending_token');
    }

    // 清理函數
    return () => {
      console.log('IFrameFlowEditor: 移除事件處理器');
      // iframeBridge.off('titleChange', handleTitleChange);
      iframeBridge.off('loadWorkflow', handleLoadWorkflow);
      iframeBridge.off('downloadRequest', handleDownloadRequest);
      iframeBridge.off('tokenReceived', handleTokenReceived);
    };
    // 移除 flowTitle 依賴，只有在處理器函數變更時才重新註冊
  }, [handleLoadWorkflow, handleDownloadRequest, handleTokenReceived]);

  // 組件掛載後手動觸發一次 READY 消息，確保與父頁面的連接
  useEffect(() => {
    // 短暫延遲後重新發送 READY 消息
    const timeout = setTimeout(() => {
      console.log('IFrameFlowEditor: 重新發送 READY 消息');
      iframeBridge.sendToParent({
        type: 'READY',
        timestamp: new Date().toISOString()
      });
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className='iframe-flow-editor-container'>
      {/* {isLoading && (
        <div className='loading-overlay'>
          <div className='loading-spinner'>載入中...</div>
        </div>
      )} */}
      {error && <div className='error-message'>載入工作流失敗: {error}</div>}
      <FlowEditor
        ref={flowEditorRef}
        initialTitle={flowTitle}
        // onTitleChange={notifyTitleChanged}
      />
    </div>
  );
};

export default IFrameFlowEditor;
