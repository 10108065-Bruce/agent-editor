// TokenService.js 簡化版

class TokenService {
  constructor() {
    this.token = null;
    this.storageType = 'local'; // 默認使用 localStorage
    this.initToken();
  }

  initToken() {
    try {
      const storedToken = localStorage.getItem('access_token');
      if (storedToken) {
        this.token = storedToken;
        console.log('已從 localStorage 載入 API Token');
      }
    } catch (error) {
      console.error('初始化 token 失敗:', error);
    }
  }

  setToken(token, storageType = 'local') {
    if (!token) return;

    this.token = token;
    this.storageType = storageType;
    console.log(`API Token 已更新 (儲存類型: ${storageType})`);

    try {
      const storage = storageType === 'session' ? sessionStorage : localStorage;
      storage.setItem('access_token', token);
    } catch (error) {
      console.error('保存 token 到 localStorage 失敗:', error);
    }
  }

  getToken() {
    return this.token;
  }

  setWorkspaceId(workspaceId) {
    if (!workspaceId) return;

    try {
      localStorage.setItem('selected_workspace_id', workspaceId);
      console.log(`已設置工作區 ID: ${workspaceId}`);
    } catch (error) {
      console.error('保存工作區 ID 失敗:', error);
    }
  }

  getWorkspaceId() {
    try {
      return localStorage.getItem('selected_workspace_id');
    } catch (error) {
      console.error('讀取工作區 ID 失敗:', error);
      return null;
    }
  }

  createAuthHeader(options = {}) {
    // 嘗試獲取 token
    if (!this.token) {
      // 優先檢查 sessionStorage
      this.token = sessionStorage.getItem('access_token');
      // 如果 sessionStorage 中沒有，檢查 localStorage
      if (!this.token) {
        this.token = localStorage.getItem('access_token');
      }
    }

    if (!this.token) {
      return options;
    }

    const headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${this.token}`
    };

    return {
      ...options,
      headers
    };
  }
  /**
   * 創建帶有 workspace_id 的完整 URL
   * @param {string} baseUrl - 基礎 URL
   * @param {Object} params - 額外的查詢參數
   * @returns {string} 完整的 URL
   */
  createUrlWithWorkspace(baseUrl, params = {}) {
    const workspaceId = this.getWorkspaceId();

    // 創建 URL 對象
    const url = new URL(baseUrl);

    // 如果有 workspace_id，加入到查詢參數
    if (workspaceId) {
      url.searchParams.append('workspace_id', workspaceId);
    }

    // 加入其他參數
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.append(key, value);
      }
    });

    return url.toString();
  }
}

const tokenService = new TokenService();
export { tokenService };
