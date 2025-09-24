import React, { useEffect, useState, useCallback, useRef } from 'react';
import FlowEditor from './FlowEditor';
import { iframeBridge } from '../services/IFrameBridgeService';
import { tokenService } from '../services/TokenService';

/**
 * 增強版 IFrameFlowEditor - 改善資料驗證和 API 調用時機
 */
const IFrameFlowEditor = () => {
  // 狀態管理
  const [flowTitle, setFlowTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 引用管理
  const flowEditorRef = useRef(null);
  const eventsRegistered = useRef(false);
  const isLoadingRef = useRef(false);
  const dataValidationRef = useRef({
    hasToken: false,
    hasWorkspaceId: false,
    hasFlowId: false,
    allRequiredDataReceived: false
  });

  // 驗證必要資料是否齊全
  const validateRequiredData = useCallback((flowId = null) => {
    const token = tokenService.getToken();
    const workspaceId = tokenService.getWorkspaceId();

    const validation = {
      hasToken: !!token,
      hasWorkspaceId: !!workspaceId,
      hasFlowId: !!flowId,
      allRequiredDataReceived: false
    };

    // 對於新建流程，不需要 flowId
    if (flowId === 'new' || !flowId) {
      validation.allRequiredDataReceived =
        validation.hasToken && validation.hasWorkspaceId;
    } else {
      validation.allRequiredDataReceived =
        validation.hasToken &&
        validation.hasWorkspaceId &&
        validation.hasFlowId;
    }

    dataValidationRef.current = validation;

    console.log('IFrameFlowEditor: 資料驗證結果', {
      ...validation,
      token: token ? `${token.substring(0, 10)}...` : 'null',
      workspaceId,
      flowId: flowId || 'null'
    });

    return validation;
  }, []);

  // 處理從父頁面接收 token
  const handleTokenReceived = useCallback(
    (data) => {
      console.log('IFrameFlowEditor: 接收到 token 資料', {
        hasToken: !!data.token,
        storage: data.storage,
        hasWorkspaceId: !!data.selectedWorkspaceId
      });

      try {
        // 設置 token 和 workspace ID
        if (data.token) {
          tokenService.setToken(data.token, data.storage || 'local');
        }

        if (data.selectedWorkspaceId) {
          tokenService.setWorkspaceId(
            data.selectedWorkspaceId,
            data.storage || 'local'
          );
        }

        // 更新驗證狀態
        const validation = validateRequiredData();

        // call to load nodelist if token and workspaceId are present
        if (
          window.self !== window.top &&
          validation.hasToken &&
          validation.hasWorkspaceId &&
          flowEditorRef.current
        ) {
          flowEditorRef.current.reloadNodeList().catch(() => {
            setError('無法載入節點列表');
          });
        }

        // 發送確認消息
        iframeBridge.sendToParent({
          type: 'MESSAGE_ACKNOWLEDGED',
          originalType: 'SET_FLOW_ID_AND_TOKEN',
          timestamp: new Date().toISOString(),
          validation: validation
        });
      } catch (error) {
        console.error('IFrameFlowEditor: 處理 token 時發生錯誤:', error);
        setError('無法設置認證資訊');
      }
    },
    [validateRequiredData]
  );

  // 處理載入工作流
  const handleLoadWorkflow = useCallback(
    async (workflowId) => {
      console.log('IFrameFlowEditor: 處理載入工作流請求:', workflowId);

      // 防止重複執行
      if (isLoadingRef.current) {
        console.log('IFrameFlowEditor: 載入工作流已在進行中，忽略重複請求');
        return;
      }

      // 驗證必要資料
      const validation = validateRequiredData(workflowId);
      if (!validation.allRequiredDataReceived) {
        console.warn(
          'IFrameFlowEditor: 缺少必要資料，無法載入工作流',
          validation
        );

        // 等待一段時間後重試
        setTimeout(() => {
          const retryValidation = validateRequiredData(workflowId);
          if (retryValidation.allRequiredDataReceived) {
            console.log('IFrameFlowEditor: 重試載入工作流');
            handleLoadWorkflow(workflowId);
          } else {
            console.error('IFrameFlowEditor: 重試後仍缺少必要資料');
            setError('缺少必要的認證資訊，無法載入工作流');
          }
        }, 1000);

        return;
      }

      isLoadingRef.current = true;
      setIsLoading(true);
      setError(null);

      try {
        if (flowEditorRef.current && flowEditorRef.current.loadWorkflow) {
          console.log('IFrameFlowEditor: 開始載入工作流');

          // 確保 FlowEditor 已完全初始化
          if (typeof flowEditorRef.current.loadWorkflow === 'function') {
            const result = await flowEditorRef.current.loadWorkflow(workflowId);
            console.log('IFrameFlowEditor: 載入工作流結果:', result);

            // 發送載入完成確認
            iframeBridge.sendToParent({
              type: 'WORKFLOW_LOADED',
              workflowId: workflowId,
              success: !!result,
              timestamp: new Date().toISOString()
            });
          } else {
            throw new Error('FlowEditor loadWorkflow 方法不可用');
          }
        } else {
          console.warn('IFrameFlowEditor: FlowEditor 實例未準備好');
          setError('編輯器未準備好');

          // 等待 FlowEditor 準備好後重試
          setTimeout(() => {
            if (flowEditorRef.current) {
              handleLoadWorkflow(workflowId);
            }
          }, 1000);
        }
      } catch (err) {
        console.error('IFrameFlowEditor: 載入工作流時發生錯誤:', err);
        setError(err.message || '載入時發生未知錯誤');

        // 發送錯誤通知
        iframeBridge.sendToParent({
          type: 'WORKFLOW_LOAD_ERROR',
          workflowId: workflowId,
          error: err.message,
          timestamp: new Date().toISOString()
        });
      } finally {
        setIsLoading(false);
        isLoadingRef.current = false;
      }
    },
    [validateRequiredData]
  );

  // 處理保存工作流
  const handleSaveWorkflow = useCallback(async () => {
    console.log('IFrameFlowEditor: 處理保存工作流請求');

    // 防止重複執行
    if (isLoadingRef.current) {
      console.log('IFrameFlowEditor: 保存工作流已在進行中，忽略重複請求');
      return;
    }

    // 驗證必要資料
    const validation = validateRequiredData();
    if (!validation.hasToken || !validation.hasWorkspaceId) {
      console.warn(
        'IFrameFlowEditor: 缺少必要資料，無法保存工作流',
        validation
      );
      setError('缺少認證資訊，無法保存工作流');
      return;
    }

    isLoadingRef.current = true;
    setIsLoading(true);

    try {
      if (flowEditorRef.current && flowEditorRef.current.saveWorkflow) {
        const result = await flowEditorRef.current.saveWorkflow();
        console.log('IFrameFlowEditor: 保存工作流結果:', result);
      } else {
        console.warn(
          'IFrameFlowEditor: FlowEditor 實例未準備好，無法處理保存請求'
        );
        setError('編輯器未準備好');
      }
    } catch (err) {
      console.error('IFrameFlowEditor: 保存工作流時發生錯誤:', err);
      setError(err.message || '保存時發生未知錯誤');
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [validateRequiredData]);

  // 處理下載請求
  const handleDownloadRequest = useCallback((options) => {
    console.log('IFrameFlowEditor: 收到下載請求:', options);

    try {
      if (flowEditorRef.current && flowEditorRef.current.exportFlowData) {
        const flowData = flowEditorRef.current.exportFlowData();
        console.log('IFrameFlowEditor: 已從編輯器匯出數據');

        // 根據標題和日期產生檔案名稱
        const date = new Date().toISOString().split('T')[0];
        const safeTitle = (flowData.title || '未命名_流程').replace(
          /\s+/g,
          '_'
        );
        const filename = `${safeTitle}_${date}.json`;

        // 發送數據至父頁面進行下載
        const result = iframeBridge.requestDownload(flowData, filename);
        console.log('IFrameFlowEditor: 下載請求結果:', result);
      } else {
        console.warn(
          'IFrameFlowEditor: FlowEditor 實例未準備好，無法處理下載請求'
        );
        setError('編輯器未準備好，無法匯出資料');
      }
    } catch (error) {
      console.error('IFrameFlowEditor: 處理下載請求時發生錯誤:', error);
      setError('無法匯出流程資料');
    }
  }, []);

  // 確保 FlowEditor 準備就緒的函數
  const ensureFlowEditorReady = useCallback(() => {
    return new Promise((resolve) => {
      const checkReady = () => {
        if (flowEditorRef.current) {
          resolve(true);
        } else {
          setTimeout(checkReady, 100);
        }
      };
      checkReady();
    });
  }, []);

  // 註冊事件處理器
  useEffect(() => {
    console.log('IFrameFlowEditor: 註冊事件處理器');

    // 清理之前的事件處理器
    iframeBridge.off('loadWorkflow', handleLoadWorkflow);
    iframeBridge.off('downloadRequest', handleDownloadRequest);
    iframeBridge.off('tokenReceived', handleTokenReceived);
    iframeBridge.off('saveWorkflow', handleSaveWorkflow);

    // 註冊新的事件處理器
    iframeBridge.on('loadWorkflow', handleLoadWorkflow);
    iframeBridge.on('saveWorkflow', handleSaveWorkflow);
    iframeBridge.on('downloadRequest', handleDownloadRequest);
    iframeBridge.on('tokenReceived', handleTokenReceived);

    // 標記已註冊
    eventsRegistered.current = true;

    // 檢查是否有暫存的 token
    const pendingToken = localStorage.getItem('pending_token');
    if (pendingToken && flowEditorRef.current) {
      tokenService.setToken(pendingToken);
      localStorage.removeItem('pending_token');
    }

    // 清理函數
    return () => {
      console.log('IFrameFlowEditor: 移除事件處理器');
      iframeBridge.off('loadWorkflow', handleLoadWorkflow);
      iframeBridge.off('downloadRequest', handleDownloadRequest);
      iframeBridge.off('tokenReceived', handleTokenReceived);
      iframeBridge.off('saveWorkflow', handleSaveWorkflow);
      eventsRegistered.current = false;
    };
  }, [
    handleLoadWorkflow,
    handleDownloadRequest,
    handleTokenReceived,
    handleSaveWorkflow
  ]);

  // 組件掛載後手動觸發 READY 消息
  useEffect(() => {
    let readyTimer;
    // 延遲發送 READY 消息，確保與父頁面的連接
    readyTimer = setTimeout(() => {
      console.log('IFrameFlowEditor: 重新發送 READY 消息');
      iframeBridge.sendToParent({
        type: 'READY',
        timestamp: new Date().toISOString(),
        status: 'initialized'
      });
    }, 1000);

    return () => {
      if (readyTimer) clearTimeout(readyTimer);
    };
  }, [validateRequiredData]);

  // 監聽 FlowEditor 的變化，確保引用正確
  useEffect(() => {
    const checkFlowEditorRef = () => {
      if (flowEditorRef.current) {
        console.log('IFrameFlowEditor: FlowEditor 引用已就緒');

        // 驗證 FlowEditor 的必要方法
        const requiredMethods = [
          'loadWorkflow',
          'saveWorkflow',
          'exportFlowData'
        ];
        const missingMethods = requiredMethods.filter(
          (method) => typeof flowEditorRef.current[method] !== 'function'
        );

        if (missingMethods.length > 0) {
          console.warn(
            'IFrameFlowEditor: FlowEditor 缺少必要方法:',
            missingMethods
          );
        } else {
          console.log('IFrameFlowEditor: FlowEditor 所有必要方法已就緒');
        }
      }
    };

    // 延遲檢查，確保 FlowEditor 完全載入
    const timer = setTimeout(checkFlowEditorRef, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className='iframe-flow-editor-container'>
      {/* 錯誤顯示 */}
      {error && (
        <div
          className='error-message'
          style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            background: '#ff4444',
            color: 'white',
            padding: '10px',
            borderRadius: '4px',
            zIndex: 9999,
            maxWidth: '300px'
          }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
            載入錯誤
          </div>
          <div style={{ fontSize: '12px' }}>{error}</div>
          <button
            onClick={() => setError(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              float: 'right',
              cursor: 'pointer',
              fontSize: '16px',
              marginTop: '-20px'
            }}>
            ×
          </button>
        </div>
      )}

      {/* 載入指示器 */}
      {isLoading && (
        <div
          className='loading-indicator'
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '20px',
            borderRadius: '8px',
            zIndex: 9998,
            textAlign: 'center'
          }}>
          <div style={{ marginBottom: '10px' }}>載入中...</div>
          <div
            style={{
              width: '30px',
              height: '30px',
              border: '3px solid #333',
              borderTop: '3px solid #fff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
        </div>
      )}

      {/* FlowEditor 組件 */}
      <FlowEditor
        ref={flowEditorRef}
        initialTitle={flowTitle}
      />

      {/* CSS 動畫 */}
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default IFrameFlowEditor;
