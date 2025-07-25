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
      saveWorkflow: [] // 新增保存工作流事件
    };

    // 是否在 iframe 內部
    this.isInIframe = false;

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

      // 通知父頁面我們已準備好
      this.sendToParent({
        type: 'READY',
        timestamp: new Date().toISOString()
      });

      // 觸發內部準備好事件
      this.triggerEvent('ready', {
        timestamp: new Date().toISOString()
      });

      console.log('IFrameBridgeService 已初始化 - 在 iframe 模式中運行');
    } else {
      console.log('IFrameBridgeService 已初始化 - 在獨立模式中運行');
    }
  }

  /**
   * 處理來自父頁面的消息
   * @param {MessageEvent} event - 消息事件對象
   */
  handleIncomingMessage(event) {
    const message = event.data;

    // 檢查消息結構
    if (!message || !message.type) {
      return;
    }

    console.log('收到消息:', message);

    // 根據消息類型處理
    switch (message.type) {
      case 'PING':
        // 立即回應PONG
        this.sendToParent({
          type: 'PONG',
          timestamp: new Date().toISOString()
        });

        // 同時重新發送READY消息以確保連接建立
        this.sendToParent({
          type: 'READY',
          timestamp: new Date().toISOString()
        });
        break;
      case 'SET_FLOW_ID':
        if (message.flowId) {
          const flowId = message.flowId;
          // 更詳細的日誌，顯示將要觸發的事件類型和數據
          console.log(`準備觸發 loadWorkflow 事件，流ID: "${flowId}"`);
          console.log(
            `註冊的 loadWorkflow 處理程序數量: ${this.eventHandlers.loadWorkflow.length}`
          );

          // 觸發流ID變更事件
          this.triggerEvent('loadWorkflow', flowId);
        }
        break;
      case 'SET_FLOW_ID_AND_TOKEN':
        if (
          message.flowId &&
          message.token &&
          message.storage &&
          message.selectedWorkspaceId
        ) {
          console.log(
            `接收到 API Token (存儲類型: ${message.storage || 'local'})`
          );

          const flowId = message.flowId;
          const selectedWorkspaceId = message.selectedWorkspaceId;
          // 更詳細的日誌，顯示將要觸發的事件類型和數據
          console.log(`準備觸發 tokenReceived 事件，流ID: "${flowId}"`);
          console.log(
            `註冊的 tokenReceived 處理程序數量: ${this.eventHandlers.tokenReceived.length}`
          );
          // const storage =
          //   message.storage === 'session' ? sessionStorage : localStorage;
          // storage.setItem('api_token', message.token);
          this.triggerEvent('tokenReceived', {
            token: message.token,
            storage: message.storage || 'local',
            selectedWorkspaceId
          });
          setTimeout(() => {
            // 觸發流ID變更事件
            console.log(`準備觸發 loadWorkflow 事件，流ID: "${flowId}"`);
            this.triggerEvent('loadWorkflow', flowId);
          }, 500);
        }
        break;

      case 'SET_TITLE':
        if (message.title) {
          // 更詳細的日誌，顯示將要觸發的事件類型和數據
          console.log(`準備觸發 titleChange 事件，標題值: "${message.title}"`);
          console.log(
            `註冊的 titleChange 處理程序數量: ${this.eventHandlers.titleChange.length}`
          );

          // 觸發標題變更事件
          // this.triggerEvent('titleChange', message.title);

          // 如果標題可作為工作流ID，觸發載入工作流事件
          // const workflowId = message.title;
          // console.log(`準備觸發 loadWorkflow 事件，工作流ID: "${workflowId}"`);
          // console.log(
          //   `註冊的 loadWorkflow 處理程序數量: ${this.eventHandlers.loadWorkflow.length}`
          // );

          // if (workflowId) {
          //   this.triggerEvent('loadWorkflow', workflowId);
          // }
        } else {
          console.warn('收到 SET_TITLE 消息，但標題為空');
        }
        break;

      case 'REQUEST_DATA_FOR_DOWNLOAD':
        // 日誌顯示下載請求事件
        console.log(
          `準備觸發 downloadRequest 事件，選項:`,
          message.options || {}
        );
        console.log(
          `註冊的 downloadRequest 處理程序數量: ${this.eventHandlers.downloadRequest.length}`
        );

        // 觸發下載請求事件
        this.triggerEvent('downloadRequest', message.options || {});
        break;
      // save workflow
      case 'SAVE_WORKFLOW':
        console.log('收到 SAVE_WORKFLOW 消息，將觸發 saveWorkflow 事件');
        this.triggerEvent('saveWorkflow');
        break;
      default:
        console.log(`收到未處理的消息類型: ${message.type}`);
        break;
    }
  }

  /**
   * 向父頁面發送消息
   * @param {Object} message - 要發送的消息對象
   */
  sendToParent(message) {
    if (!this.isInIframe) {
      console.warn('無法發送消息：未在 iframe 中運行');
      return false;
    }

    try {
      window.parent.postMessage(message, '*');
      console.log(`已向父頁面發送消息: ${message.type}`, message);
      return true;
    } catch (error) {
      console.error('向父頁面發送消息時出錯:', error);
      return false;
    }
  }

  /**
   * 註冊事件處理程序
   * @param {string} eventType - 事件類型
   * @param {Function} callback - 回調函數
   * @returns {boolean} - 是否成功註冊
   */
  on(eventType, callback) {
    if (!this.eventHandlers[eventType]) {
      console.warn(`未知的事件類型: ${eventType}`);
      return false;
    }

    this.eventHandlers[eventType].push(callback);
    console.log(
      `已註冊 ${eventType} 事件處理程序，當前處理程序數量: ${this.eventHandlers[eventType].length}`
    );
    return true;
  }

  /**
   * 觸發特定事件的所有處理程序
   * @param {string} eventType - 事件類型
   * @param {*} data - 要傳遞給處理程序的數據
   */
  triggerEvent(eventType, data) {
    if (!this.eventHandlers[eventType]) {
      console.warn(`未知的事件類型: ${eventType}`);
      return;
    }

    if (this.eventHandlers[eventType].length === 0) {
      console.warn(`觸發 ${eventType} 事件，但沒有註冊的處理程序`);
      return;
    }

    console.log(
      `正在觸發 ${eventType} 事件，處理程序數量: ${this.eventHandlers[eventType].length}`
    );

    this.eventHandlers[eventType].forEach((handler, index) => {
      try {
        console.log(`執行 ${eventType} 事件處理程序 #${index + 1}`);
        handler(data);
        console.log(`${eventType} 事件處理程序 #${index + 1} 執行成功`);
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
   * @param {string} eventType - 事件類型
   * @param {Function} callback - 要移除的回調函數
   * @returns {boolean} - 是否成功取消註冊
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
   * @param {Object} data - 要下載的JSON數據
   * @param {string} filename - 檔案名稱
   * @returns {boolean} - 是否成功發送下載請求
   */
  requestDownload(data, filename) {
    if (!this.isInIframe) {
      console.warn('無法請求下載：未在 iframe 中運行');
      return false;
    }
    // Create a clean, serializable copy of the data
    const serializableData = JSON.parse(JSON.stringify(data));
    try {
      this.sendToParent({
        type: 'DOWNLOAD_JSON',
        data: serializableData,
        filename: filename,
        timestamp: new Date().toISOString()
      });

      console.log('已向父頁面發送下載請求', { filename });
      return true;
    } catch (error) {
      console.error('發送下載請求時出錯:', error);
      return false;
    }
  }
}

// 創建單例實例
const iframeBridge = new IFrameBridgeService();
export { iframeBridge };
