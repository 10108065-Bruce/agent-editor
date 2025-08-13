/**
 * 增強版 IFrameBridgeService - 處理從母網站接收標題修改及下載JSON功能
 */
class IFrameBridgeService {
  constructor() {
    // 標記是否已初始化，防止重複初始化
    this.initialized = false;

    // 追蹤已註冊的事件處理函數
    this.eventHandlers = {
      titleChange: [],
      downloadRequest: [],
      loadWorkflow: [], // 新增載入工作流事件
      ready: [],
      tokenReceived: [],
      saveWorkflow: [],
      connectionEstablished: []
    };

    // 是否在 iframe 內部
    this.isInIframe = false;

    // 訊息處理相關
    this.messageQueue = [];
    this.isProcessingMessages = false;
    this.recentMessages = new Map();
    this.MESSAGE_CACHE_TIME = 2000; // 訊息緩存時間

    // 連接狀態
    this.connectionEstablished = false;
    this.parentOrigin = '*'; // 父頁面來源

    // 初始化
    this.init();
  }

  /**
   * 初始化通訊橋接器
   */
  init() {
    // 防止重複初始化
    if (this.initialized) return;
    this.initialized = true;

    try {
      this.isInIframe = window.self !== window.top;
    } catch {
      // 如果訪問window.top出現安全錯誤，則我們肯定在iframe中
      this.isInIframe = true;
    }

    if (this.isInIframe) {
      // 監聽來自父頁面的消息
      window.addEventListener(
        'message',
        this.handleIncomingMessage.bind(this),
        false
      );

      // 延遲發送準備好消息，確保事件監聽器已註冊
      setTimeout(() => {
        this.sendReadyMessage();
      }, 300); // 增加延遲時間
    } else {
      console.log('IFrameBridgeService 已初始化 - 在獨立模式中運行');
    }
  }

  /**
   * 發送準備好消息
   */
  sendReadyMessage() {
    this.sendToParent({
      type: 'READY',
      timestamp: new Date().toISOString(),
      capabilities: {
        messageHandling: true,
        workflowLoading: true,
        dataExport: true
      }
    });

    // 延遲觸發內部準備好事件，確保組件有時間註冊事件處理器
    setTimeout(() => {
      this.triggerEvent('ready', {
        timestamp: new Date().toISOString()
      });
    }, 100);
  }

  /**
   * 檢查訊息是否重複
   */
  isDuplicateMessage(message) {
    if (!message || !message.type) return false;

    const messageKey = `${message.type}-${message.timestamp || Date.now()}`;
    const now = Date.now();

    if (this.recentMessages.has(messageKey)) {
      const lastTime = this.recentMessages.get(messageKey);
      if (now - lastTime < this.MESSAGE_CACHE_TIME) {
        return true;
      }
    }

    this.recentMessages.set(messageKey, now);

    // 清理過期訊息
    this.cleanupRecentMessages(now);

    return false;
  }

  /**
   * 清理過期訊息記錄
   */
  cleanupRecentMessages(now) {
    this.recentMessages.forEach((timestamp, key) => {
      if (now - timestamp > this.MESSAGE_CACHE_TIME * 2) {
        this.recentMessages.delete(key);
      }
    });
  }

  /**
   * 將訊息加入處理佇列
   */
  queueMessage(message) {
    this.messageQueue.push({
      ...message,
      receivedAt: Date.now()
    });

    if (!this.isProcessingMessages) {
      this.processMessageQueue();
    }
  }

  /**
   * 處理訊息佇列
   */
  async processMessageQueue() {
    this.isProcessingMessages = true;

    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();

      try {
        await this.processMessage(message);

        // 短暫延遲，避免過於頻繁的處理
        await new Promise((resolve) => setTimeout(resolve, 50));
      } catch (error) {
        console.error('處理訊息時發生錯誤:', error);
      }
    }

    this.isProcessingMessages = false;
  }

  /**
   * 處理單個訊息
   */
  async processMessage(message) {
    console.log(`處理訊息: ${message.type}`, message);

    // 發送確認訊息
    this.sendAcknowledgment(message);

    // 根據訊息類型處理
    switch (message.type) {
      case 'PING':
        this.handlePingMessage(message);
        break;

      case 'SET_FLOW_ID':
        this.handleSetFlowId(message);
        break;

      case 'SET_FLOW_ID_AND_TOKEN':
        this.handleSetFlowIdAndToken(message);
        break;

      case 'SET_TITLE':
        this.handleSetTitle(message);
        break;

      case 'REQUEST_DATA_FOR_DOWNLOAD':
        this.handleDownloadRequest(message);
        break;

      case 'SAVE_WORKFLOW':
        this.handleSaveWorkflow(message);
        break;

      case 'READY_CHECK':
        this.handleReadyCheck(message);
        break;

      default:
        console.log(`收到未處理的訊息類型: ${message.type}`);
        break;
    }
  }

  /**
   * 發送確認訊息
   */
  sendAcknowledgment(originalMessage) {
    this.sendToParent({
      type: 'MESSAGE_ACKNOWLEDGED',
      originalType: originalMessage.type,
      originalTimestamp: originalMessage.timestamp,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 處理來自父頁面的消息
   */
  handleIncomingMessage(event) {
    try {
      const message = event.data;

      // 檢查消息結構
      if (!message || !message.type) {
        return;
      }

      // 記錄父頁面來源
      if (event.origin !== 'null') {
        this.parentOrigin = event.origin;
      }

      // 檢查是否是重複訊息
      if (this.isDuplicateMessage(message)) {
        console.log('偵測到重複訊息，跳過處理:', message.type);
        return;
      }

      // 將訊息加入處理佇列
      this.queueMessage(message);
    } catch (error) {
      console.error('處理來自父頁面的訊息時發生錯誤:', error);
    }
  }

  /**
   * 處理 PING 訊息
   */
  handlePingMessage(message) {
    // 立即回應PONG
    this.sendToParent({
      type: 'PONG',
      timestamp: new Date().toISOString(),
      originalPingTime: message.timestamp
    });

    // 同時重新發送READY消息以確保連接建立
    this.sendToParent({
      type: 'READY',
      timestamp: new Date().toISOString(),
      status: 'responding-to-ping'
    });

    // 標記連接已建立
    if (!this.connectionEstablished) {
      this.connectionEstablished = true;
      this.triggerEvent('connectionEstablished', {
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * 處理就緒檢查
   */
  handleReadyCheck(message) {
    console.log('收到 READY_CHECK，發送狀態回應');

    this.sendToParent({
      type: 'READY',
      timestamp: new Date().toISOString(),
      status: 'ready-check-response',
      originalMessage: message.timestamp
    });
  }

  /**
   * 處理設置 Flow ID
   */
  handleSetFlowId(message) {
    if (message.flowId) {
      const flowId = message.flowId;

      // 延遲觸發，確保所有必要資料都已設置
      setTimeout(() => {
        this.triggerEvent('loadWorkflow', flowId);
      }, 200);
    }
  }

  /**
   * 處理設置 Flow ID 和 Token
   */
  handleSetFlowIdAndToken(message) {
    if (message.flowId && message.token && message.selectedWorkspaceId) {
      const flowId = message.flowId;
      const selectedWorkspaceId = message.selectedWorkspaceId;

      // 先觸發 token 接收事件
      this.triggerEvent('tokenReceived', {
        token: message.token,
        storage: message.storage || 'local',
        selectedWorkspaceId
      });

      // 延遲觸發 loadWorkflow，確保 token 已設置
      setTimeout(() => {
        this.triggerEvent('loadWorkflow', flowId);
      }, 500);
    } else {
      console.warn('SET_FLOW_ID_AND_TOKEN 訊息缺少必要資料:', {
        hasFlowId: !!message.flowId,
        hasToken: !!message.token,
        hasWorkspaceId: !!message.selectedWorkspaceId
      });
    }
  }

  /**
   * 處理設置標題
   */
  handleSetTitle(message) {
    if (message.title) {
      // 觸發標題變更事件
      this.triggerEvent('titleChange', message.title);
    } else {
      console.warn('收到 SET_TITLE 消息，但標題為空');
    }
  }

  /**
   * 處理下載請求
   */
  handleDownloadRequest(message) {
    // 觸發下載請求事件
    this.triggerEvent('downloadRequest', message.options || {});
  }

  /**
   * 處理保存工作流
   */
  handleSaveWorkflow() {
    this.triggerEvent('saveWorkflow');
  }

  /**
   * 向父頁面發送消息
   */
  sendToParent(message) {
    if (!this.isInIframe) {
      console.warn('無法發送消息：未在 iframe 中運行');
      return false;
    }

    try {
      // 確保消息有時間戳
      message.timestamp = message.timestamp || new Date().toISOString();
      message.source = 'iframe-app';

      // 使用記錄的父頁面來源，或通配符
      const targetOrigin = this.parentOrigin || '*';

      window.parent.postMessage(message, targetOrigin);

      return true;
    } catch (error) {
      console.error('向父頁面發送消息時出錯:', error);
      return false;
    }
  }

  /**
   * 註冊事件處理程序
   */
  on(eventType, callback) {
    if (!this.eventHandlers[eventType]) {
      console.warn(`未知的事件類型: ${eventType}`);
      return false;
    }

    // 檢查是否已註冊相同的回調函數
    const isAlreadyRegistered = this.eventHandlers[eventType].some(
      (handler) => handler === callback
    );

    if (isAlreadyRegistered) {
      return false;
    }

    this.eventHandlers[eventType].push(callback);

    return true;
  }

  /**
   * 觸發特定事件的所有處理程序
   */
  triggerEvent(eventType, data) {
    if (!this.eventHandlers[eventType]) {
      console.warn(`未知的事件類型: ${eventType}`);
      return;
    }

    const handlers = this.eventHandlers[eventType];
    if (handlers.length === 0) {
      // 對於 ready 事件，如果沒有處理器，延遲重試
      if (eventType === 'ready') {
        setTimeout(() => {
          const retryHandlers = this.eventHandlers[eventType];
          if (retryHandlers.length > 0) {
            this.triggerEventWithHandlers(eventType, data, retryHandlers);
          } else {
            console.log(`${eventType} 事件延遲重試後仍無處理程序，跳過`);
          }
        }, 500);
      } else {
        console.warn(`觸發 ${eventType} 事件，但沒有註冊的處理程序`);
      }
      return;
    }

    this.triggerEventWithHandlers(eventType, data, handlers);
  }

  /**
   * 執行事件處理器
   */
  triggerEventWithHandlers(eventType, data, handlers) {
    handlers.forEach((handler, index) => {
      try {
        handler(data);
      } catch (error) {
        console.error(
          `執行 ${eventType} 事件處理程序 #${index + 1} 時出錯:`,
          error
        );
      }
    });
  }

  /**
   * 取消註冊事件處理程序
   */
  off(eventType, callback) {
    if (!this.eventHandlers[eventType]) {
      console.warn(`未知的事件類型: ${eventType}`);
      return false;
    }

    const initialLength = this.eventHandlers[eventType].length;
    this.eventHandlers[eventType] = this.eventHandlers[eventType].filter(
      (handler) => handler !== callback
    );

    const removed = initialLength !== this.eventHandlers[eventType].length;
    if (removed) {
      console.log(
        `已移除 ${eventType} 事件處理程序，當前處理程序數量: ${this.eventHandlers[eventType].length}`
      );
    } else {
      console.warn(`嘗試移除未找到的 ${eventType} 事件處理程序`);
    }

    return removed;
  }

  /**
   * 向父頁面發送JSON數據以進行下載
   */
  requestDownload(data, filename) {
    if (!this.isInIframe) {
      console.warn('無法請求下載：未在 iframe 中運行');
      return false;
    }

    try {
      // 創建可序列化的數據副本
      const serializableData = JSON.parse(JSON.stringify(data));

      this.sendToParent({
        type: 'DOWNLOAD_JSON',
        data: serializableData,
        filename: filename,
        timestamp: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.error('發送下載請求時出錯:', error);
      return false;
    }
  }

  /**
   * 獲取連接狀態
   */
  getConnectionStatus() {
    return this.connectionEstablished;
  }

  /**
   * 清理和銷毀服務
   */
  destroy() {
    console.log('正在銷毀 IFrameBridgeService...');

    // 移除事件監聽器
    window.removeEventListener('message', this.handleIncomingMessage);

    // 清理所有事件處理程序
    Object.keys(this.eventHandlers).forEach((eventType) => {
      this.eventHandlers[eventType] = [];
    });

    // 清理訊息佇列和緩存
    this.messageQueue = [];
    this.recentMessages.clear();

    // 重置狀態
    this.initialized = false;
    this.connectionEstablished = false;
    this.isProcessingMessages = false;

    console.log('IFrameBridgeService 已成功銷毀');
  }
}

// 創建單例實例
const iframeBridge = new IFrameBridgeService();
export { iframeBridge };
